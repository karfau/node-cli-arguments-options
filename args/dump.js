const args = require('args');
args.option('flag')
args.option('count', 'counts')
args.option('str')
args.option('arr', 'collect', [])
const help = false;
!help && args.option('help') // needs to be added manually when dis

const parsed = args.parse(
  process.argv, {exit: {help}, help}
);
// count requires custom code after parsing:
if (parsed.count) {
  parsed.count = parsed.count === true ? 1 : parsed.count.length
}
// sync automatic alias
parsed.c = parsed.count
console.log(JSON.stringify({parsed, sub: args.sub}))
