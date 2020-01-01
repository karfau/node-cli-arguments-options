const {execSync} = require('child_process')
const dumps = require('./dump.json')
const {existsSync, readdirSync} = require('fs')
const {writeJsonSync} = require('fs-extra')
const path = require('path')

function execDump (pkg, args) {
  let stderr, stdout = ''
  let duration = NaN, exitCode = undefined
  const start = process.hrtime.bigint()
  try {
    stdout = execSync(`node ./${pkg}/dump.js ${args}`, {encoding: 'utf8', stdio: 'pipe'})
  } catch (err) {
    exitCode = err.status
    stderr = err.stderr
    stdout = err.stdout
  }
  duration = (process.hrtime.bigint() - start).toString()
  let data = {};
  try {
    data = JSON.parse(stdout)
  } catch (err) {
    data.error = err.message
  }
  return {duration: duration.toString(), exitCode, stderr, data}
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
