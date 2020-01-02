const yargs = require('yargs');

const {_: arguments, ...options} = yargs.argv;
// count requires custom code after parsing:
if (options.count) {
  options.count = options.count === true ? 1 : options.count.length
}

console.log(JSON.stringify({arguments, options}))
