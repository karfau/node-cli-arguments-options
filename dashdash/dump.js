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
const config = {options: [
  {name: 'flag', type: 'bool'},
  {name: 'count', type: 'count'},
  {name: 'str', type: 'string'},
  {name: 'arr', type: 'arrayOfString'},
  {name: 'help', type: 'bool'}
]};
const {_args: arguments, ...options} = dashdash.parse(config);
console.log(JSON.stringify({arguments, options}))
