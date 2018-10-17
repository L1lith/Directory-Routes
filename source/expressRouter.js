const directoryRoutes = require('./directoryRoutes')
const {
  Router
} = require('express')

const validRouteMethods = ["checkout", "copy", "delete", "get", "head", "lock", "merge", "mkactivity", "mkcol", "move", "m-search", "notify", "options", "patch", "post", "purge", "put", "report", "search", "subscribe", "trace", "unlock", "unsubscribe"]

function expressRouter() {
  if (arguments.length > 3) throw new Error("Too many arguments")
  if (arguments.length < 1) throw new Error("Missing Path Arguments")
  let resources = path = callback = null
  if (arguments.length === 3) {
    [path, resources, callback] = arguments
  } else if (arguments.length === 2) {
    if (typeof arguments[1] == 'object' && arguments[1] !== null) {
      [path, resources] = arguments
    } else {
      [path, callback] = arguments
    }
  }
  if (typeof path != 'string' || path.length < 1) throw new Error("Path Argument must be a String.")
  if (callback !== null && typeof callback != 'function') throw new Error("Callback Argument Must be a Function or Null.")
  if (typeof resources != 'object') throw new Error("Resources Argument must be an Object or Null.")
  const result = (async () => {
    if (resources instanceof Promise) resources = await resources
    const router = new Router()
    const routes = await directoryRoutes(path)
    const routePromises = []
    for (let i = 0; i < routes.length; i++) {
      const route = routes[i]
      const [path, output] = route
      if (output instanceof Promise) {
          routePromises.push([output, i])
      }
    }
    if (routePromises.length > 0) {
      console.log("Awaiting Route Promises")
      await Promise.all(routePromises.map(async ([promise, index]) => {
          routes[index][1] = await promise
      }))
    }

    for (let i = 0; i < routes.length; i++) {
      const [path, output] = routes[i]
      if (path === 'index') { // Router Hook
        if (typeof output != 'function') throw `Router Hook Must Be A Function`
        output(router)
      }
      if (typeof output == 'object' && output !== null) {
        if (!output.hasOwnProperty('handler')) throw `Missing Route Handler Property For Route ${JSON.stringify(path)}`
        if (output.withResources === true) output.handler = await output.handler(resources)
        if (typeof output.handler != 'function') throw `Invalid Route Handler Property For Route ${JSON.stringify(path)}`
        if (typeof output.middleware == 'function') {
          output.middleware = [output.middleware]
        } else if (output.hasOwnProperty('middleware') && (!Array.isArray(output.middleware) || output.middleware.some(middleware => typeof middleware != 'function'))) throw `Invalid Middleware For Route ${JSON.stringify(path)}`
        if (output.hasOwnProperty('method') && (typeof output.method != 'string' || !validRouteMethods.includes(output.method.toLowerCase()))) throw `Invalid Route Method For Route ${JSON.stringify(path)}`
        router[output.method ? output.method.toLowerCase() : 'get']('/' + path, ...output.middleware || [], output.handler)
      } else if (typeof output == 'function') {
        router.get('/' + path, output.handler)
      } else {
        throw `Invalid Route Handler for Route ${JSON.stringify(path)}`
      }
    }

    return router
  })()
  if (typeof callback == 'function') {
    result.then(router => {
      callback(null, router)
    }).catch(err => {
      callback(err, null)
    })
  } else {
    return result
  }
}

module.exports = expressRouter
