import zlib from 'node:zlib'

import { jest } from '@jest/globals'

import gotWrapper from '../src/got-wrapper'

import { BaseTest, runTests } from './base-test'

// Tests to make sure new JS features introduced in node14
// are working, and context highlight, linter etc are compatible
class CompressionTest extends BaseTest {
  async testCompression () {
    const mock = jest.fn().mockImplementation(({ body }) => {
      expect(body).toEqual(zlib.brotliCompressSync('321'))
    })
    await gotWrapper({
      url: '123',
      body: '321',
      compress: true
    }, mock)
    mock.mockRestore()

    const mock2 = jest.fn().mockImplementation(({ body }) => {
      expect(body).toEqual(zlib.brotliCompressSync(JSON.stringify({
        data: '321'
      })))
    })
    await gotWrapper({
      url: '123',
      json: {
        data: '321'
      },
      compress: true
    }, mock2)
    mock2.mockRestore()
  }

  async testNoCompression () {
    const mock = jest.fn().mockImplementation(({ body }) => {
      expect(body).toBe('321')
    })
    await gotWrapper({
      url: '123',
      body: '321',
      compress: false
    }, mock)
    console.log(mock.mock.calls)
    expect(mock.mock.calls.length).toBe(1)
    expect(mock.mock.calls[0][0]).toEqual({
      url: '123',
      compress: false,
      decompress: true,
      body: '321'
    })
    mock.mockRestore()
  }

  async testContentEncoding () {
    const mock = jest.fn().mockImplementation(({ headers }) => {
      expect(headers['content-encoding']).toBe('br')
    })
    await gotWrapper({
      url: '123',
      body: '321',
      compress: true
    }, mock)
    mock.mockRestore()
    jest.fn().mockImplementation(({ headers }) => {
      expect(headers['content-encoding']).toBeUndefined()
    })
    await gotWrapper({
      url: '123',
      compress: true
    }, mock)
    mock.mockRestore()
  }
}

runTests(CompressionTest)
