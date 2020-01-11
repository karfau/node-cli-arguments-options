__exit = process.exit
process.exit = (code) => {
  let location = 'at unknown'
  try {
    const stack = new Error().stack.split('\n')
    if (stack && stack[2]) {
      location = stack[2].replace(process.cwd(), '.').replace(/^\s+/, '')
    }
  } catch (err) {
    location += ` (${err.message})`
  }
  (code ? console.error : console.log)(`process.exit(${code || ''})`, location)
  __exit(code)
}
