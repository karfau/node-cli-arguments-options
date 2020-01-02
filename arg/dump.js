const arg = require('arg');

const {_: arguments, ...options} = arg({
  '--flag': Boolean,
  '--count': arg.COUNT,
  '--str': String,
  '--arr': [String],
  '--help': Boolean
})

console.log(JSON.stringify({arguments, options}))
