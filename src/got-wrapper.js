import zlib from 'node:zlib'

import realGot from 'got'

export default (options, mockedGot) => {
  options = {
    decompress: true,
    ...options
  }
  if (options.compress) {
    const headers = {
      ...options.headers
    }
    options.headers = headers
    if (options.body) {
      options.body = zlib.brotliCompressSync(options.body)
    }
    if (options.json) {
      headers['content-type'] = 'application/json'
      options.body = zlib.brotliCompressSync(JSON.stringify(options.json))
      delete options.json
    }

    if (options.body) {
      headers['content-encoding'] = 'br'
    }
  }
  const got = mockedGot ?? this.__mocked_got ?? realGot
  return got(options)
}
