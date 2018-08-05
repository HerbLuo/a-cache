import test from 'ava'
import { aCache } from "../src/aCache"
import { disableCache } from "../src/disableCache"

const getUserPo = () => ({
  'uHt5z': {id: 'uHt5z', name: 'XaoMin', age: 22},
  'p3mUa': {id: 'p3mUa', name: 'DaXon', age: 21},
  'q8llb': {id: 'q8llb', name: 'LaoZan', age: 20}
})
const userIdA = 'uHt5z'
const userIdB = 'p3mUa'
const userIdC = 'q8llb'

test('empty options', async t => {
  let times = 0

  const userPo = getUserPo()
  class UserApi {
    @aCache()
    async getOne (id) {
      times++
      return userPo[id]
    }
    @disableCache()
    async merge (user) {
      const id = user.id
      const oldUser = userPo[id]
      userPo[id] = Object.assign({}, oldUser, user)
    }
  }

  const userApi = new UserApi()
  t.is(times, 0)
  // get user by id
  t.deepEqual(await userApi.getOne(userIdA), userPo[userIdA])
  t.is(times, 1)
  // call again
  t.deepEqual(await userApi.getOne(userIdA), userPo[userIdA])
  // data is cached
  t.is(times, 1)
  await userApi.merge({id: userIdA, age: 18})
  t.is(times, 1)
  // get the user info who was merged
  t.deepEqual(await userApi.getOne(userIdA), userPo[userIdA])
  t.is(times, 2)
  t.deepEqual(await userApi.getOne(userIdA), userPo[userIdA])
  t.is(times, 2)
})

test('with key option', async t => {
  let times = 0

  const userPo = getUserPo()
  class UserApiWithKeyOption {
    @aCache('UserApiWithKeyOption:getOne')
    async getOne (id) {
      times++
      return userPo[id]
    }
    @aCache()
    async getUserIds () {
      times++
      return Object.keys(userPo)
    }
    @disableCache('UserApiWithKeyOption:getOne')
    async merge (user) {
      const id = user.id
      const oldUser = userPo[id]
      userPo[id] = Object.assign({}, oldUser, user)
    }
  }

  const userApi = new UserApiWithKeyOption()
  t.is(times, 0)
  t.deepEqual(await userApi.getOne(userIdA), userPo[userIdA])
  t.is(times, 1)
  t.deepEqual(await userApi.getUserIds(), Object.keys(userPo))
  t.is(times, 2)
  await userApi.merge({id: userIdA, age: 18})
  t.is(times, 2)
  t.deepEqual(await userApi.getUserIds(), Object.keys(userPo))
  t.is(times, 2)
  t.deepEqual(await userApi.getOne(userIdA), userPo[userIdA])
  t.is(times, 3)
  t.deepEqual(await userApi.getOne(userIdA), userPo[userIdA])
  t.is(times, 3)
})

test('with this-to-key options', async t => {
  t.pass('TODO !!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
})