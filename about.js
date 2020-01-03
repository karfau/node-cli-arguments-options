const axios = require('axios')
const {existsSync, readJson, writeJsonSync} = require('fs-extra')
const path = require('path')
const {cached} = require('./cache')
const {execJson} = require('./execJSON')
const {forEach, packagesIn} = require('./iterate')

async function headContentLength (url) {
  return parseInt((await axios.head(url)).headers['content-length'])
}

const NODE_MODULES = 'node_modules'

function npmPackageInfo(p) {
  return eval(`(${execJson(`npm info ${p} .`).stdout.trim()})`)
}

const TODAY = new Date().toISOString().substr(0, 10)

async function depInfo (pkg) {
  const usedIn = packagesIn('.') // TODO check inside prominent cli tools?
    .filter(name => name !== pkg && existsSync(path.join('.', name, NODE_MODULES, pkg)))
  const deps = packagesIn('.', pkg, NODE_MODULES)

  const locked = (await readJson(path.join('.', pkg, 'package-lock.json'))).dependencies
  const outdated = []
  let size = 0
  for (const dep of deps) {
    const {version, resolved} = locked[dep]
    const {version: latest} = await cached(
      __filename, npmPackageInfo, dep, TODAY
    )
    if (version !== latest) {
      outdated.push(`${dep}@${version}...${latest}`)
    }
    size += await cached(__filename, headContentLength, resolved)
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

