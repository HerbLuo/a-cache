一：简介
1. a-cache 是一个利用注解实现的缓存工具
2. 他的特点是非常轻量级，不影响现有代码的逻辑结构
3. 但a-cache 推荐在项目中专门分离api层（注1）

安装方式：  
```npm i a-cache --save```  
或  
```yarn add a-cache```

二：常规用法
1. 最简单的缓存  
    
    如：下方fetchAllUser 在缓存失效前，不会多次发送请求
    ```javascript
    import { aCache } from 'a-cache'

    class UserApi {
      @aCache()
      fetchAllUser () {
        return fetch('....').then(toJson)
      }
    }
 
    const api = new UserApi()
    export default api
    ```
    这种缓存的方法，在代码压缩后仍然正常使用，但要注意以下情况，见 4.2
    
2. 手动取消缓存  
    如： 如下方mergeUsers调用后（前），会清除当前实例下的所有缓存数据
    ```javascript
    import { aCache, disableCache } from 'a-cache'
 
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
    
3. 使用`key`来指定取消某种缓存  
    如：下方的mergeUser调用后，只会清空fetchAllUsers产生的缓存（因为他们的key都是UserApi:fetchAllUsers），
    而fetchUserIds产生的缓存，并不会删除。
    ```javascript
    import { aCache, disableCache } from 'a-cache'
 
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

三：更多用法
1. 较为完整的用法  
    ```javascript
    import { aCache, disableCache } from 'a-cache'
 
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
更多场景（多个类，多个实例下的相互作用等）见测试用例。

四：其它一些说明
1. aCache可以用于get方法，但disableCache只能用于普通方法，不可用于get,set方法
2. 一般情况下，即使不指定key等配置项，即便是代码压缩后，a-cache仍然可以正常使用，
但是当我们针对一个静态方法使用aCache注解时，aCache有挺大概率失效。此时，必须指定key。
    
注1：  

注2：以下两种情形除外，①：；②：
