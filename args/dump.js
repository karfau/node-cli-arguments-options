const args = require('args');
args.option('flag')
args.option('count', 'counts')
args.option('str')
args.option('arr', 'collect', [])

const help = false;
// help needs to be added manually when disabled in options
!help && args.option('help')
const options = args.parse(
  process.argv, {help}
);

// count requires custom code after parsing:
if (options.count) {
  options.count = options.count === true ? 1 : options.count.length
}
// sync automatic alias
options.c = options.count

console.log(JSON.stringify({arguments: args.sub, options}))
