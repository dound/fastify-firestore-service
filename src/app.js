import * as basicExamples from '../examples/basic'
import * as corsExamples from '../examples/cors'
import * as docsExamples from '../examples/docs'
import * as paginationExamples from '../examples/pagination'
import * as txExamples from '../examples/tx'

import { makeApp } from './index'

// example start
export default async () => makeApp({
  service: 'unittest',
  components: {
    ...basicExamples,
    ...corsExamples,
    ...docsExamples,
    ...paginationExamples,
    ...txExamples,
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
