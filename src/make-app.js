import fastify from 'fastify'
import { v4 as uuidv4 } from 'uuid'

import ComponentRegistrar from './component-registrar.js'
import makeLogger from './make-logger.js'
import compressPlugin from './plugins/compress.js'
import contentParserPlugin from './plugins/content-parser.js'
import cookiePlugin from './plugins/cookie.js'
import errorHandlerPlugin from './plugins/error-handler.js'
import healthCheckPlugin from './plugins/health-check.js'
import latencyTrackerPlugin from './plugins/latency-tracker.js'
import swaggerPlugin from './plugins/swagger.js'

/**
 * @typedef {object} CookieConfig
 * @property {boolean} [disabled=false] Adds fastify-cookie plugin
 * @property {string} [secret] A secret to use to secure cookie
 */
const COOKIE_CONFIG = {
  disabled: false,
  secret: undefined
}

/**
 * @typedef {object} LoggingConfig
 * @property {boolean} [unittesting=false] Whether output logs to console with
 *   pretty printing
 * @property {boolean} [reportAllErrors=false] Whether include all API
 *   validation errors in error logging. Recommend to keep it off for production,
 *   on for testing.
 * @property {boolean} [reportErrorDetail=false] Whether include all details
 *   of an error. Recommend to keep it off for remote testing, on for local
 *   testing.
 */
const LOGGING_CONFIG = {
  unittesting: false,
  reportAllErrors: false,
  reportErrorDetail: false
}

/**
 * @typedef {object} HealthCheckConfig
 * @property {boolean} [disabled=false] Whether to add a health check endpoint
 *   that simply returns 200.
 * @property {string} [path='/'] The path to the health check endpoint.
 */
const HEALTH_CHECK_CONFIG = {
  disabled: false,
  path: '/'
}

/**
 * @typedef {object} SwaggerConfig
 * @property {boolean} [disabled=false] Whether to disable
 * @property {Array<string>} [servers=[]] The host endpoint (scheme + domain) to
 *   send requests to
 * @property {Array<string>} [authHeaders=[]] Authentication headers
 * @property {string} [routePrefix='/docs'] Authentication headers
 */
const SWAGGER_CONFIG = {
  disabled: false,
  servers: [],
  authHeaders: [],
  routePrefix: '/docs'
}

/**
 * @typedef {object} LatencyTrackerConfig
 * @property {boolean} [disabled=false] Whether to add a health check endpoint
 *   that simply returns 200.
 * @property {string} [path='/'] The path to the health check endpoint.
 */
const LATENCY_TRACKER_CONFIG = {
  disabled: false,
  header: 'x-latency-ms'
}

const PARAMS_CONFIG = {
  service: undefined,
  components: undefined,
  RegistrarCls: ComponentRegistrar,
  cookie: {},
  healthCheck: {},
  latencyTracker: {},
  logging: {},
  swagger: {}
}

function loadConfigDefault (config, defaultConfig) {
  for (const key of Object.keys(config)) {
    if (!Object.prototype.hasOwnProperty.call(defaultConfig, key)) {
      throw new Error(`Unknown config ${key}`)
    }
  }
  if (!config.disabled) {
    for (const [key, defaultValue] of Object.entries(defaultConfig)) {
      if (defaultValue === undefined && !config[key]) {
        throw new Error(`Missing required value for ${key}`)
      }
    }
  }
  Object.assign(config, { ...defaultConfig, ...config })
}

/**
 * @param {Object} params
 * @param {string} params.service Name of the service, for example, iam,
 *   user-id, leaderboard. This affects API's prefixes.
 * @param {Array<API|Model|component>} params.components A list of
 *   components.
 * @param {object} [params.RegistrarCls=ComponentRegistrar] A subclass of
 *   ComponentRegistrar
 * @param {CookieConfig} [params.cookie] Configures fastify-cookie.
 * @param {HealthCheckConfig} [params.healthCheck] Configures health check endpoint.
 * @param {LatencyTrackerConfig} [params.latencyTracker]
 * @param {LoggingConfig} [params.logging] Configures logging.
 * @param {SwaggerConfig} [params.swagger] Configures swagger.
 * @returns {Promise<server>} fastify app with configured plugins
 */
export default async function makeService (params = {}) {
  const configs = [
    [() => params, PARAMS_CONFIG],
    [() => params.cookie, COOKIE_CONFIG],
    [() => params.healthCheck, HEALTH_CHECK_CONFIG],
    [() => params.latencyTracker, LATENCY_TRACKER_CONFIG],
    [() => params.logging, LOGGING_CONFIG],
    [() => params.swagger, SWAGGER_CONFIG]
  ]
  for (const [getter, defaultConfig] of configs) {
    loadConfigDefault(getter(), defaultConfig)
  }
  const {
    service,
    components,
    RegistrarCls,
    cookie,
    healthCheck,
    latencyTracker,
    logging,
    swagger
  } = params
  const fastifyServerId = uuidv4()
  let requestCount = 0
  const app = fastify({
    ignoreTrailingSlash: true,
    disableRequestLogging: true,
    logger: makeLogger(logging.unittesting),
    genReqId: () => `${fastifyServerId}-${++requestCount}`,
    ajv: {
      customOptions: {
        removeAdditional: false,
        allErrors: logging.reportAllErrors,
        useDefaults: true,
        strictSchema: false,
        strictRequired: true
      }
    }
  })

  const registrar = new RegistrarCls(app, service)

  app.register(cookiePlugin, { cookie })
    .register(compressPlugin)
    .register(contentParserPlugin)
    .register(latencyTrackerPlugin, { latencyTracker })
    .register(errorHandlerPlugin, {
      errorHandler: { returnErrorDetail: logging.reportErrorDetail }
    })
    .register(healthCheckPlugin, { healthCheck })
    .register(swaggerPlugin, { swagger: { service, ...swagger } })

  await registrar.registerComponents(components)
  return app
}
