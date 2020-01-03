const {writeJsonSync} = require('fs-extra')
const path = require('path')
const {execJson} = require('./execJSON')
const {forEach, packagesIn} = require('./iterate')
const axios = require('axios')
const {cached} = require('./cache')
const {pathExistsSync} = require('fs-extra')

async function headContentLength (url) {
  return parseInt((await axios.head(url)).headers['content-length'])
}

const NODE_MODULES = 'node_modules'

function npmPackageInfo(p) {
  return eval(`(${execJson(`npm info ${p} .`).stdout.trim()})`)
}

async function depInfo (pkg) {
  const usedIn = packagesIn('.') // TODO check inside prominent cli tools?
    .filter(name => name !== pkg && pathExistsSync(path.join('.', name, NODE_MODULES, pkg)))
  const deps = packagesIn('.', pkg, NODE_MODULES)
  const outdated = []
  let size = 0
  for (const dep of deps) {
    // TODO add version to cache key?
    const {dist, name, version, ...info} = await cached(__filename, npmPackageInfo, dep)
    const latest = info['dist-tags'] && info['dist-tags'].latest
    if (version !== latest) {
      outdated.push(`${name}@${version}...${latest}`)
    }
    size += await cached(__filename, headContentLength, dist.tarball)
  }
  return {deps, outdated, size, usedIn}
}

async function runPkg (pkg) {
  const dependencies = await depInfo(pkg)
  console.log(JSON.stringify(dependencies, null, 2))
  writeJsonSync(
    path.join(pkg, 'about.json'),
    {dependencies},
    {spaces: 2}
  )
}

function run (...args) {
  return forEach(runPkg, args)
}

module.exports = {
  run
}

