function getDirectoryRoutes(directory, callback) {
  const result = new Promise((resolve, reject) => {

  })
  if (typeof callback != 'function') throw new Error("Callback must be a function")
  result.then(routes => {
    callback(null, routes)
  }).catch(error => {
    callback(error, null)
  })
  return result
}

module.exports = getDirectoryRoutes
