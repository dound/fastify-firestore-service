import S from '@pocketgems/schema'

import { API } from '../src/index'

function fetchPage ({ amount, nextToken }) {
  if (!nextToken) {
    return {
      list: ['1'],
      nextToken: '1'
    }
  } else if (parseInt(nextToken) < 3) {
    const ret = (parseInt(nextToken) + 1).toString()
    return {
      list: [ret],
      nextToken: ret
    }
  } else {
    return {
      list: ['done']
    }
  }
}

class PaginatedAPI extends API {
  static DESC = 'Paginated API'
  static PATH = '/paginated'
  static ENABLE_PAGINATION = true
  static RESPONSE = {
    list: S.arr(S.str)
  }

  async computeResponse (req) {
    const { amount, nextToken } = req.query
    return fetchPage({ amount, nextToken })
  }
}

export {
  PaginatedAPI
}
