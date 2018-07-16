import test from 'ava'
import {aCache, disableCache} from "../lib/index.esm"

const RESULT_STRING_A = 'multiple class cache result a'
const RESULT_STRING_B = 'multiple class cache result b'

let times = 0
class TestCacheInMultipleClassA {
  @aCache()
  fetchDataA () {
    times ++
    return RESULT_STRING_A
  }
  @disableCache()
  deleteData () {
  }
}
class TestCacheInMultipleClassB {
  @aCache()
  fetchDataB () {
    times ++
    return RESULT_STRING_B
  }
}

test('multiple class', async t => {

})