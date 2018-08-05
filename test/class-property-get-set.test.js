import test from 'ava'
import { aCache } from "../lib/index"
import { disableCache } from "../lib/index"

const T_RESULT = 'getter test t func result'

let times = 0

class TestGetterAndSetter {
  @aCache()
  get t () {
    times ++
    return T_RESULT
  }
  @disableCache()
  disableCache () {
  }
}

test('test of getter', async t => {
  const testClass = new TestGetterAndSetter()
  t.is(times, 0)
  t.is(await testClass.t, T_RESULT)
  t.is(times, 1)
  t.is(await testClass.t, T_RESULT)
  t.is(times, 1)
  testClass.disableCache()
  t.is(times, 1)
  t.is(await testClass.t, T_RESULT)
  t.is(times, 2)
  t.is(await testClass.t, T_RESULT)
  t.is(times, 2)
})
