const directoryRoutes = require('./directoryRoutes')
const expressRouter = require('./expressRouter')
const directoryObject = require('./directoryObject')

// Allow Future Second Properties
module.exports = Object.freeze(Object.assign((...args)=>directoryRoutes(...args), {directoryRoutes, expressRouter, directoryObject}))
