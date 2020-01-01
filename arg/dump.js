const arg = require('arg');
console.log(JSON.stringify(arg({
  '--flag': Boolean,
  '--count': arg.COUNT,
  '--str': String,
  '--arr': [String],
  '--help': Boolean
})))
