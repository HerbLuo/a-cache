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
    @aCache({
      key: 'UserApiWithKeyOption:getUserIds'
    })
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
    @disableCache(['UserApiWithKeyOption:getUserIds', {
      key: 'UserApiWithKeyOption:getOne'
    }])
    async delete (userId) {
      delete userPo[userId]
    }
  }
  class UserApi {
    constructor (userId) {
      this.userId = userId
    }

    @disableCache('UserApiWithKeyOption:getOne')
    async merge (user) {
      const oldUser = userPo[this.userId]
      userPo[this.userId] = Object.assign({}, oldUser, user)
    }
  }

  const userApi = new UserApiWithKeyOption()
  t.is(times, 0)
  t.deepEqual(await userApi.getOne(userIdA), userPo[userIdA])
  t.is(times, 1)
  t.deepEqual(await userApi.getUserIds(), Object.keys(userPo))
  t.is(times, 2)

  // merge
  await userApi.merge({id: userIdA, age: 18})
  t.is(times, 2)
  t.deepEqual(await userApi.getUserIds(), Object.keys(userPo))
  t.is(times, 2)
  t.deepEqual(await userApi.getOne(userIdA), userPo[userIdA])
  t.is(times, 3)

  // merge 2
  t.is(await userApi.getOne(userIdB), userPo[userIdB])
  t.is(times, 4)
  t.is(await userApi.getOne(userIdB), userPo[userIdB])
  t.is(times, 4)
  const userApi2 = new UserApi(userIdB)
  await userApi2.merge({age: 8})
  t.is(times, 4)
  t.is(await userApi.getOne(userIdB).then(({age}) => age), 8)
  t.is(times, 5)
  t.is(await userApi.getOne(userIdB), userPo[userIdB])
  t.is(times, 5)

  // delete
  t.deepEqual(await userApi.getOne(userIdA), userPo[userIdA])
  t.is(times, 6)
  await userApi.delete(userIdA)
  t.is(times, 6)
  t.deepEqual(await userApi.getUserIds(), Object.keys(userPo))
  t.is(times, 7)
  t.deepEqual(await userApi.getOne(userIdA), userPo[userIdA])
  t.is(times, 8)
  t.deepEqual(await userApi.getUserIds(), Object.keys(userPo))
  t.is(times, 8)
  t.deepEqual(await userApi.getOne(userIdA), userPo[userIdA])
  t.is(times, 8)
})

test('with this-to-key options', async t => {
  let times = 0

  const userPo = getUserPo()
  class UserApiWithThis2KeyOption {
    constructor (userId) {
      this.userId = userId
    }

    @aCache({
      key: 'UserApiWithThis2KeyOption:getOne',
      this2Key: that => that.userId.toString() // 不可以返回object类型
    })
    async getSelfInfo () {
      times++
      return userPo[this.userId]
    }

    @aCache({
      key: 'UserApiWithThis2KeyOption:getAll',
      this2Key: that => 'single'
    })
    async getAll () {
      times++
      return Object.values(userPo)
    }

    @disableCache(['UserApiWithThis2KeyOption:getAll', {
      key: 'UserApiWithThis2KeyOption:getOne',
      this2Key: that => that.userId.toString()
    }])
    async merge (user) {
      delete user.id
      const id = this.userId
      const oldUser = userPo[id]
      userPo[id] = Object.assign({}, oldUser, user)
    }
  }

  const userAApi = new UserApiWithThis2KeyOption(userIdA)
  const userBApi = new UserApiWithThis2KeyOption(userIdB)
  t.is(times, 0)
  t.deepEqual(await userAApi.getSelfInfo(), userPo[userIdA])
  t.is(times, 1)
  t.deepEqual(await userAApi.getSelfInfo(), userPo[userIdA])
  t.is(times, 1)
  t.deepEqual(await userBApi.getSelfInfo(), userPo[userIdB])
  t.is(times, 2)
  t.deepEqual(await userBApi.getSelfInfo(), userPo[userIdB])
  t.is(times, 2)

  t.deepEqual(await userAApi.getAll(), Object.values(userPo))
  t.is(times, 3)
  t.deepEqual(await userAApi.getAll(), Object.values(userPo))
  t.is(times, 3)
  t.deepEqual(await userBApi.getAll(), Object.values(userPo))
  t.is(times, 3)

  await userAApi.merge({age: 12})
  t.is(times, 3)
  t.is(await userAApi.getSelfInfo().then(info => info.age), 12)
  t.is(times, 4)
  t.is(await userAApi.getSelfInfo().then(info => info.age), 12)
  t.is(times, 4)
  t.deepEqual(await userBApi.getAll(), Object.values(userPo))
  t.is(times, 5)
  t.deepEqual(await userAApi.getAll(), Object.values(userPo))
  t.is(times, 5)
})

test('with params-to-key options', async t => {
  let times = 0

  const userPo = getUserPo()
  class UserApiWithParams2KeyOptions {
    @aCache({
      key: 'UserApiWithParams2KeyOptions:getOne',
      params2key: id => id
    })
    async getOne (id) {
      times++
      return userPo[id]
    }
    @disableCache({
      key: 'UserApiWithParams2KeyOptions:getOne',
      params2key: user => user.id
    })
    async merge (user) {
      const id = user.id
      const oldUser = userPo[id]
      userPo[id] = Object.assign({}, oldUser, user)
    }
  }

  const api = new UserApiWithParams2KeyOptions()
  t.is(times, 0)
  t.deepEqual(await api.getOne(userIdA), userPo[userIdA])
  t.is(times, 1)
  t.deepEqual(await api.getOne(userIdA), userPo[userIdA])
  t.is(times, 1)
  t.deepEqual(await api.getOne(userIdB), userPo[userIdB])
  t.is(times, 2)
  t.deepEqual(await api.getOne(userIdB), userPo[userIdB])
  t.is(times, 2)
  await api.merge({id: userIdA, age: 23})
  t.is(times, 2)
  t.deepEqual(await api.getOne(userIdB), userPo[userIdB])
  t.is(times, 2)
  t.deepEqual(await api.getOne(userIdA), userPo[userIdA])
  t.is(times, 3)
  t.deepEqual(await api.getOne(userIdA), userPo[userIdA])
  t.is(times, 3)
  await api.merge({id: userIdB, age: 23})
  t.is(times, 3)
  t.deepEqual(await api.getOne(userIdA), userPo[userIdA])
  t.is(times, 3)
  t.deepEqual(await api.getOne(userIdB), userPo[userIdB])
  t.is(times, 4)
  t.deepEqual(await api.getOne(userIdB), userPo[userIdB])
  t.is(times, 4)
  await api.merge({id: userIdC, age: 99})
  t.is(times, 4)
  t.deepEqual(await api.getOne(userIdA), userPo[userIdA])
  t.is(times, 4)
  t.deepEqual(await api.getOne(userIdB), userPo[userIdB])
})
