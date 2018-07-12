(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (factory((global.acache = {})));
}(this, (function (exports) { 'use strict';

    function isArray(val) {
        return val instanceof Array;
    }
    function isString(val) {
        return typeof val === 'string';
    }

    /**
     * aCache 的缓存结构有三层
     * @version 0.0.1
     */
    var ClassMetaMapData = /** @class */ (function () {
        function ClassMetaMapData() {
            this._cache = new Map();
        }
        ClassMetaMapData.prototype.get = function (key) {
            return this._cache.get(key);
        };
        ClassMetaMapData.prototype.set = function (key, value) {
            this._cache.set(key, value);
        };
        ClassMetaMapData.prototype.delete = function (key) {
            this._cache.delete(key);
        };
        ClassMetaMapData.prototype.getAndPutIfClassMetaNotExist = function (key) {
            var t = this.get(key);
            if (t) {
                return t;
            }
            t = new InstanceMapData();
            this.set(key, t);
            return t;
        };
        return ClassMetaMapData;
    }());
    var InstanceMapData = /** @class */ (function () {
        function InstanceMapData() {
            this._cache = new WeakMap();
            this.keyReference = new Map();
        }
        InstanceMapData.prototype.get = function (key) {
            var nKey = typeof key === 'object'
                ? key
                : this.keyReference.get(key);
            if (!nKey) {
                return;
            }
            return this._cache.get(nKey);
        };
        InstanceMapData.prototype.set = function (key, value) {
            this._cache.set(key, value);
        };
        InstanceMapData.prototype.delete = function (key) {
            this._cache.delete(key);
        };
        // 获取某个缓存，如果不存在，创建一个并返回
        // 该缓存扩展了 weakMap，使得 key可以为非 object对象
        InstanceMapData.prototype.getAndPutIfInstanceNotExist = function (key) {
            var nKey = typeof key === 'object'
                ? key
                : this.keyReference.get(key);
            if (!nKey) {
                nKey = {};
                this.keyReference.set(key, nKey);
            }
            var t = this.get(nKey);
            if (t) {
                return t;
            }
            t = new Map();
            if (typeof key === 'object') {
                this.set(key, t);
            }
            return t;
        };
        return InstanceMapData;
    }());
    var anythingCache = new ClassMetaMapData();
    // endregion 缓存数据结构
    /**
     * 对一个对象的方法进行缓存
     *
     * 几点提示：
     * 当一个类中只有一个方法需要缓存时，不写 任何key参数是推荐的做法
     * 当一个类中有多个方法需要缓存时，不写 任何key参数或许同样可用（即便存在代码压缩，一般也都可用），但推荐写上全局唯一的key
     * 当一个需要缓存的方法的参数非常 “巨大”时，推荐使用 params2key 优化
     *
     * 缓存规则：
     * 只有当如下条件都相同时，数据才会从缓存读取
     * （类名 + 方法名）  +  当前对象的实例  +  JSON.stringify(参数)
     * （可用 key代替） （可用 this2key代替） （可用 params2key代替）
     *     Map              WeakMap             Map
     */
    function aCache(conf) {
        // 格式化参数
        var config = formatConfig(conf || {});
        return function (target, methodName, descriptor) {
            // 原有方法
            var oldFunc = descriptor.get || descriptor.value;
            // 以类名，方法名作为 key
            var key = config.key || target.constructor.name + ":" + methodName;
            // 获取第二层，第二层的key为实例
            var instanceMapParamsMapResult = anythingCache
                .getAndPutIfClassMetaNotExist(key);
            var newFunc = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                // 以实例作为 key
                var this2key = config.this2Key
                    && config.this2Key.apply(this, this);
                // 获取第三层 第三层的key为 JSON.stringify(参数)
                var paramsMapResult = instanceMapParamsMapResult
                    .getAndPutIfInstanceNotExist(this2key || this);
                // 以参数作为key
                var params2key = typeof config.params2key === 'function'
                    ? config.params2key && config.params2key.apply(this, args)
                    : config.params2key;
                var paramsKey = params2key || JSON.stringify(args);
                // 获取最终缓存的值
                var cachedVal = paramsMapResult
                    .get(paramsKey);
                // 找到了缓存的结果
                if (cachedVal) {
                    return cachedVal;
                }
                // 未找到，运行原有方法
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
    function formatDisableCacheConfig(config) {
        if (isString(config)) {
            return [{ key: config }];
        }
        if (isArray(config)) {
            if (config.length === 0) {
                throw new Error('参数错误');
            }
            var isArrayString = function (val) {
                return isString(val[0]);
            };
            if (isArrayString(config)) {
                return config.map(function (it) { return ({ key: it }); });
            }
            return config;
        }
        return [config];
    }
    function disableCache(conf) {
        var configs = formatDisableCacheConfig(conf || {});
        return function (target, methodName, descriptor) {
            // 原有方法
            var oldFunc = descriptor.get || descriptor.value;
            var instanceMapParamsMapResults = configs.map(function (config) {
                // 以类名，方法名作为 key
                var key = config.key ||
                    target.constructor.name + ":" + methodName; // TODO ERROR HERE
                // 获取第二层，第二层的key为实例
                return [config, anythingCache.get(key)];
            });
            descriptor.value = function () {
                var _this = this;
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                instanceMapParamsMapResults.forEach(function (_a) {
                    var config = _a[0], instanceMapParamsMapResult = _a[1];
                    console.log(instanceMapParamsMapResult);
                    // 没有该缓存或者出错
                    if (!instanceMapParamsMapResult) {
                        return;
                    }
                    // 以实例作为 key
                    var this2key = config.this2Key
                        && config.this2Key.apply(_this, _this);
                    console.log(this2key);
                    console.log(config);
                    // 没有配置参数
                    if (!config.params2key) {
                        instanceMapParamsMapResult.delete(this2key || _this);
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
                return oldFunc.apply(this, args);
            };
        };
    }
    function formatConfig(config) {
        if (typeof config === 'string') {
            return {
                key: config
            };
        }
        return config;
    }

    exports.aCache = aCache;
    exports.disableCache = disableCache;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
