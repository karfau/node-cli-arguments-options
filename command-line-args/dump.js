const commandLineArgs = require('command-line-args');

const {arguments = [], ...options} = commandLineArgs([
  {name: 'flag', type: Boolean},
  // https://github.com/75lb/command-line-args/issues/97
  {name: 'arguments', type: String, multiple: true, defaultOption: true},
  {name: 'count', alias: 'c', type: Boolean, multiple: true},
  {name: 'num', type: parseFloat},
  {name: 'int', type: parseInt},
  {name: 'date', type: Date.parse},
  {name: 'str', type: String},
  {name: 'arr', type: String, lazyMultiple: true},
  {name: 'mult', type: String, multiple: true},
  {name: 'help', type: Boolean},
])
// count requires custom code after parsing:
if (options.count) {
  options.count = options.count.length
}

console.log(JSON.stringify({arguments, options}))
