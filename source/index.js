const directoryRoutes = require('./directoryRoutes')
const expressRouter = require('./expressRouter')

// Allow Future Second Properties
module.exports = Object.freeze(Object.assign((...args)=>directoryRoutes(...args), {directoryRoutes, expressRouter}))
