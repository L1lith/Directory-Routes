const dirTree = require('directory-tree')
const parseArgs = require('./parseArgs')
const {relative} = require('path')

function directoryRoutes() {
  const {directory, options, callback} = parseArgs(arguments)
  const result = (async () => {
    const output = []
    dirTree(directory, {extensions: /\.js$/}, item => {
      let route = relative(directory, item.path)
      route = route.substring(0, route.length - '.js'.length)
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
          if (typeof data.withResources != 'function') throw new Error(`Resources handler must be a function at path "${route}"`)
          if (options.resources === null) throw new Error(`Resources cannot be passed because there are no resources defined. Error At path "${route}"`)
          output[i][1] = await data.withResources(options.resources)
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
