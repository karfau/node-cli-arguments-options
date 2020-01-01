const args = require('args');
args.option('flag')
args.option('count', 'counts', []) // FIXME: can we tune it to count?
args.option('str')
args.option('arr', 'collect', []) // FIXME: string vs array value?
// TODO: 'first'/'second' are not present in output

const parsed = args.parse(process.argv);
console.log(JSON.stringify(parsed))
//TODO: remove this line and the next one to mark as ready
process.exit(255)
