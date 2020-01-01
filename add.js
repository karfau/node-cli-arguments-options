const {existsSync, mkdirpSync, writeFileSync} = require('fs-extra');
const {execSync} = require('child_process')

function run (pkg) {
  const dir = `${pkg}`
  if (!existsSync(dir)) mkdirpSync(dir);
  process.chdir(dir)
  execSync('npm init --scope=cliao -y', {stdio: 'inherit'})
  execSync(`npm i -D ${pkg}`, {stdio: 'inherit'})
  const dumpFile = 'dump.js'
  /*if (!existsSync(dumpFile)) */ writeFileSync(dumpFile, `const ${pkg} = require('${pkg}');
//TODO: add the simplest code to support entries in ../dump.json
const parsed = process.argv;
console.log(JSON.stringify(parsed))
//TODO: remove this line and the next one to mark as ready
process.exit(255)
`);
}

module.exports = {
  run
}
