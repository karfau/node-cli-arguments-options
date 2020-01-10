const arg = require('arg');

const {_: arguments, ...options} = arg({
  '--flag': Boolean,
  '--count': arg.COUNT,
  '--str': String,
  '--num': Number,
  '--int': parseInt,
  '--date': Date.parse,
  '--arr': [String],
  '--bool': (value) => value === 'true',
  '--help': Boolean
})

console.log(JSON.stringify({arguments, options}))
