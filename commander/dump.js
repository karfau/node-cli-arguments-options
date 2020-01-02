const commander = require('commander');

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

console.log(JSON.stringify({options: c.opts(), arguments: c.args}))
