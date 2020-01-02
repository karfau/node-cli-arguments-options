const {execSync} = require('child_process')

function execJson (cmd, opts) {
  let exitCode, stderr, stdout = ''
  try {
    stdout = execSync(cmd, {encoding: 'utf8', stdio: 'pipe', ...opts})
  } catch (err) {
    exitCode = err.status
    stderr = err.stderr
    stdout = err.stdout
  }
  let data = {exitCode, stderr};
  try {
    data.value = JSON.parse(stdout.trim().replace(/\\'/g, '"'))
  } catch (err) {
    data.error = err.message
    data.stdout = stdout;
  }
  return data
}

module.exports = {
  execJson
}
