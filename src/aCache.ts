import {l1} from "./ds/L1ClassMetaCache";
import {getLogger} from "./utils/logger";

interface ACacheConfig {
    // second?: number; // 默认无穷大
    key?: string;       // 默认从类名方法名提取，注意压缩后的代码可能出现意外情况
    // logger?: Function   // 输出日志的方法
    this2Key?: (that: any) => any; // 禁止返回object类型
    params2key?: Function | string;
}

function formatConfig(config: string | ACacheConfig): ACacheConfig {
    if (typeof config === 'string') {
        return {
            key: config
        }
    }
    return config
}
/**
 * 对一个对象的方法进行缓存
 *
 * 几点提示：
 * 当一个类中只有一个方法需要缓存时，不写 任何key参数是推荐的做法
 * 当一个类中有多个方法需要缓存时，不写 任何key参数或许同样可用（即便存在代码压缩，一般也都可用），但推荐写上全局唯一的key
 * 当一个需要缓存的方法的参数非常 “巨大”时，推荐使用 params2key 优化
 */
export function aCache (conf?: ACacheConfig | string) {
    const logger = getLogger();
    // 格式化参数
    const  config: ACacheConfig = formatConfig(conf || {});
    logger('config is: ', config);

    return (target: any, methodName: string, descriptor: PropertyDescriptor) => {
        logger('aCache : %s : %s : %o', target.constructor.name, methodName, l1);
        // 原有方法
        const oldFunc = descriptor.get || descriptor.value;
        const newFunc = function (...args: any[]) {
            // 以类名，方法名作为 key
            const l2 = l1.getOrCreate(config.key || target.constructor.name);
            const l3 = l2.getOrCreate(config.key || methodName);

            // 以实例作为 key
            const this2key = config.this2Key
                && config.this2Key.call(this, this);
            const paramsMapResult = l3.getOrCreate(this2key || this);

            // 以参数作为key
            const params2key = typeof config.params2key === 'function'
                ? config.params2key && config.params2key.apply(this, args)
                : config.params2key;
            const paramsKey = params2key || JSON.stringify(args);

            // 获取最终缓存的值
            const cachedVal = paramsMapResult.get(paramsKey);

            if (cachedVal) {
                return cachedVal
            }

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
