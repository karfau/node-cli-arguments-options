const {writeJsonSync} = require('fs-extra')
const path = require('path')
const {execJson} = require('./execJSON')
const {forEach, packagesIn} = require('./iterate')
const axios = require('axios')

const cache = {}
async function headContentLength(url) {
  if (cache[url]) {
    return cache[url]
  }
  const size = parseInt((await axios.head(url)).headers['content-length'])
  cache[url] = size
  return size
}

async function dependencies (pkg) {
  const list = packagesIn('.', pkg, 'node_modules');
  const infos = list.map(p => eval(`(${execJson(`npm info ${p} .`).stdout.trim()})`))
  const outdated = infos.filter(i => i.version !== (i['dist-tags'] && i['dist-tags'].latest));
  let size = 0
  for (const {dist} of infos) {
    size += await headContentLength(dist.tarball)
  }
  return {list, outdated, size}
}

async function runPkg (pkg) {
  writeJsonSync(
    path.join(pkg, 'about.json'),
    {
      dependencies: await dependencies(pkg)
    },
    {spaces: 2}
  )
}

function run (...args) {
  return forEach(runPkg, args)
}

module.exports = {
  run
}

