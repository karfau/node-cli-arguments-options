const axios = require('axios')
const camelcase = require('camelcase')
const {readJsonSync} = require('fs-extra/lib/json')
const {get, pickBy} = require('lodash/object')
const {join} = require('path')
const {hasStrict} = require('tcompare')

const {cached, TODAY} = require('./cache')
const {execJson} = require('./execJSON')
const {createValidator, FN_FEATURES_JSON, walkFeatureSchema} = require('./features')
const {forEach} = require('./iterate')

const CHECKMARK = '✓'
const FeatureCollector = {
  onPath: (/*pkg, scope, path*/) => {
    return []
  },
  onObject: (value, scope, path, traverse) => {
    return Object.entries(scope.properties).reduce(
      (acc, [prop, next]) => ([...acc, ...traverse(next, [...path, prop])]),
      value
    )
  },
  onFeature: (value, scope, path/*, traverse*/) => {
    value.push([path, scope.description || 'no description'])
    return value
  },
}

function logFeature (path, status, {error = [], info = [], warn = []} = {}) {
  if (isWatchMode() && error.length === 0 && warn.length === 0) return
  console.error(' ', path.join(' > '), status ? `(${status})` : '')
  error.forEach(it => console.error('   X', it))
  warn.forEach(it => console.error('   ?', it))
  info.forEach(it => console.error('  ', it))
}

const hasCommentsOrRefs = ({comments, references}) =>
  (comments && comments.length) || (references && references.length)

const verifyBooleanSpec = (spec, key, lines) => {
  if (key in spec) {
    if (hasCommentsOrRefs(spec)) {
      lines.info(`${key}`)
    } else if (spec[key] === false) {
      lines.warn(`${key} (without references)`)
    } else {
      lines.error(`${key} feature missing 'comments' or 'references'`)
    }
  }
}

const referenceReachable = cached([__filename, TODAY], async (url) =>
  (await axios.head(url, {validateStatus: s => s < 400})).status)

const verifyRefs = async (refs = [], lines) => {
  let result = true
  for (const ref of refs) {
    try {
      await referenceReachable(ref)
    } catch (err) {
      result = false
      lines.error(`reference not reachable: "${ref}" (${err.message})`)
    }
  }
  if (refs.length && result) {
    lines.info(`${refs.length} references reachable`)
  }
}

function assertExpectedString (actual, expected) {
  const msg = (e = expected) => `expected "${e}" but was "${String(actual).replace(/\n/g, '\\n')}"`
  if (!actual) throw new Error(`${msg()} (empty)`)
  if (expected === '') throw new Error(msg())
  const [, regex, flags] = /^\/(.*)\/([a-z]*)$/.exec(expected) || []
  const matches = regex ? RegExp(regex, flags).test(actual) : actual.includes(expected)
  if (!matches) throw new Error(
    msg(regex ? `RegExp(${RegExp(regex, flags)})` : expected)
  )
}

const verifyExecutableSpec = (pkg, spec, key, reporter) => {
  if (spec[key]) {
    const entries = Object.entries(spec[key])
    if (entries.length === 0) {
      reporter.warn(`${key} (without spec)`)
      return
    }
    for (const [cmd, expected] of entries) {
      const prefix = `${key}::"${cmd}"`
      const safePkg = camelcase(pkg)
      const executable = cmd.startsWith(`${safePkg}.`) || cmd.startsWith(`${safePkg}(`)
        ? `node -e 'const ${safePkg} = require("${pkg}"); console.log(JSON.stringify(${cmd.replace(/'/g, '"')}))'`
        : cmd
      const result = execJson(executable, {cwd: join('.', pkg)})
      if (typeof expected === 'string') {
        try {
          assertExpectedString(result.stdout, expected)
          reporter.info(prefix)
        } catch (err) {
          reporter.error(`${prefix}: ${err.message}`, JSON.stringify(result))
        }
      } else {
        if (Object.keys(expected).length === 0) {
          reporter.warn(cmd,`  wrapped: ${executable}`, `  returned: ${JSON.stringify(result)}`)
          continue
        }
        const checkable = result
        if (typeof expected.stdout === 'string') {
          try {
            assertExpectedString(result.stdout, expected.stdout)
            reporter.info(`${prefix}: (stdout)`)
            delete checkable.stdout
            delete expected.stdout
          } catch (err) {
            reporter.error(`${prefix}: (stdout) ${err.message}`)
          }
        }
        if (typeof expected.stderr === 'string') {
          try {
            assertExpectedString(result.stderr, expected.stderr)
            reporter.info(`${prefix}: (stderr)`)
            delete checkable.stderr
            delete expected.stderr
          } catch (err) {
            reporter.error(`${prefix}: (stderr) ${err.message}`)
          }
        }

        const keysLeft = Object.keys(expected)
        if (keysLeft.length) {
          const {match, diff} = hasStrict(checkable, expected)
          if (match) {
            reporter.info(`${prefix}: (${keysLeft.join(',')})`)
          } else {
            reporter.error(
              `${prefix}: diff`, diff,`  execJson: ${JSON.stringify(checkable)}`
            )
          }
        }
      }
    }
  }
}

function isWatchMode() {
  return process.env.npm_lifecycle_event === 'dev'
}
const Reporter = () => {
  const failed = [], specified = [], verified = []
  return {
    error: failed.push.bind(failed),
    warn: specified.push.bind(specified),
    info: verified.push.bind(verified),
    failed: () => failed.length,
    specified: () => specified.length,
    verified: () => verified.length,
    log: (path, collector) => {
      const status = failed.length ? 'failed' :
        specified.length ? 'specified' :
          verified.length ? 'verified' :
            'unspecified'
      collector[status]++
      collector.checks += verified.length
      if (isWatchMode() && failed.length === 0 && specified.length === 0) return
      console.error(' ', path.join(' > '), `(${status})`)
      failed.forEach(it => console.error('  ', 'X', it))
      specified.forEach(it => console.error('  ', '?', it))
      verified.forEach(it => console.error('  ', CHECKMARK, it))
    }
  }
}

const createVerify = (validateJson) => {
  const availableFeatures = walkFeatureSchema(FeatureCollector)('')
  return async function verifyFeatures (pkg) {
    const report = {
      features: availableFeatures.length,
      failed: 0, unspecified: 0, specified: 0, verified: 0,
      checks: 0
    }
    const fnPkgFeatures = join('.', pkg, FN_FEATURES_JSON)
    const pkgFeatures = readJsonSync(fnPkgFeatures)

    if (!validateJson(pkgFeatures)) {
      console.log(`invalid features file`, fnPkgFeatures)
      validateJson.errors.forEach((it, i) => console.error(i, it))
      report.errors += validateJson.errors.length
      console.log(`(tests are run anyway, but report will contain errors)`)
    }
    for (const [path, desciption] of availableFeatures) {
      const {$comment, missing, ...spec} = get(pkgFeatures, path, {
        $comment: desciption,
        missing: true
      })
      if (missing || Object.keys(spec).length === 0) {
        report.unspecified++
        logFeature(path, missing ? 'missing' : 'unspecified')
        continue
      }
      const reporter = Reporter()
      verifyBooleanSpec(spec, 'mandatory', reporter)
      verifyBooleanSpec(spec, 'unsupported', reporter)
      await verifyRefs(spec.references, reporter)
      Object.keys(spec)
        .filter(key =>
          key !== 'mandatory' && key !== 'unsupported' && key !== 'references' && key !== 'comments'
        )
        .forEach(key => verifyExecutableSpec(pkg, spec, key, reporter))

      reporter.log(path, report)
    }
    return report
  }
}

async function run (...args) {
  const verifyFeatures = createVerify(createValidator)
  let unspecifiedSum = 0, specifiedSum = 0, verifiedSum = 0
  await forEach(
    // first failing package will stop checks for more packages
    // since it's easy to run them individually or all at once
    async function testFeatures (pkg) {
      const report = await verifyFeatures(pkg)
      console.error(JSON.stringify(pickBy(report, it => it)))
      const {features, failed, unspecified, specified, verified} = report
      if (failed > 0) {
        throw `There have been ${failed} errors when verifying features of ${pkg}`
      }
      const tested = verified + unspecified + specified
      if (tested < features) {
        throw `only ${tested} of ${features} features have been tested`
      }
      verifiedSum += verified
      specifiedSum += specified
      unspecifiedSum += unspecified
    },
    args
  )
  if (args.length !== 1) {
    return {unspecifiedSum, specifiedSum, verifiedSum}
  }

}

module.exports = {
  run
}
