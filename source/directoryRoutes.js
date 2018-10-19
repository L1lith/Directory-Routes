const dirTree = require('directory-tree')
const {relative} = require('path')

function getDirectoryRoutes(directory, callback) {
  if (typeof directory != 'string' || directory.length < 1) throw new Error("Directory must be a String")
  if (arguments.length < 1 && callback !== null && typeof callback != 'function') throw new Error("Callback must be a Function")
  const result = (async () => {
    const output = []
    dirTree(directory, {extensions: /\.js$/}, item => {
      let route = relative(directory, item.path)
      route = route.substring(0, route.length - '.js'.length)
      const data = require(item.path)
      output.push([route, data])
    })
    for (let i = 0; i < output.length; i++) {
      const [route, data] = output[i]
      if (data instanceof Promise) output[i][1] = await data
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

async function getDirectoryRoutesWithResourceSupport(directory) {
  if (arguments.length > 3) throw new Error("Too Many Arguments")
  let resources = callback = null
  if (arguments.length === 3 ) {
    resources = arguments[1]
    callback = arguments[2]
  } else if (typeof arguments[1] == 'object') {
    resources = arguments[1]
  } else if (arguments.length === 2) {
    callback = arguments[1]
  }
  if (typeof resources != 'object') throw new Error("Resources must be an Object or Null!")
  if (callback !== null && typeof callback != 'function') throw new Error("Callback must be a Function or Null")
  const routes = await getDirectoryRoutes(directory)
  for (let i = 0; i < routes.length; i++) {
    const [route, data] = routes[i]
    if (typeof data == 'object' && data !== null && data.withResources === true) {
      if (typeof data.handler != 'function') throw new Error(`Resources handler must be a function at path "${route}"`)
      if (resources === null) throw new Error(`Resources cannot be passed, no resources defined. Error At path "${route}"`)
      routes[i][1] = await data.handler(resources)
    }
  }
  return routes
}

module.exports = getDirectoryRoutesWithResourceSupport
