/**
 * aCache 的缓存结构有三层
 * @version 0.0.1
 * disableCache 有 BUG
 */
import {isArray, isString} from "./utils/utils";

interface ACacheConfig {
    // second?: number; // 默认无穷大
    key?: string;       // 默认从类名方法名提取，注意压缩后的代码可能出现意外情况
    // logger?: Function   // 输出日志的方法
    this2Key?: (that: any) => any; // 禁止返回object类型
    params2key?: Function | string;
}

interface DisableCacheConfig {
    key?: string;
    this2Key?: (that: any) => any;
    params2key?: Function | string;
}

type DisableCacheArgType = string | string[] | DisableCacheConfig | DisableCacheConfig[]

// region 缓存数据结构
type ParamsMapData = Map<any, any>;

function formatConfig<T extends ACacheConfig | DisableCacheConfig>(
    config: string | T): T {
    if (typeof config === 'string') {
        return <T>{
            key: config
        }
    }
    return config
}

class ClassMetaMapData {
    private _cache: Map<string, InstanceMapData> = new Map();
    get (key: string): InstanceMapData | undefined {
        return this._cache.get(key)
    }
    set (key: string, value: InstanceMapData): void {
        this._cache.set(key, value)
    }
    delete (key: string): void {
        this._cache.delete(key)
    }
    getAndPutIfClassMetaNotExist (key: string): InstanceMapData {
        let t: InstanceMapData | undefined = this.get(key);
        if (t) {
            return t
        }
        t = new InstanceMapData();
        this.set(key, t);
        return t;
    }
}

class InstanceMapData {
    private _cache: WeakMap<object, ParamsMapData> = new WeakMap();
    private keyReference: Map<any, object> = new Map();

    get (key: object | string | number): ParamsMapData | undefined {
        let nKey: object | undefined = typeof key === 'object'
            ? key
            : this.keyReference.get(key);
        if (!nKey) {
            return
        }
        return this._cache.get(nKey)
    }
    set (key: object, value: ParamsMapData) {
        this._cache.set(key, value)
    }
    delete (key: object) {
        this._cache.delete(key)
    }

    // 获取某个缓存，如果不存在，创建一个并返回
    // 该缓存扩展了 weakMap，使得 key可以为非 object对象
    getAndPutIfInstanceNotExist (key: object | string | number): ParamsMapData {
        let nKey: object | undefined = typeof key === 'object'
            ? key
            : this.keyReference.get(key);
        if (!nKey) {
            nKey = {};
            this.keyReference.set(key, nKey)
        }
        let t: ParamsMapData | undefined = this.get(nKey);
        if (t) {
            return t
        }
        t = new Map();
        if (typeof key === 'object') {
            this.set(key, t);
        } else {

        }
        return t;
    }
}

const anythingCache = new ClassMetaMapData();
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
export function aCache (conf?: ACacheConfig | string) {
    // 格式化参数
    const  config: ACacheConfig = formatConfig(conf || {});

    return (target: any, methodName: string, descriptor: PropertyDescriptor) => {
        // 原有方法
        const oldFunc = descriptor.get || descriptor.value;

        // 以类名，方法名作为 key
        const key = config.key || `${target.constructor.name}:${methodName}`;
        // 获取第二层，第二层的key为实例
        const instanceMapParamsMapResult: InstanceMapData = anythingCache
            .getAndPutIfClassMetaNotExist(key);

        const newFunc = function (...args: any[]) {
            // 以实例作为 key
            const this2key = config.this2Key
                && config.this2Key.apply(this, this);
            // 获取第三层 第三层的key为 JSON.stringify(参数)
            const paramsMapResult = instanceMapParamsMapResult
                .getAndPutIfInstanceNotExist(this2key || this);

            // 以参数作为key
            const params2key = typeof config.params2key === 'function'
                ? config.params2key && config.params2key.apply(this, args)
                : config.params2key;
            const paramsKey = params2key || JSON.stringify(args);

            // 获取最终缓存的值
            const cachedVal = paramsMapResult
                .get(paramsKey);

            // 找到了缓存的结果
            if (cachedVal) {
                return cachedVal
            }

            // 未找到，运行原有方法
            const result = oldFunc.apply(this, args);
            paramsMapResult.set(paramsKey, result);
            return result
        };

        // 替换原有方法
        if (descriptor.get) {
            descriptor.get = newFunc
        } else {
            descriptor.value = newFunc
        }
    }
}

function formatDisableCacheConfig (config: DisableCacheArgType)
    : DisableCacheConfig[] {
    if (isString(config)) {
        return [{key: config}]
    }

    if (isArray(config)) {
        if (config.length === 0) {
            throw new Error('参数错误')
        }
        function isArrayString(val: any[]): val is string[]  {
            return isString(val[0])
        }
        if (isArrayString(config)) {
            return (<string[]>config).map(it => ({key: it}))
        }
        return config
    }

    return [config]
}

export function disableCache(conf?: DisableCacheArgType) {
    let configs: DisableCacheConfig[] = formatDisableCacheConfig(conf || {});

    return (target: any, methodName: string, descriptor: PropertyDescriptor) => {
        // 原有方法
        const oldFunc = descriptor.get || descriptor.value;

        type ConfigAndDataTuple = [DisableCacheConfig, InstanceMapData|void]

        const instanceMapParamsMapResults: Array<ConfigAndDataTuple> =
            configs.map(config => {
                // 以类名，方法名作为 key
                const key = config.key ||
                    `${target.constructor.name}:${methodName}`;
                // 获取第二层，第二层的key为实例
                return <ConfigAndDataTuple>[ config, anythingCache.get(key) ];
            });

        descriptor.value = function (...args: any[]) {
            instanceMapParamsMapResults.forEach(([
                                                     config, instanceMapParamsMapResult]: ConfigAndDataTuple) => {
                // 没有该缓存或者出错
                if (!instanceMapParamsMapResult) {
                    return
                }

                // 以实例作为 key
                const this2key = config.this2Key
                    && config.this2Key.apply(this, this);

                // 没有配置参数
                if (!config.params2key) {
                    instanceMapParamsMapResult.delete(this2key || this)
                    return
                }

                // 获取第三层 第三层的key为 JSON.stringify(参数)
                const paramsMapResult = instanceMapParamsMapResult
                    .get(this2key || this);

                // 未找到该组数据，返回
                if (!paramsMapResult) {
                    return
                }

                // 以参数作为key
                const params2key = typeof config.params2key === 'function'
                    ? config.params2key && config.params2key.apply(this, args)
                    : config.params2key;

                // 删除缓存的值
                paramsMapResult.delete(params2key);
            });

            return oldFunc.apply(this, args);
        };
    }
}


