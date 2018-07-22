import test from 'ava'
import {aCache, disableCache} from "../lib/index"

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
  @disableCache()
  deleteData () {
  }
}

test('works in a multi-class environment', async t => {
  const a = new TestCacheInMultipleClassA()
  const b = new TestCacheInMultipleClassB()
  t.is(await a.fetchDataA(), RESULT_STRING_A)
  t.is(times, 1)
  t.is(await b.fetchDataB(), RESULT_STRING_B)
  t.is(times, 2)
  t.is(await a.fetchDataA(), RESULT_STRING_A)
  t.is(times, 2)
  t.is(await b.fetchDataB(), RESULT_STRING_B)
  t.is(times, 2)
  a.deleteData()
  t.is(await b.fetchDataB(), RESULT_STRING_B)
  t.is(times, 2)
  t.is(await a.fetchDataA(), RESULT_STRING_A)
  t.is(times, 3)
  t.is(await a.fetchDataA(), RESULT_STRING_A)
  t.is(times, 3)
  b.deleteData()
  t.is(await a.fetchDataA(), RESULT_STRING_A)
  t.is(times, 3)
  t.is(await b.fetchDataB(), RESULT_STRING_B)
  t.is(times, 4)
  t.is(await b.fetchDataB(), RESULT_STRING_B)
  t.is(times, 4)
})
