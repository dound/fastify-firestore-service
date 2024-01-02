import { v4 as uuidv4 } from 'uuid'

import { BaseAppTest, runTests } from './base-test.js'

function getURI (postfix) {
  return '/unittest' + postfix
}

class DBLibTest extends BaseAppTest {
  async testThrow500 () {
    // Make sure custom loggers etc works.
    const result = await this.app.post(getURI('/throw500')).expect(500)
    expect(result.body.stack.join('\n')).toContain('examples/db.js')
  }

  async testClientErrorAPIWorking () {
    return this.app.post(getURI('/clienterrors'))
      .send('{"json": {"anything": ["goes"]}}')
      .set('Content-Type', 'application/json')
      .expect(200)
  }

  async testQueryJsonFail () {
    const result = await this.app.post(getURI('/clienterrors'))
      .query('{d}').expect(400)
    expect(result.body.message).toBe('Body Validation Failure: body must be object')
  }

  async testBodyJsonFail () {
    const result = await this.app.post(getURI('/clienterrors'))
      .send('{d}')
      .set('Content-Type', 'application/json')
      .expect(400)
    expect(result.body.message).toMatch(/Expected property name or.*in JSON/)
  }

  async testMissingRequiredPropFail () {
    const result = await this.app.post(getURI('/clienterrors'))
      .send('{}')
      .set('Content-Type', 'application/json')
      .expect(400)
    expect(result.body.message).toBe("Body Validation Failure: body must have required property 'json'")
  }

  async testBodyContentTypeFail () {
    const result = await this.app.post(getURI('/clienterrors'))
      .send('{}')
      .set('Content-Type', 'text/html')
      .expect(415)
    expect(result.body.message).toBe('Content-Type Not Permitted')
  }

  async testValidJsonSchema () {
    await this.app.post(getURI('/jsonschema'))
      .set('Content-Type', 'application/json')
      .send({
        modelCount: 1
      })
      .expect(200)
  }

  async testDatabaseAPICommit () {
    const maxRetriesToSucceed = 3
    const nValues = {}
    const app = this.app
    // note: this example API is configured to retry up to 3 times
    async function check (id, delta, numTimesToRetry, failInPreCommit) {
      const shouldSucceed = numTimesToRetry <= maxRetriesToSucceed
      const resp = await app.post('/unittest/dbWithDatabaseAPI')
        .set('Content-Type', 'application/json')
        .send({ id, delta, numTimesToRetry, failInPreCommit })
        .expect(shouldSucceed ? 200 : 500)

      if (!shouldSucceed) {
        expect(resp.body.code).toBe('TransactionFailedError')
        return
      }

      if (!nValues[id]) {
        nValues[id] = 0
      }
      nValues[id] += 5 + delta
      expect(resp.body).toEqual({
        computeCalls: numTimesToRetry + 1,
        postComputeCalls: failInPreCommit ? (numTimesToRetry + 1) : 1,
        n: nValues[id],
        postCommitMsg: 'commit succeeded'
      })
    }
    const id1 = uuidv4()
    await check(id1, 3, 2, false) // try failing in computeResponse()
    await check(id1, 4, 3, true) // try failing in postOkResponse()
    await check(id1, 7, 0, true) // can add more
    await check(uuidv4(), -1, 0, true) // can work on other db documents too
    await check(id1, 2, 4, false) // can fail all retries => no postCommit()
    await check(id1, 1, 0, false) // check value is okay after failure
  }

  async testRememberTooMuch () {
    const app = this.app
    let lifetimeTries = 0
    async function check (numTries) {
      const resp = await app.post('/unittest/overshare')
        .set('Content-Type', 'application/json')
        .send({ numTries })
        .expect(200)
      lifetimeTries += numTries
      expect(resp.body).toEqual({
        numTries,
        numTriesOnThisMachine: lifetimeTries
      })
    }
    await check(1)
    await check(3)
    await check(2)
    expect(lifetimeTries).toBe(6)
  }
}

runTests(DBLibTest)
