const {execSync} = require('child_process')
const dumps = require('./dump.json')
const {existsSync, readdirSync} = require('fs')
const {writeJsonSync} = require('fs-extra')
const path = require('path')

function execDump (pkg, args) {
  let stderr = '', stdout = ''
  let duration = NaN, exitCode = 0
  const start = process.hrtime.bigint()
  try {
    const cp = execSync(`node ./${pkg}/dump.js ${args}`, {encoding: 'utf8'})
    // console.error(cp.stdout)
    stderr = cp.stderr
    stdout = cp.stdout
  } catch (err) {
    exitCode = err.status
    stderr = err.stderr
    stdout = err.stdout
    // console.error(err)
  }
  duration = process.hrtime.bigint() - start
  return {duration: duration.toString(), exitCode, stderr, data: JSON.parse(stdout)}
}

function runPkg (pkg) {
  writeJsonSync(
    path.join(pkg, 'dump.report.json'),
    dumps.reduce(
      (acc, cur) => {
        acc[cur] = execDump(pkg, cur)
        return acc
      },
      {}
    ),
    {spaces: 2}
  )
}

function run (...args) {
  if (args.length === 0) {
    args = readdirSync('.', 'utf8').filter(c => existsSync(path.join('.', c, 'package.json')))
  }
  args.forEach(runPkg)
}

module.exports = {
  run
}
