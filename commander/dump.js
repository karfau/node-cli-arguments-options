const commander = require('commander');
//TODO: add the simplest code to support entries in ../dump.json
const c = commander
  .option('--flag')
  .option('--count', 'counts', (_, prev = 0) => prev + 1)
  .option('--str <val>')
  .option('--arr <val>', 'collects', (cur, prev = []) => {
    prev.push(cur);
    return prev;
  })
  .arguments('[first] [second]')
  .parse(process.argv)
  const parsed = {opts: c.opts(), args: c.args};
console.log(JSON.stringify(parsed))
