const yargs = require('yargs');
const parsed = yargs.argv;
// count requires custom code after parsing:
if (parsed.count) {
  parsed.count = parsed.count === true ? 1 : parsed.count.length
}
console.log(JSON.stringify(parsed))
