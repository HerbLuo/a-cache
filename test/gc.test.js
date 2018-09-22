import test from 'ava'
import { aCache } from "../lib/index"
import { delay } from './utils/delay'

const genData = () =>
  Array(1e7).fill(null).map((it, i) => i)

const dataMemSize = 1e7 * 8

let times = 0

class TestGc {
  @aCache()
  getUser () {
    times ++
    return {
      id: Math.random(),
      data: genData()
    }
  }
}

test('weak map gc test', async (t) => {
  await delay(5e3)
  console.log('gc test log')
  const gcTest = new TestGc()
  t.is(times, 0)
  const data1 = await gcTest.getUser()
  t.is(times, 1)

  // if the gc is not affect data caching
  try {
    global.gc()
  } catch (e) {
    console.log(e)
  }

  console.log(process.memoryUsage())
  await delay(1e4)
  const memoryUsageAfterGc = process.memoryUsage()
  console.log(memoryUsageAfterGc)

  // we expect the data is from memory
  console.log('call again, the data may not generate twice')
  const data2 = await gcTest.getUser()
  t.is(data1, data2, 'data is cached')
  const memoryUsageAfterReCall = process.memoryUsage()
  console.log(memoryUsageAfterReCall)
  t.true(memoryUsageAfterReCall.heapUsed - memoryUsageAfterGc.heapUsed
    < dataMemSize * 0.1)
  t.is(times, 1)

})
