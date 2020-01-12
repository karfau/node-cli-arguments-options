const commandLineArgs = require('command-line-args')

try {
  const partial = process.argv[2] === '--partial'
  const stopAtFirstUnknown = process.argv[2] === '--stop'
  console.log(
    JSON.stringify(commandLineArgs([
      {name: 'known', type: Boolean}
    ], {
      argv: process.argv.slice(partial || stopAtFirstUnknown ? 3 : 2),
      partial,
      stopAtFirstUnknown
    }))
  )
} catch (err) {
  console.error(err.name, ';', err.message)
  process.exit(11)
}
