const {existsSync, mkdirSync, readJson, writeJson} = require('fs-extra')
const path = require('path')
const {forEach} = require('./iterate')

const CACHE_DIR = path.join(__dirname, '.cache')
const TODAY = new Date().toISOString().substr(0, 10)
const MEM = {}
async function getCache(file) {
  if (MEM[file]) return MEM[file]
  let cache = {}
  try {
    cache = await readJson(file)
  } catch {}
  MEM[file] = cache
  return cache
}

const toFlush = {}

function flushLater (file) {
  if (toFlush[file]) clearTimeout(toFlush[file])
  toFlush[file] = setTimeout(flush, 500, file)
}

async function flush (file) {
  await writeJson(file, MEM[file]).catch(console.error)
}

async function flushAll () {
  return forEach(flush, Object.keys(MEM)).catch(console.error)
}

/**
 * @param {Function} fun
 */
function hashFunction (fun) {
  return fun.name || fun.toString().replace(/\s+/g, '_')
}

function asFileName (main, ...keys) {
  if (path.isAbsolute(main)) main = path.relative(CACHE_DIR, main)
  return [main, ...keys].join('.').replace(/[/\\\s]+/g, '--')
}

/**
 * Stores the values returned by `resolve` inside `./.cache` as JSON files.
 *
 * @param {any[]} keys the first part of the cache file name
 * @param {Function} resolve The method to invoke (with `keys`) to get the data.
 *        Will not be invoked if the data is in the cache.
 *        It's name (or the code for anonymous functions) is also part of the cache file name.
 * @param {any} args the values to pass to `resolver`, the form the first part of the key
 *        arguments with `typeof === 'object'` will be ignored
 * @returns {Promise<ReturnType<resolve>>}
 */
function cached (keys, resolve) {
  if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR)
  const hash = asFileName(...keys, hashFunction(resolve)) + '.json'
  const file = path.join(CACHE_DIR, hash)
  const fun = async (...args) => {
    let cache = await getCache(file)

    const cacheKey = args
      .map(it => {
        switch (typeof it) {
          case 'object':
            return 'object'
          case 'function':
            return hashFunction(it)
          default:
            return it.toString()
        }
      }).join(':')
    if (cacheKey in cache) {
      return cache[cacheKey]
    }
    const value = await resolve(...args)
    cache[cacheKey] = value
    flushLater(file)
    return value
  }
  fun.name = `cached(${hashFunction(resolve)})`
  return fun;
}

module.exports = {cached, flushAll, TODAY}
