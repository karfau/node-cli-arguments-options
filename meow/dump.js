const meow = require('meow');
// all arguments expect count are parsed as expected with no config
const {input, flags} = meow()
// count requires custom code after parsing:
if (flags.count) {
  flags.count = flags.count === true ? 1 : flags.count.length
}
console.log(JSON.stringify({arguments: input, options: flags}))
