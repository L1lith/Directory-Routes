const dirTree = require('directory-tree')
const parseArgs = require('./parseArgs')
const {relative} = require('path')
const slash = require('slash')

function directoryRoutes() {
  const {directory, options={}, callback=null} = parseArgs([...arguments])
  const {fileTypes=["js", "ts"], stripExtensions=true} = options
  if (typeof stripExtensions != 'boolean') throw new Error("stripExtensions must be a boolean")
  if (fileTypes !== null && (!Array.isArray(fileTypes) || fileTypes.some(fileType => typeof fileType != "string" || fileType.length < 1))) throw new Error("fileTypes must be an array of non-empty file type strings")
  if (options === null) options = {}

  const result = (async () => {
    const output = []
    const dirTreeOptions = {}
    if (fileTypes) {
      dirTreeOptions.extensions = new RegExp(`(\.${fileTypes.join("|")})\$`,'i')
    }
    dirTree(directory, dirTreeOptions, item => {
      let route = relative(directory, item.path)
      //route = route.substring(0, route.length - '.js'.length)
      if (stripExtensions === true) {
        route = route.split('/').slice(0, -1).join('/')
      }
      route = slash(route)
      const data = require(item.path)
      output.push([route, data])
    })
    if (options.awaitPromises === true || options.handleResources === true) {
      for (let i = 0; i < output.length; i++) {
        const [route, data] = output[i]
        if (data instanceof Promise) output[i][1] = await data
      }
    }
    if (options.handleResources === true) {
      for (let i = 0; i < output.length; i++) {
        const [route, data] = output[i]
        if (typeof data == 'object' && data !== null && data.hasOwnProperty('withResources')) {
          if (typeof data.withResources != 'boolean') throw new Error(`withResources must be a boolean at path "${route}"`)
          if (options.resources === null) throw new Error(`Resources cannot be passed because there are no resources defined. Error At path "${route}"`)
          if (typeof data.handler != 'function') throw new Error(`Handler must be exported at path ${route}`)
          output[i][1] = await data.handler(options.resources)
        }
      }
    }
    return output
  })()
  if (typeof callback == 'function') {
    result.then(routes => {
      callback(null, routes)
    }).catch(error => {
      callback(error, null)
    })
  }
  return result
}

module.exports = directoryRoutes
