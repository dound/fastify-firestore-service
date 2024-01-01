import zlib from 'node:zlib'

import realGot from 'got'

function gotWrapper (options, mockedGot) {
  options = {
    decompress: true,
    ...options
  }
  if (options.compress) {
    // make a copy of the headers obj before we make changes to it
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
  // istanbul ignore next
  const got = mockedGot ?? gotWrapper.__mocked_got ?? realGot
  return got(options)
}

export default gotWrapper
