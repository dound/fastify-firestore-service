import cookiePlugin from '@fastify/cookie'
import fp from 'fastify-plugin'

function addCookiePlugin (fastify, options, next) {
  // istanbul ignore if
  if (options.cookie.disabled) {
    next()
    return
  }
  fastify.register(cookiePlugin, { secret: options.cookie.secret })
  next()
}

export default fp(addCookiePlugin, {
  fastify: '>=3.x',
  name: 'content-parser'
})
