const yargsParser = require('yargs-parser');

const {_: arguments, ...options} = yargsParser(process.argv.slice(2));
// count requires custom code after parsing:
if (options.count) {
  options.count = options.count === true ? 1 : options.count.length
}

console.log(JSON.stringify({arguments, options}))
