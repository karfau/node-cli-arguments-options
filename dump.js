const dumps = require('./dump.json')
const {writeJsonSync} = require('fs-extra')
const path = require('path')
const {forEach} = require('./iterate')
const {execJson} = require('./execJSON')

function runPkg (pkg) {
  writeJsonSync(
    path.join(pkg, 'dump.report.json'),
    dumps.reduce(
      (acc, cur) => {
        const raw = execJson(`node ./${pkg}/dump.js ${cur}`)
        const data = {}
        const hasOptions = raw.value && raw.value.options;
        const hasArguments = raw.value && raw.value.arguments;
        if (hasArguments) {
          data.arguments = raw.value.arguments
        }
        if (hasOptions) {
          data.options = raw.value.options
        }
        if (!hasOptions || !hasArguments) {
          data.raw = raw;
        }
        if (raw.exitCode) {
          data.stderr = raw.stderr
          data.exitCode = raw.exitCode
        }
        acc[cur] = data
        return acc
      },
      {}
    ),
    {spaces: 2}
  )
}

async function run (...args) {
  return forEach(runPkg, args)
}

module.exports = {
  run
}
