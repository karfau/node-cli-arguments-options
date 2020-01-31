const {Parser} = require('dashdash')

const parser = new Parser({allowUnknown: true, options: []});
console.log(JSON.stringify(parser.parse()))
