const directoryRoutes = require('./directoryRoutes')
const {
  Router
} = require('express')

const validRouteMethods = ["checkout", "copy", "delete", "get", "head", "lock", "merge", "mkactivity", "mkcol", "move", "m-search", "notify", "options", "patch", "post", "purge", "put", "report", "search", "subscribe", "trace", "unlock", "unsubscribe"]

function expressRouter(path, callback) {
  const result = (async () => {
    const router = new Router()
    const routes = await directoryRoutes(path)
    routes.forEach(([path, output]) => {
      if (path === 'index') { // Router Hook
        if (typeof output != 'function') throw `Router Hook Must Be A Function`
        output(router)
      }
      if (typeof output == 'object' && output !== null) {
        if (!output.hasOwnProperty('handler')) throw `Missing Route Handler Property For Route ${JSON.stringify(path)}`
        if (!(typeof output.handler != 'function')) throw `Invalid Route Handler Property For Route ${JSON.stringify(path)}`
        if (output.hasOwnProperty('middleware') && (!Array.isArray(output.middleware) || output.middleware.some(middleware => typeof middleware != 'function'))) throw `Invalid Middleware For Route ${JSON.stringify(path)}`
        if (output.hasOwnProperty('method') && !validRouteMethods.includes(output.method)) throw `Invalid Route Method For Route ${JSON.stringify(path)}`
        router[output.method || 'get']('/' + path, ...output.middleware || [], output.handler)
      } else if (typeof output == 'function') {
        router.get('/' + path, output)
      } else {
        throw `Invalid Route Handler for Route ${JSON.stringify(path)}`
      }
    })

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

module.exports = expressRouter
