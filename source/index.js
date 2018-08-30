const directoryRoutes = require('./directoryRoutes')

// Allow Future Second Properties
module.exports = Object.freeze(Object.assign((...args)=>directoryRoutes(...args), {directoryRoutes}))
