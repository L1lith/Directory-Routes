const directoryRoutes = require('./directoryRoutes')
const express = require('express')

function getExpressRoutes(directory, callback) {
  const result = new Promise((resolve, reject) => {
    directoryRoutes(directory, (err, routes) => {
      if (err) return reject(err)
      const router = new express.Router()
      try {
        const routeEntries = Object.entries(routes)
        for (let i = 0; i < routeEntries.length; i++) {
          const [path, route] = routeEntries[i]
          if (typeof route != 'object' || route === null) throw new Error(`Route "${path}" must export an object`)
          if (typeof route.call != 'function') throw new Error(`Route "${path}" must export a call function`)
          router[route.method || 'get'](route.call)
        }
        resolve(router)
      } catch(error) {
        reject(error || new Error("Error Requiring Routes"))
      }
    })
  })
  if (typeof callback == 'function') {
    result.then(router => {
      callback(null, router)
    }).catch(error => {
      callback(error, null)
    })
  }
  return result
}

module.exports = getExpressRoutes
