const minimist = require('minimist');

// all arguments expect count are parsed as expected with no config
const {_: arguments, ...options} = minimist(process.argv.slice(2));

// FIXME: count is always just true, never an array
// to use unknown option for count all other options need to be defined

console.log(JSON.stringify({arguments, options}))
