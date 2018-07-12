import {l1} from "./dao/L1ClassMetaCache";

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

export function aCache (conf?: ACacheConfig | string) {
    // 格式化参数
    const  config: ACacheConfig = formatConfig(conf || {});

    return (target: any, methodName: string, descriptor: PropertyDescriptor) => {
        // 原有方法
        const oldFunc = descriptor.get || descriptor.value;

        // 以类名，方法名作为 key
        const key = config.key || `${target.constructor.name}:${methodName}`;
        const l2 = l1.getOrCreate(target.constructor.name);
        const l3 = l2.getOrCreate(methodName);

        const newFunc = function (...args: any[]) {
            // 以实例作为 key
            const this2key = config.this2Key
                && config.this2Key.apply(this, this);
            // 获取第三层 第三层的key为 JSON.stringify(参数)
            const paramsMapResult = l3.getOrCreate(this2key || this);

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
