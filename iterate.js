const {existsSync, readdirSync} = require('fs')
const path = require('path')

function packagesIn (...paths) {
  const base = path.join(...paths)
  return readdirSync(base, 'utf8').reduce(
    (acc, c) => {
      if (c[0] === '@') {
        acc.push(...packagesIn(base, c).map(cc => `${c}/${cc}`))
      } else if (existsSync(path.join(base, c, 'package.json'))) {
        acc.push(c)
      }
      return acc
    },
    []
  )
}

async function forEach (method, args) {
  if (args.length === 0) {
    args = packagesIn('.')
  }
  for (const arg of args) {
    args.length > 1 && console.error('\n', method.name, arg)
    await method(arg)
  }
}

module.exports = {
  forEach, packagesIn
}
