二：使用方法
1. 最简单的缓存  
对于一个特别耗时的操作，我们可以对它进行缓存

    ```javascript
    import aCache from '@herbluo/acache'

    class UserApi {
      @aCache()
      fetchAllUser () {
        console.log('fetchAllUser is running')
        return fetch('....').then(it => it.json())
      }
    }
 
    const api = new UserApi()
    export default api
    ```
    此时运行如下代码  
    ```
    console.log(api.fetchAllUser() === api.fetchAllUser())
    ``` 
    控制台会输出
    ```
    "fetchAllUser is running"
    true
    ```
    
2. 取消某种缓存  
当我们修改了一组数据后，需要取消缓存

    ```javascript
    import {aCache, disableCache} from '@herbluo/acache'
 
    class UserApi {
      @aCache()
      fetchAllUser () {
        return fetch('....').then(it => it.json())
      }
   
      /**
       * 默认会把 user contactsApi
       */
      @disableCache()  
      mergeUsers(users) {
        // 修改用户信息 .....
      }
    }
 
    const api = new UserApi()
    export default api
    ```
    
3. 指定 key  
指定取消哪种缓存, xxx无需

    ```javascript
    import {aCache, disableCache} from '@herbluo/acache'
 
    class UserApi {
      @aCache()
      fetchAllUser () {
        return fetch('....').then(it => it.json())
      }
   
      @aCache('UserApi:fetchUserDetail')
      fetchUserDetail (id) {
        return fetch('...').then(it => it.json())
      }
   
     /**
      * 该操作只会清空 fetchUserDetail下的缓存
      */
      @disableCache('UserApi:fetchUserDetail')  
      mergeUserDetail(id, userDetail) {
        // 修改用户详细信息 .....
      }
    }
 
    const api = new UserApi()
    export default api
    ```
    
4. 指定id `params2key`  
更精确地指定取消哪次缓存
    ```javascript
    import {aCache, disableCache} from '@herbluo/acache'
 
    class UserApi {
      @aCache('UserApi:fetchUserDetail')
      // 上一行代码等同于
      @aCache({
        key: 'UserApi:fetchUserDetail',
        params2key (...args) {
          return JSON.stringify(args)
        }
      })
      fetchUserDetail (id) {
        return fetch('...').then(it => it.json())
      }
   
     /**
      * 该操作只会清空 fetchUserDetail下的 id相同的缓存，
      */
      @disableCache({
        key: 'UserApi:fetchUserDetail',
        params2key(id, userDetail) {
          return JSON.stringify([id])
        }
      })  
      mergeUserDetail(id, userDetail) {
        // 修改用户详细信息 .....
      }
    }
 
    const api = new UserApi()
    export default api
    ```

5. 指定实例 `this2key`（该操作慎用，除非你阅读过源代码或知道你现在在做什么）  
主要针对多个实例共用一个缓存的情况

三：其它一些说明
aCache可以用于get方法，但disableCache只能用于普通方法，不可用于get,set方法
    