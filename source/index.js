const directoryRoutes = require('./directoryRoutes')
const expressRoutes = require('./expressRoutes')

module.exports = Object.freeze(Object.assign((...args)=>directoryRoutes(...args), {directoryRoutes, expressRoutes}))
