const dirTree = require('directory-tree')
const {relative} = require('path')

function getDirectoryRoutes(directory, callback) {
  const result = new Promise((resolve, reject) => {
    const output = {}
    dirTree(directory, {extensions: /\.js$/}, item => {
      let itemPath = relative(directory, item.path)
      itemPath = itemPath.substring(0, itemPath.length - '.js'.length)
      const data = require(item.path)
      output[itemPath] = data
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
