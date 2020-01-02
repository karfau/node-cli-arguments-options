const camelcase = require('camelcase')
const {execSync} = require('child_process')
const {existsSync, mkdirpSync, writeFileSync} = require('fs-extra');

function run (pkg) {
  const dir = `${pkg}`
  const execOpts = {stdio: 'inherit', cwd: dir}
  if (!existsSync(dir)) mkdirpSync(dir);
  execSync('npm init --scope=cliao -y', execOpts)
  execSync(`npm i -D ${pkg}`, execOpts)
  const dumpFile = 'dump.js'
  if (!existsSync(dumpFile))  writeFileSync(dumpFile, `const ${camelcase(pkg)} = require('${pkg}');
//TODO: add the simplest code to support entries in ../dump.json
const parsed = process.argv;
console.log(JSON.stringify(parsed))
//TODO: remove this line and the next one to mark as ready
process.exit(255)
`);
  execSync(`runex about ${pkg}`)
  execSync(`runex dump ${pkg}`)
  execSync(`git add ${pkg}`)
}

module.exports = {
  run
}
