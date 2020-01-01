const meow = require('meow');
// all arguments expect count are parsed as expected without any
const {input, flags} = meow()
// count requires custom code after parsing:
if (flags.count) {
  flags.count = flags.count === true ? 1 : flags.count.length
}
console.log(JSON.stringify({input, flags}))
