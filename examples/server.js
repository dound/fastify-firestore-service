// From command line run `node server.js` to start a server instance
// You can view a demo swagger doc at http://0.0.0.0:8090/app/docs

import '../test/environment'

import makeApp from '../src/app'

// example start
const app = await makeApp()
app.listen({ port: 8090, host: '0.0.0.0' })
// example end
