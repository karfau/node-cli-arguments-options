const {writeJsonSync} = require('fs-extra')
const path = require('path')
const {execJson} = require('./execJSON')
const {forEach, packagesIn} = require('./iterate')
const axios = require('axios')
const {pathExistsSync} = require('fs-extra')

const cache = {}
async function headContentLength(url) {
  if (cache[url]) {
    return cache[url]
  }
  const size = parseInt((await axios.head(url)).headers['content-length'])
  cache[url] = size
  return size
}

const NODE_MODULES = 'node_modules'
async function depInfo (pkg) {
  const usedIn = packagesIn('.') // TODO check inside prominent cli tools?
    .filter(name => name !== pkg && pathExistsSync(path.join('.', name, NODE_MODULES, pkg)))
  const deps = packagesIn('.', pkg, NODE_MODULES);
  const infos = deps.map(p => eval(`(${execJson(`npm info ${p} .`).stdout.trim()})`))
  const outdated = [];
  let size = 0
  for (const {dist, name, version, ...info} of infos) {
    const latest = info['dist-tags'] && info['dist-tags'].latest;
    if (version !== latest) {
      outdated.push(`${name}@${version}...${latest}`)
    }
    size += await headContentLength(dist.tarball)
  }
  return {deps, outdated, size, usedIn}
}

async function runPkg (pkg) {
  const dependencies = await depInfo(pkg)
  console.log(JSON.stringify(dependencies, null, 2));
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

