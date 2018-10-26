"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var L1ClassMetaCache_1 = require("./ds/L1ClassMetaCache");
var logger_1 = require("./utils/logger");
function formatConfig(config) {
    if (typeof config === 'string') {
        return {
            key: config
        };
    }
    return config;
}
/**
 * 对一个对象的方法进行缓存
 *
 * 几点提示：
 * 当一个类中只有一个方法需要缓存时，不写 任何key参数是推荐的做法
 * 当一个类中有多个方法需要缓存时，不写 任何key参数或许同样可用（即便存在代码压缩，一般也都可用），但推荐写上全局唯一的key
 * 当一个需要缓存的方法的参数非常 “巨大”时，推荐使用 params2key 优化
 */
function aCache(conf) {
    var logger = logger_1.getLogger();
    // 格式化参数
    var config = formatConfig(conf || {});
    logger('config is: ', config);
    return function (target, methodName, descriptor) {
        logger('aCache : %s : %s : %o', target.constructor.name, methodName, L1ClassMetaCache_1.l1);
        // 原有方法
        var oldFunc = descriptor.get || descriptor.value;
        var newFunc = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            // 以类名，方法名作为 key
            var l2 = L1ClassMetaCache_1.l1.getOrCreate(config.key || target.constructor.name);
            var l3 = l2.getOrCreate(config.key || methodName);
            // 以实例作为 key
            var this2key = config.this2Key
                && config.this2Key.call(this, this);
            var paramsMapResult = l3.getOrCreate(this2key || this);
            // 以参数作为key
            var params2key = typeof config.params2key === 'function'
                ? config.params2key && config.params2key.apply(this, args)
                : config.params2key;
            var paramsKey = params2key || JSON.stringify(args);
            // 获取最终缓存的值
            var cachedVal = paramsMapResult.get(paramsKey);
            if (cachedVal) {
                return cachedVal;
            }
            var result = oldFunc.apply(this, args);
            paramsMapResult.set(paramsKey, result);
            return result;
        };
        // 替换原有方法
        if (descriptor.get) {
            descriptor.get = newFunc;
        }
        else {
            descriptor.value = newFunc;
        }
    };
}
exports.aCache = aCache;
//# sourceMappingURL=aCache.js.map