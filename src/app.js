import * as basicExamples from '../examples/basic.js'
import * as corsExamples from '../examples/cors.js'
import * as dbExamples from '../examples/db.js'
import * as docsExamples from '../examples/docs.js'

import { makeService } from './index.js'

const components = {
  ...basicExamples,
  ...corsExamples,
  ...dbExamples,
  ...docsExamples,
  notAPI: {}
}

// example start
export default async () => makeService({
  service: 'unittest',
  components,
  cookie: {
    secret: 'unit-test'
  },
  logging: {
    reportErrorDetail: true, // process.env.NODE_ENV === 'localhost',
    useUnitTestLogFormat: true, // process.env.NODE_ENV === 'localhost',
    reportAllErrors: true // process.env.NODE_ENV !== 'prod'
  },
  swagger: {
    disabled: false,
    authHeaders: ['x-app', 'x-uid'],
    servers: ['http://localhost:8080'],
    routePrefix: '/app/docs'
  }
})
// example end
