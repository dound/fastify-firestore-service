import { makeService } from '../src/index.js'

import { BaseTest, runTests } from './base-test.js'

class makeServiceTest extends BaseTest {
  async testValidation () {
    const commonConfig = {
      service: 'test',
      components: [],
      cookie: { disabled: true },
      healthCheck: { disabled: true }
    }
    await expect(makeService())
      .rejects.toThrow('Missing required value for service')
    await expect(makeService({ ...commonConfig, cookie: { invalid: false } }))
      .rejects.toThrow('Unknown config invalid')
    await expect(makeService({ ...commonConfig, cookie: { disabled: false } }))
      .rejects.toThrow('Missing required value for')
    await makeService({
      ...commonConfig
    })
  }
}

runTests(makeServiceTest)
