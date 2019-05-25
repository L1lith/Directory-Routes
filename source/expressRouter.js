const directoryRoutes = require('./directoryRoutes')
const parseArgs = require('./parseArgs')
let Router

let expressError = null
try {
  Router = require('express').Router
} catch (error) {
  expressError = error
}

const validRouteMethods = ["checkout", "copy", "delete", "get", "head", "lock", "merge", "mkactivity", "mkcol", "move", "m-search", "notify", "options", "patch", "post", "purge", "put", "report", "search", "subscribe", "trace", "unlock", "unsubscribe"]

function expressRouter() {
  if (expressError !== null) throw expressError
  const result = (async () => {
    const router = new Router()
    let {directory, options, callback} = parseArgs([...arguments])
    options.handleResources = false
    const routes = await directoryRoutes(directory, options, callback)

    const resources = await options.resources

    for (let i = 0; i < routes.length; i++) {
      const [path, output] = routes[i]
      // if (path === 'index') { // Router Hook
      //   if (typeof output != 'function') throw `Router Hook Must Be A Function`
      //   output(router)
      // } TODO: Fix router hook by giving it priority

      if (typeof output == 'function') output = {handler: output}

      if (typeof output == 'object' && output !== null) {
        if (!output.hasOwnProperty('handler')) throw `Missing Route Handler Property For Route ${JSON.stringify(path)}`
        if (output.withResources === true) output.handler = await output.handler(resources)
        if (typeof output.handler != 'function') throw `Invalid Route Handler Property For Route ${JSON.stringify(path)}`
        if (typeof output.middleware == 'function') {
          output.middleware = [output.middleware]
        } else if (output.hasOwnProperty('middleware') && !Array.isArray(output.middleware)) throw `Invalid Middleware For Route ${JSON.stringify(path)}`
        if (!output.hasOwnProperty('middleware')) output.middleware = []
        for (let i = 0; i < output.middleware.length; i++) {
          let middleware = await output.middleware[i]
          if (typeof middleware == 'object' && middleware !== null) {
            if (typeof middleware.handler != 'function') throw new Error("Middleware Handler must be a function.")
            if (middleware.hasOwnProperty('withResources') && typeof middleware.withResources != 'boolean') throw new Error("withResources must be a boolean.")
            if (middleware.withResources === true) {
              output.middleware[i] = await middleware.handler(resources)
            } else {
              output.middleware[i] = middleware.handler
            }
            if (middleware.handlePromises === true) output.middleware[i] = handleRoutePromises(output.middleware[i])
          } else if (typeof middleware != 'function') {
            throw new Error("Middleware must be a Function or an Object with a handler Function.")
          }
        }
        if (output.hasOwnProperty('method') && (typeof output.method != 'string' || !validRouteMethods.includes(output.method.toLowerCase()))) throw `Invalid Route Method For Route ${JSON.stringify(path)}`
        router[output.method ? output.method.toLowerCase() : 'get']('/' + path, ...output.middleware || [], handleRoutePromises(output.handler))
      } else if (typeof output == 'function') {
        router.get('/' + path, handleRoutePromises(output.handler))
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
  }
  return result
}

function handleRoutePromises(handler) {
  return (req, res, next) => {
    const output = handler(req, res, next)
    if (output instanceof Promise) {
      output.then(()=>{}).catch(next)
    }
  }
}

module.exports = expressRouter
