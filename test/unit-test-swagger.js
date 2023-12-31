import { BaseAppTest, runTests } from './base-test'

class SwaggerTest extends BaseAppTest {
  async testDocs () {
    const result = await this.app.get('/app/docs').send()
    expect(result.status).toBe(302)
  }
}

runTests(SwaggerTest)
