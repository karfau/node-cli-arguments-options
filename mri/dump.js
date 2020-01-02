const mri = require('mri');
const parsed = mri(process.argv.slice(2));
// count requires custom code after parsing:
if (parsed.count) {
  parsed.count = parsed.count === true ? 1 : parsed.count.length
}
console.log(JSON.stringify(parsed))
