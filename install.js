const {forEach} = require('./iterate')
const {execSync} = require('child_process')

function npmInstall (pkg) {
  execSync('npm install', {stdio: 'inherit', cwd: pkg})
}

async function run (...args) {
  await forEach(npmInstall, args)
  if (!process.env.CI) {
    execSync('runex about', {stdio: 'inherit'})
  }
}

module.exports = {
  run
}
