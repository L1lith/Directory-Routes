# Directory Routes
Directory Routes allows you to require modules in a folder deeply and map all exports to their full relative path to the required folder.

What is this good for? We can use this for very cleanly organizing our HTTP endpoints using file/directory structures.

For example let's say we have a folder called routes, and it has this directory structure

```
- routes
  |- auth
  |  |- login.js
  |  |- signup.js
  |  |- logout.js
  |- news
     |- latest.js
     |- between.js
```
Now if we require the routes directory with Directory Routes like this we can see Directory Routes doing it's magic.
```js
const directoryRoutes = require('directory-routes')
directoryRoutes(__dirname + '/routes', (err, routes) => {
	if (err) return console.log(err)
    console.log(routes)
})
```
We should now see this from the routes being logged.
```js
{
	"/auth/login": (login export),
    "/auth/signup": (signup export),
    "/auth/logout": (logout export),
    "/news/latest": (latest export),
    "/news/between": (between export)
}
```
Additionally, Directory Routes returns a promise that you can use instead of a callback.
