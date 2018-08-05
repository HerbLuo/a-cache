import test from 'ava'
import {aCache, disableCache} from "../lib/index.js"

test('default cache', async t => {
  const RESULT_STRING_0 = 'default cache result'
  let times = 0

  class TestApi4DefaultCache {
    @aCache()
    async fetchData () {
      times ++
      return RESULT_STRING_0
    }
  }

  const api = new TestApi4DefaultCache()
  t.is(times, 0)
  t.is(await api.fetchData(), RESULT_STRING_0, 'first call')
  t.is(times, 1)
  t.is(await api.fetchData(), RESULT_STRING_0, 'second call')
  t.is(times, 1)
})

test('default disable cache', async t => {
  const RESULT_STRING_0 = 'default disable cache result'
  const RESULT_STRING_1 = 'default disable cache result 1'
  let times = 0

  class TestApi4DisableCache {
    @aCache()
    async fetchData () {
      times ++
      return RESULT_STRING_0
    }
    @aCache()
    async fetchDetail () {
      times ++
      return RESULT_STRING_1
    }

    /**
     * the operation will disable all the data which is cached by this instance
     */
    @disableCache()
    async mergeData () {
    }
  }

  const api = new TestApi4DisableCache()
  t.is(times, 0)
  t.is(await api.fetchData(), RESULT_STRING_0, 'call 1 time')
  t.is(times, 1)
  t.is(await api.fetchData(), RESULT_STRING_0, 'call 2 times')
  t.is(times, 1)
  await api.mergeData()
  t.is(times, 1)
  t.is(await api.fetchData(), RESULT_STRING_0, 'twice call')
  t.is(times, 2)
})

// config
