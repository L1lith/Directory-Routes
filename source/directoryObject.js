const directoryRoutes = require('./directoryRoutes')

async function directoryObject() {
  const routes = await directoryRoutes(...arguments)
  const output = {}
  routes.forEach(([path, data]) => {
    let pathParts = path.split('/')
    if (pathParts[0] === "") pathParts = pathParts.slice(1)
    let target = output
    for (let i = 0; i < pathParts.length; i++) {
      const pathPart = pathParts[i]
      if (i < pathParts.length - 1) {
        if (!target.hasOwnProperty(pathPart)) target[pathPart] = {}
        target = target[pathPart]
      } else {
        target[pathPart] = data
      }
    }
  })
  return output
}

module.exports = directoryObject
