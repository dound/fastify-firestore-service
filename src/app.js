import * as basicExamples from '../examples/basic'
import * as corsExamples from '../examples/cors'
import * as dbExamples from '../examples/db'
import * as docsExamples from '../examples/docs'

import { makeApp } from './index'

// example start
export default async () => makeApp({
  service: 'unittest',
  components: {
    ...basicExamples,
    ...corsExamples,
    ...dbExamples,
    ...docsExamples,
    notAPI: {}
  },
  cookie: {
    secret: 'unit-test'
  },
  logging: {
    reportErrorDetail: true, // process.env.NODE_ENV === 'localhost',
    unittesting: true, // process.env.NODE_ENV === 'localhost',
    reportAllErrors: true // process.env.NODE_ENV !== 'prod'
  },
  swagger: {
    disabled: false,
    authHeaders: ['x-app', 'x-uid', 'x-admin', 'x-token'],
    servers: ['http://localhost:8080'],
    routePrefix: '/app/docs'
  }
})
// example end
