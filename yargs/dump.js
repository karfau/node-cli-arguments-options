const yargs = require('yargs');

// all arguments expect count are parsed as expected with no config
const {_: arguments, ...options} = yargs.argv;
// count requires custom code after parsing:
if (options.count) {
  options.count = options.count === true ? 1 : options.count.length
}

console.log(JSON.stringify({arguments, options}))
