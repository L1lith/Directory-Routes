const dirTree = require('directory-tree')
const {relative} = require('path')

function getDirectoryRoutes(directory, callback) {
  const result = new Promise((resolve, reject) => {
    const output = {}
    dirTree(directory, {extensions: /\.js$/}, item => {
      let route = relative(directory, item.path)
      route = route.substring(0, itemPath.length - '.js'.length)
      const data = require(item.path)
      output[route] = data
    })
    resolve(output)
  })
  if (typeof callback == 'function') {
    result.then(routes => {
      callback(null, routes)
    }).catch(error => {
      callback(error, null)
    })
  }
  return result
}

module.exports = getDirectoryRoutes
