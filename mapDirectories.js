function mapDirectories(directoryObject, currentPath=[]) {
  if (typeof directoryObject != 'object'  || directoryObject === null) throw new Error("DirectorObject Must be an Object")
  const output = []
  Object.entries(directoryObject).forEach(([path, output])=>{
    
  })
}

module.exports = mapDirectories
