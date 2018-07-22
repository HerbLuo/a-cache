import test from 'ava'
import {aCache, disableCache} from "../lib/index"

const STATIC_FUNCTION_RESULT = 'static function result'
let times = 0

class TestCacheInStaticFunction {
  @aCache()
  static staticFetchData () {
    times ++
    return STATIC_FUNCTION_RESULT
  }
  @disableCache()
  static deleteAll () {
  }
}

test('static function', async t => {
  t.is(times, 0)
  t.is(await TestCacheInStaticFunction.staticFetchData(), STATIC_FUNCTION_RESULT)
  t.is(times, 1)
  t.is(await TestCacheInStaticFunction.staticFetchData(), STATIC_FUNCTION_RESULT)
  t.is(times, 1)
  TestCacheInStaticFunction.deleteAll()
  t.is(await TestCacheInStaticFunction.staticFetchData(), STATIC_FUNCTION_RESULT)
  t.is(times, 2)
  t.is(await TestCacheInStaticFunction.staticFetchData(), STATIC_FUNCTION_RESULT)
  t.is(times, 2)
})
