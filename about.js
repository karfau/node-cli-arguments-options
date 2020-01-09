const axios = require('axios')
const {existsSync, readJson, writeJsonSync} = require('fs-extra')
const {manifest} = require('pacote')
const path = require('path')
const dotenv = require('dotenv')
const {cached, flushAll} = require('./cache')
const {forEach, packagesIn} = require('./iterate')

const NODE_MODULES = 'node_modules'
const TODAY = new Date().toISOString().substr(0, 10)
const TOOLS = [
  'ava', 'eslint', 'express', 'jest', 'mocha', 'npm', 'npx', 'nyc',
  'prettier', 'tap', 'ts-node', 'typescript', 'webpack'
]

async function headContentLength (url) {
  return parseInt((await axios.head(url)).headers['content-length'])
}
headContentLength.cached = cached([__filename], headContentLength)

let githubRateLimitReset
const githubHeaders = {}
dotenv.config()
if (process.env.GITHUB_API_TOKEN) {
  githubHeaders.Authorization = `token ${process.env.GITHUB_API_TOKEN}`
  console.error('GITHUB auth ready')
}

async function githubRepo (url) {
  if (!url.includes('github.com')) throw new Error(`not a github repo ${url}`)
  if (githubRateLimitReset && Date.now().valueOf() < githubRateLimitReset) {
    throw new Error(`Github API rate limit reached until ${new Date(githubRateLimitReset).toISOString()}`)
  }
  const reg = /^(.*\/\/[^/]+\/)([^/]+\/[^/]+)/.exec(url)
  if (!reg) throw new Error(`not able to identify repo ${url}`)
  const repo = reg.pop()
  try {
    return (await axios.get(`https://api.github.com/repos/${repo}`, {headers: githubHeaders})).data
  } catch (err) {
    const respHead = err.response && err.response.headers
    if (respHead && respHead['x-ratelimit-remaining'] === 0) {
      githubRateLimitReset = parseInt(respHead['x-ratelimit-reset'], 10) * 1000
      const message = `Github API rate limit ${
        respHead['x-ratelimit-limit']
      } reached. ${new Date(githubRateLimitReset).toISOString()}`
      throw new Error(message)
    }
    throw err
  }
}
githubRepo.cached = cached([TODAY], githubRepo)

async function checkDeps (id) {
  const unpkg = (await axios.get(`https://unpkg.com/${id}/package.json`)).data
  if (unpkg.dependencies || unpkg.devDependencies) {
    // take a shortcut, since the fields are not stripped from the packed file => no dependencies
    return unpkg.dependencies || {}
  }
  if (unpkg.repository) {
    let url = typeof unpkg.repository === 'string' ? unpkg.repository : unpkg.repository.url
    url = url.replace(/^git\+|\.git$/g, '')
      .replace(/^git:/, 'https:')
      .replace(/^(.*git@github\.com|github):?\/?/, 'https://github.com/')

    if (!url.startsWith('http')) url = `https://github.com/${url}`
    url = url.replace(/\/tree|blob\//, '/raw/')
    if (/\/raw\//.test(url)) {
      url += '/package.json'
    } else {
      const {default_branch} = await githubRepo.cached(url)
      url += `/raw/${default_branch}/package.json`
    }
    const repo = (await axios.get(url)).data
    return repo.dependencies || {}
  }
  return {}
}
checkDeps.cached = cached([__filename], checkDeps)

async function npmPackageInfo (p) {
  const m = await manifest(p)
  if (!m.dependencies) {
    if (m.name && m.version) {
      try {
        m.dependencies = await checkDeps.cached(pinned(m.name, m.version))
      } catch (err) {
        console.error('not able to resolve dependencies for', p, err.config || err)
      }
    } else {
      console.error('x', p, Object.keys(m))
    }
  }
  return m
}
npmPackageInfo.cached = cached(['pacota', TODAY], npmPackageInfo)

function pinned (name, version) {
  return name && version ? `${name}@${version}` : name
}

async function _allDependencies (pkg, path = '', known = {}) {
  const {name, version, dependencies = {}} = await npmPackageInfo.cached(pkg)
  const id = pinned(name, version)
  path = path ? `${path} > ${id}` : id
  known[name] = path
  // path && console.error(' ', path, '>', name, version);
  process.stderr.write('.')
  const next = []
  for (const [dep, depVersion] of Object.entries(dependencies)) {
    if (known[dep]) {
      // console.error('dup:\n\t', known[dep], 'VS\n\t', path, '>', dep, '?', depVersion)
      continue
    }
    known[dep] = `${path} ? ${pinned(dep, depVersion)}`
    next.push([dep, depVersion])
  }
  for (const [dep, depVersion] of next) {
    await _allDependencies(pinned(dep, depVersion), path, known)
  }
  return known
}
const allDependencies = cached([__filename], _allDependencies)


async function depInfo (pkg) {
  const usedIn = packagesIn('.')
    .filter(name => name !== pkg && existsSync(path.join('.', name, NODE_MODULES, pkg)))
  for (const tool of TOOLS) {
    const toolDeps = await allDependencies(tool)
    toolDeps[pkg] && usedIn.push(toolDeps[pkg])
  }
  const deps = packagesIn('.', pkg, NODE_MODULES)

  const locked = (await readJson(path.join('.', pkg, 'package-lock.json'))).dependencies
  const outdated = []
  let size = 0
  for (const dep of deps) {
    const {version, resolved} = locked[dep]
    const {version: latest} = await npmPackageInfo(dep)
    if (version !== latest) {
      outdated.push(`${pinned(dep, version)}...${latest}`)
    }
    size += await headContentLength.cached(resolved)
  }
  return {deps, outdated, size, usedIn}
}

async function updateAbout (pkg) {
  const dependencies = await depInfo(pkg)
  console.log(JSON.stringify(dependencies, null, 2))
  writeJsonSync(
    path.join(pkg, 'about.json'),
    {dependencies},
    {spaces: 2}
  )
}

async function run (...args) {
  await forEach(allDependencies, TOOLS)
  await flushAll()
  return forEach(updateAbout, args)
}

module.exports = {
  run
}
