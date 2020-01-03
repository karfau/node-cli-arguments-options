const { mkdir, pathExists, readJson, writeJson } = require('fs-extra')
const path = require('path')

const CACHE_DIR = path.join(__dirname, '.cache')

/**
 * Stores the values returned by `resolve` inside `./.cache` as JSON files.
 *
 * @param {string} mainKey the first part of the cache file name
 * @param {Function} resolve The method to invoke (with `keys`) to get the data.
 *        Will not be invoked if the data is in the cache.
 *        It's name (or the code for anonymous functions) is also part of the cache file name.
 * @param {any} keys The keys are joined to form the key inside the cache file. They are also passed to `resolve`
 * @returns {Promise<ReturnType<resolve>>}
 */
async function cached(mainKey, resolve, ...keys) {
  if (!await pathExists(CACHE_DIR)) {
    await mkdir(CACHE_DIR)
  }
  const hash = [mainKey, resolve.name || resolve].join('.').replace(/\/|\s+/g, '--') + '.json'
  const file = path.join(CACHE_DIR, hash)
  let cache = {};
  try {
    cache = await readJson(file)
  } catch {}

  const cacheKey = keys.join(':')
  if (cacheKey in cache) {
    return cache[cacheKey]
  }
  const value = await resolve.apply(null, keys)
  cache[cacheKey] = value
  await writeJson(file, cache).catch(console.error)
  return value;
}

module.exports = {cached}
