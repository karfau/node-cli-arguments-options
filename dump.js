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
        acc[cur] = execJson(`node ./${pkg}/dump.js ${cur}`)
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
