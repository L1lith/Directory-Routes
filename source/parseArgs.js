const defaultOptions = {
  resources: null,
  handleResources: true,
  awaitPromises: true
}

function parseArgs(args) {
  if (!Array.isArray(args)) throw new Error("Arguments must be an Array")
  if (args.length > 3) throw new Error("Too Many Arguments")
  if (args.length < 1) throw new Error("Missing Directory Argument")
  const [directory] = args
  if (typeof directory != 'string' || directory.length < 1) throw new Error("Directory Argument must be a String")

  let callback = null
  let options = null
  if (args.length === 3) {
    options = args[1]
    callback = args[2]
  } else if (typeof args[1] == 'object' && args[1] !== null) {
    options = args[1]
  } else if (args.length === 2) {
    callback = args[1]
  }
  if (typeof options != 'object') throw new Error("Options must be an Object or Null")
  options = {...defaultOptions, ...(options || {})}
  if (callback !== null && typeof callback != 'function') throw new Error("Callback must be a Function or Null")

  return {directory, callback, options}
}

module.exports = parseArgs
