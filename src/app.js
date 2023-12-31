import * as components from '../examples/index'

import { makeApp } from './index'

// example start
export default makeApp({
  service: 'unittest',
  components,
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
