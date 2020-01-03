const commandLineArgs = require('command-line-args');

const {arguments = [], ...options} = commandLineArgs([
  {name: 'flag', type: Boolean},
  {name: 'arguments', type: String, multiple: true, defaultOption: true},
  {name: 'count', type: Boolean, multiple: true},
  {name: 'str', type: String},
  {name: 'arr', type: String, multiple: true, lazyMultiple: true},
  {name: 'help', type: Boolean},
])
// count requires custom code after parsing:
if (options.count) {
  options.count = options.count.length
}

console.log(JSON.stringify({arguments, options}))
