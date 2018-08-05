function __extends(d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var consumeMap = Map;
var consumeWeakMap = WeakMap;
var ExMap = /** @class */ (function () {
    function ExMap() {
    }
    ExMap.prototype.set = function (key, value) {
        if (!this._map) {
            this._map = new consumeMap([[key, value]]);
        }
        else {
            this._map.set(key, value);
        }
        return this;
    };
    ExMap.prototype.get = function (key) {
        return this._map && this._map.get(key);
    };
    ExMap.prototype.delete = function (key) {
        return Boolean(this._map && this._map.delete(key));
    };
    ExMap.prototype.forEach = function (callbackfn, thisArg) {
        this._map && this._map.forEach(callbackfn, thisArg);
    };
    ExMap.prototype.has = function (key) {
        return Boolean(this._map && this._map.has(key));
    };
    ExMap.prototype.clear = function () {
        this._map && this._map.clear();
    };
    Object.defineProperty(ExMap.prototype, "size", {
        get: function () {
            return this._map ? this._map.size : 0;
        },
        enumerable: true,
        configurable: true
    });
    return ExMap;
}());
var ExWeakMap = /** @class */ (function () {
    function ExWeakMap() {
        this._keyReference = new Map();
    }
    ExWeakMap.prototype.getRelKey = function (exKey) {
        if (typeof exKey === 'object') {
            return exKey;
        }
        return this._keyReference.get(exKey);
    };
    ExWeakMap.prototype.getRelKeyAndCreateIfNone = function (exKey) {
        var nKey = this.getRelKey(exKey);
        if (!nKey) {
            nKey = {};
            this._keyReference.set(exKey, nKey);
        }
        return nKey;
    };
    ExWeakMap.prototype.delete = function (key) {
        if (!this._weakMap) {
            return false;
        }
        var relKey = this.getRelKey(key);
        if (!relKey) {
            return false;
        }
        return this._weakMap.delete(relKey);
    };
    ExWeakMap.prototype.has = function (key) {
        if (!this._weakMap) {
            return false;
        }
        var relKey = this.getRelKey(key);
        if (!relKey) {
            return false;
        }
        return this._weakMap.has(relKey);
    };
    ExWeakMap.prototype.get = function (key) {
        if (!this._weakMap) {
            return undefined;
        }
        var relKey = this.getRelKey(key);
        if (!relKey) {
            return undefined;
        }
        return this._weakMap.get(relKey);
    };
    ExWeakMap.prototype.set = function (key, value) {
        if (!this._weakMap) {
            this._weakMap = new consumeWeakMap();
        }
        this._weakMap.set(this.getRelKeyAndCreateIfNone(key), value);
        return this;
    };
    return ExWeakMap;
}());

var L4CallingArgumentsCache = /** @class */ (function (_super) {
    __extends(L4CallingArgumentsCache, _super);
    function L4CallingArgumentsCache() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return L4CallingArgumentsCache;
}(ExMap));

var L3ObjectInstanceCache = /** @class */ (function (_super) {
    __extends(L3ObjectInstanceCache, _super);
    function L3ObjectInstanceCache() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    L3ObjectInstanceCache.prototype.getOrCreate = function (key) {
        var l4 = this.get(key);
        if (l4) {
            return l4;
        }
        l4 = new L4CallingArgumentsCache();
        this.set(key, l4);
        return l4;
    };
    return L3ObjectInstanceCache;
}(ExWeakMap));

var L2MethodNameCache = /** @class */ (function (_super) {
    __extends(L2MethodNameCache, _super);
    function L2MethodNameCache() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    L2MethodNameCache.prototype.getOrCreate = function (key) {
        var l3 = this.get(key);
        if (l3) {
            return l3;
        }
        l3 = new L3ObjectInstanceCache();
        this.set(key, l3);
        return l3;
    };
    return L2MethodNameCache;
}(ExMap));

var L1ClassMetaCache = /** @class */ (function (_super) {
    __extends(L1ClassMetaCache, _super);
    function L1ClassMetaCache() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    L1ClassMetaCache.prototype.getOrCreate = function (key) {
        var l2 = this.get(key);
        if (l2) {
            return l2;
        }
        l2 = new L2MethodNameCache();
        this.set(key, l2);
        return l2;
    };
    return L1ClassMetaCache;
}(ExMap));
var l1 = new L1ClassMetaCache();

function getLogger(log) {
    if (log === void 0) { log = null; }
    return function (message) {
        var otherArgs = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            otherArgs[_i - 1] = arguments[_i];
        }
        if (!log) {
            return;
        }
        if (otherArgs.length < 1) {
            return log(message);
        }
        var areLastArgsTypeIsFunction = typeof otherArgs[otherArgs.length - 1] === 'function';
        var cMessage = otherArgs.splice(otherArgs.length - (areLastArgsTypeIsFunction ? 1 : 0))[0];
        var optionalParams = otherArgs;
        message = cMessage ? cMessage(message) : message;
        log.apply(void 0, [message].concat(optionalParams));
    };
}
var exLog = getLogger();

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
 *
 * 缓存规则：
 * 只有当如下条件都相同时，数据才会从缓存读取
 * （类名 + 方法名）  +  当前对象的实例  +  JSON.stringify(参数)
 * （可用 key代替） （可用 this2key代替） （可用 params2key代替）
 *     Map              WeakMap             Map
 */
function aCache(conf) {
    var logger = getLogger();
    // 格式化参数
    var config = formatConfig(conf || {});
    logger('config is: ', config);
    return function (target, methodName, descriptor) {
        logger('aCache : %s : %s : %o', target.constructor.name, methodName, l1);
        // 原有方法
        var oldFunc = descriptor.get || descriptor.value;
        var newFunc = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            // 以类名，方法名作为 key
            var l2 = l1.getOrCreate(config.key || target.constructor.name);
            var l3 = l2.getOrCreate(config.key || methodName);
            // 以实例作为 key
            var this2key = config.this2Key
                && config.this2Key.apply(this, this);
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

function isArray(val) {
    return val instanceof Array;
}
function isString(val) {
    return typeof val === 'string';
}

function formatDisableCacheConfig(config) {
    if (isString(config)) {
        return [{ key: config }];
    }
    if (isArray(config)) {
        if (config.length === 0) {
            throw new Error('参数错误');
        }
        if (isString(config[0])) {
            return config.map(function (it) { return ({ key: it }); });
        }
        return config;
    }
    return [config];
}
function disableCache(conf) {
    var logger = getLogger();
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
            logger('disableACache : %s : %s : %o', target.constructor.name, methodName, l1);
            var instanceMapParamsMapResults = configs.map(function (config) {
                var l2 = l1.get(config.key || target.constructor.name);
                var l3 = l2 && l2.get(config.key || methodName);
                return [config, l3];
            });
            instanceMapParamsMapResults.forEach(function (_a) {
                var config = _a[0], instanceMapParamsMapResult = _a[1];
                if (!conf) {
                    l1.delete(target.constructor.name);
                    return;
                }
                // 没有该缓存或者出错
                if (!instanceMapParamsMapResult) {
                    return;
                }
                // 以实例作为 key
                var this2key = config.this2Key
                    && config.this2Key.apply(_this, _this);
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

export { aCache, disableCache };
