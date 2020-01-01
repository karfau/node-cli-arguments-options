const dashdash = require('dashdash');

const count = {};
dashdash.addOptionType({
  name: 'count',
  takesArg: false,
  parseArg: function (_, optstr) {
    let current = count[optstr] || 0;
    current++
    count[optstr] = current;
    return current;
  }
});
const options = [
  {name: 'flag', type: 'bool'},
  {name: 'count', type: 'count'},
  {name: 'str', type: 'string'},
  {name: 'arr', type: 'arrayOfString'},
  {name: 'help', type: 'bool'}
];
const parsed = dashdash.parse({options});
console.log(JSON.stringify(parsed))
//TODO: remove this line and the next one to mark as ready
process.exit(255)
