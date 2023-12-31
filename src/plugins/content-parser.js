import fp from 'fastify-plugin'

function addContentParser (fastify, options, next) {
  fastify.addContentTypeParser('application/json',
    { parseAs: 'string' },
    function (req, body, done) {
      try {
        const json = JSON.parse(body || '{}')
        done(null, json)
      } catch (err) {
        err.statusCode = 400
        done(err, undefined)
      }
    })
  next()
}

export default fp(addContentParser, {
  fastify: '>=3.x',
  name: 'content-parser'
})
