const dirTree = require('directory-tree')
const parseArgs = require('./parseArgs')
const {relative} = require('path')

function directoryRoutes() {
  const {directory, options, callback} = parseArgs([...arguments])
  const result = (async () => {
    const output = []
    dirTree(directory, {extensions: /\.(js|ts)*/}, item => {
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
