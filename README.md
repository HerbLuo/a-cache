### 一：简介
1. a-cache 是一个利用注解实现的缓存工具
2. 它的特点是非常轻量级，不影响现有代码的逻辑结构
3. 但a-cache 推荐在项目中 至少写一个单独的api层（注1）
4. a-cache能利用类名，方法名，方法的参数以及类的当前实例做到较为精细的缓存

安装方式：  
```npm i a-cache --save```  
或  
```yarn add a-cache```

### 二：常规用法
##### 1. 最简单的缓存  
    
    如：下方fetchAllUser 在缓存失效前，不会多次发送请求
    ```javascript
    import { aCache } from '@o2v/a-cache'

    class UserApi {
      @aCache()
      fetchAllUser () {
        return fetch('....').then(toJson)
      }
   
      @aCache('UserApi:getAllUserIds') // 对于静态方法，必须指定 key，见4.2
      static getAllUserIds () {
        return Promise.resolve()
      }
    }
 
    const api = new UserApi()
    export default api
    ```
    对于实例方法，在代码压缩后仍然正常使用，但要注意以下情况，详见 4.2
    
##### 2. 手动取消缓存  
    如： 如下方mergeUsers调用后（前），会清除当前实例下的所有缓存数据
    ```javascript
    import { aCache, disableCache } from '@o2v/a-cache'
 
    class UserApi {
      @aCache()
      fetchAllUser () {
        return fetch('....').then(toJson)
      }
   
      @disableCache()  
      mergeUser(user) {
        return fetch('....').then(toJson)
      }
    }
 
    const api = new UserApi()
    export default api
    ```
    
##### 3. 使用`key`来指定取消某种缓存  
    如：下方的mergeUser调用后，只会清空fetchAllUsers产生的缓存（因为他们的key都是UserApi:fetchAllUsers），
    而fetchUserIds产生的缓存，并不会删除。
    ```javascript
    import { aCache, disableCache } from '@o2v/a-cache'
 
    class UserApi {
      @aCache()
      fetchUserIds () {
        return fetch('....').then(toJson)
      }
   
      @aCache('UserApi:fetchAllUsers')
      fetchAllUsers () {
        return fetch('....').then(toJson)
      }
   
      @disableCache('UserApi:fetchAllUsers')  
      mergeUser(user) {
        return fetch('....').then(toJson)
      }
    }
 
    const api = new UserApi()
    export default api
    ```

### 三：更多用法
##### 1. 较为完整的用法  
    ```javascript
    import { aCache, disableCache } from "a-cache"

    let times = 0

    class UserApi {
      @aCache({
        key: 'UserApi:fetchUser',
        params2key: id => id
      })
      fetchUser (id) {
        times ++
        return Promise.resolve(UserApi.data[id])
      }

      @aCache('UserApi:fetchUserIds')
      fetchUserIds () {
        times ++
        return Promise.resolve(Object.keys(UserApi.data))
      }

      @aCache({
        key: 'UserApi:fetchAll',
        this2Key: 'single' // 实际使用时，建议将UserApi以对象的实例形式直接导出
                           // 若如此做，无需配置此项
      })
      fetchAll () {
        times ++
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
    // 实际使用中，并不建议创建多个实例
    const userApi2 = new UserApi()
    ```
##### 更多场景（多个类，多个实例下的相互作用等）见测试用例。

### 四：其它一些说明
1. aCache可以用于get方法，  
但disableCache只能用于普通方法，不可用于get,set方法
2. 一般情况下，  
即使不指定任何配置项，当代码压缩后，a-cache仍然可以正常使用，
但是当我们针对一个静态方法使用aCache注解时，代码压缩后，aCache有很大概率失效。  
此时，必须指定key。
 
```
注1：  

注2：以下两种情形除外，①：；②：
```

