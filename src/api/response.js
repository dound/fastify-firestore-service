import S from '@pocketgems/schema'

const RESPONSES = {
  NO_OUTPUT: S.str.max(0).lock(),
  UNVALIDATED: undefined
}

export default RESPONSES
