// From command line run `node server.js` to start a server instance
// You can view a demo swagger doc at http://0.0.0.0:8090/app/docs

import '../test/environment.js'

import makeTestApp from '../src/app.js'

// this is not a production configuration!
const params = {
  logging: {
    reportErrorDetail: true,
    useUnitTestLogFormat: false,
    reportAllErrors: true
  }
}

// example start
const app = await makeTestApp(params)
app.listen({ port: 8090, host: '0.0.0.0' })
// example end
