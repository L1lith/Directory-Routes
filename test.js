const {expressRoutes, directoryRoutes} = require('./source')

expressRoutes(__dirname + "/testDirectory", console.log)
