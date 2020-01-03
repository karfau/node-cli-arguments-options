const { mkdir, pathExists, readJson, writeJson } = require('fs-extra')
const path = require('path')


const CACHE_DIR = path.join(__dirname, '.cache')

/**
 *
 * @param mainKey
 * @param {Function} resolve
 * @param keys
 * @returns {Promise<ReturnType<resolve>>}
 */
async function cached(mainKey, resolve, ...keys) {
  if (!await pathExists(CACHE_DIR)) {
    await mkdir(CACHE_DIR)
  }
  if (!resolve.name) console.error(
    'incomplete cache key for anonymous function', mainKey, resolve.toString()
  )
  const hash = [mainKey, resolve.name].join('.').replace(/\//g, '--') + '.json'
  const file = path.join(CACHE_DIR, hash)
  const cache = await pathExists(file) ? await readJson(file) : {}
  const cacheKey = keys.join(':')

  if (cacheKey in cache) {
    return cache[cacheKey]
  }
  const value = await resolve.apply(null, keys)
  cache[cacheKey] = value
  const dontWait = writeJson(file, cache).catch(console.error)
  return value;
}

module.exports = {cached}
