"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils/utils");
var L1ClassMetaCache_1 = require("./ds/L1ClassMetaCache");
var logger_1 = require("./utils/logger");
function formatDisableCacheConfig(config) {
    if (utils_1.isString(config)) {
        return [{ key: config }];
    }
    if (utils_1.isArray(config)) {
        var configs = config;
        if (config.length === 0) {
            throw new Error('参数错误');
        }
        return configs.map(function (c) {
            if (utils_1.isString(c)) {
                return { key: c };
            }
            return c;
        });
    }
    return [config];
}
function disableCache(conf) {
    var logger = logger_1.getLogger();
    var configs = formatDisableCacheConfig(conf || {});
    logger('disable a cache\'s config is: ', configs);
    return function (target, methodName, descriptor) {
        // 原有方法
        var oldFunc = descriptor.get || descriptor.value;
        descriptor.value = function () {
            var _this = this;
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            logger('disableACache : %s : %s : %o', target.constructor.name, methodName, L1ClassMetaCache_1.l1);
            var result = oldFunc.apply(this, args);
            var instanceMapParamsMapResults = configs.map(function (config) {
                var l2 = L1ClassMetaCache_1.l1.get(config.key || target.constructor.name);
                var l3 = l2 && l2.get(config.key || methodName);
                return [config, l3];
            });
            instanceMapParamsMapResults.forEach(function (_a) {
                var config = _a[0], instanceMapParamsMapResult = _a[1];
                if (!conf) {
                    L1ClassMetaCache_1.l1.delete(target.constructor.name);
                    return;
                }
                // 没有该缓存或者出错
                if (!instanceMapParamsMapResult) {
                    return;
                }
                // 以实例作为 key
                var this2key = config.this2Key
                    && config.this2Key.call(_this, _this);
                // 没有配置参数
                if (!config.params2key) {
                    if (this2key) {
                        instanceMapParamsMapResult.delete(this2key);
                    }
                    else {
                        instanceMapParamsMapResult.clear();
                    }
                    return;
                }
                // 获取第三层 第三层的key为 JSON.stringify(参数)
                var paramsMapResult = instanceMapParamsMapResult
                    .get(this2key || _this);
                // 未找到该组数据，返回
                if (!paramsMapResult) {
                    return;
                }
                // 以参数作为key
                var params2key = typeof config.params2key === 'function'
                    ? config.params2key && config.params2key.apply(_this, args)
                    : config.params2key;
                // 删除缓存的值
                paramsMapResult.delete(params2key);
            });
            return result;
        };
    };
}
exports.disableCache = disableCache;
//# sourceMappingURL=disableCache.js.map