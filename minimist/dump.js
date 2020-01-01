const minimist = require('minimist');
// all arguments expect count are parsed as expected with no config
const parsed = minimist(process.argv.slice(2));
// count is always just true, never an array
// to use unknown option for count all other options need to be defined
console.log(JSON.stringify(parsed))
