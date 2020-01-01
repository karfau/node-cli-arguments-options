const argv = require('argv');

let counter = 0;
const parsed = argv
  .option({name: 'flag', type: 'boolean'})
  .type('count', () => ++counter)
  .option({name: 'count', type: 'count'})
  .option({name: 'str', type: 'string'})
  .option({name: 'arr', type: 'list,string'})
  .run();
console.log(JSON.stringify(parsed))
