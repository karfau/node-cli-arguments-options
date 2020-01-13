const {execSync} = require('child_process')

function execJson (cmd, opts) {
  let exitCode = 0, stderr = false, stdout = ''
  try {
    stdout = execSync(cmd, {encoding: 'utf8', stdio: 'pipe', ...opts})
  } catch (err) {
    exitCode = err.status
    stderr = err.stderr
    stdout = err.stdout
  }
  let data = {exitCode, stderr};
  try {
    data.value = JSON.parse(stdout)
  } catch (err) {
    if (stdout) {
      data.error = err.message
    }
    data.stdout = stdout;
  }
  return data
}

module.exports = {
  execJson
}
