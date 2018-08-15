import test from 'ava'
import { aCache, disableCache } from "../lib/index"

let times = 0

class UserApi {
  @aCache({
    key: 'UserApi:fetchUser',
    params2key: id => id
  })
  fetchUser (id) {
    return Promise.resolve(UserApi.data[id])
  }

  @aCache('UserApi:fetchUserIds')
  fetchUserIds () {
    return Promise.resolve(Object.keys(UserApi.data))
  }

  @aCache({
    key: 'UserApi:fetchAll',
    this2Key: 'single' // 实际使用时，建议将UserApi以对象的实例形式直接导出
                       // 若如此做，无需配置此项
  })
  fetchAll () {
    return Promise.resolve(Object.values(UserApi.data))
  }

  @disableCache([
    'UserApi:fetchAll',
    {
      key: 'UserApi:fetchUser',
      params2key: user => user.id
    }
  ])
  mergeUser (user) {
    return this.fetchUser(user.id)
      .then(oldUser => Object.assign({}, oldUser, user))
      .then(this.saveUser)
  }

  @disableCache([
    'UserApi:fetchUserIds',
    'UserApi:fetchAll',
    {
      key: 'UserApi:fetchUser',
      params2key: user => user.id
    }
  ])
  saveUser (user) {
    UserApi.data[user.id] = user
    return Promise.resolve(1)
  }

  static data = {
    'uHt5z': {id: 'uHt5z', name: 'XaoMin', age: 22},
    'p3mUa': {id: 'p3mUa', name: 'DaXon', age: 21},
    'q8llb': {id: 'q8llb', name: 'LaoZan', age: 20}
  }
}

export const userApi = new UserApi()
// 实际使用中，并不建议允许创建多个实例
const userApi2 = new UserApi()

test('full-featured', async t => {

})
