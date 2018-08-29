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
          const [route, data] = routeEntries[i]
          if (typeof data != 'object' || data === null) throw new Error(`Route "${path}" must export an object`)
          if (typeof data.call != 'function') throw new Error(`Route "${path}" must export a call function`)
          if (data.hasOwnProperty('method') && data.method !== null && (typeof data.method != 'string' || data.method.length < 1)) throw new Error(`Route "${route}"'s method is invalid`)
          router[data.method || 'get'](route, ...(Array.isArray(data.call) ? data.call : [data.call]))
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
