import {isArray, isString} from "./utils/utils";
import {l1} from "./ds/L1ClassMetaCache";
import {L3ObjectInstanceCache} from "./ds/L3ObjectInstanceCache";
import {getLogger} from "./utils/logger";

interface DisableCacheConfig {
    key?: string;
    this2Key?: (that: any) => any;
    params2key?: Function | string;
}

type DisableCacheArgType =
    string
    | string[]
    | DisableCacheConfig
    | DisableCacheConfig[]

function formatDisableCacheConfig(config: DisableCacheArgType)
    : DisableCacheConfig[] {
    if (isString(config)) {
        return [{key: config}]
    }

    if (isArray(config)) {
        const configs: Array<string | DisableCacheConfig> = config;
        if (config.length === 0) {
            throw new Error('参数错误')
        }
        return configs.map((c) => {
            if (isString(c)) {
                return {key: c}
            }
            return c
        })
    }

    return [config]
}

export function disableCache(conf?: DisableCacheArgType) {
    const logger = getLogger();
    let configs: DisableCacheConfig[] = formatDisableCacheConfig(conf || {});

    logger('disable a cache\'s config is: ', configs);

    return (target: any, methodName: string, descriptor: PropertyDescriptor) => {
        // 原有方法
        const oldFunc = descriptor.get || descriptor.value;

        type ConfigAndDataTuple = [DisableCacheConfig, L3ObjectInstanceCache | void]

        descriptor.value = function (...args: any[]) {
            logger('disableACache : %s : %s : %o', target.constructor.name, methodName, l1);

            const instanceMapParamsMapResults: Array<ConfigAndDataTuple> =
                configs.map(config => {
                    const l2 = l1.get(config.key || target.constructor.name);
                    const l3 = l2 && l2.get(config.key || methodName);
                    return <ConfigAndDataTuple>[config, l3];
                });

            instanceMapParamsMapResults.forEach(
                ([
                     config, instanceMapParamsMapResult]: ConfigAndDataTuple) => {

                    if (!conf) {
                        l1.delete(target.constructor.name);
                        return
                    }

                    // 没有该缓存或者出错
                    if (!instanceMapParamsMapResult) {
                        return
                    }

                    // 以实例作为 key
                    const this2key = config.this2Key
                        && config.this2Key.call(this, this);

                    // 没有配置参数
                    if (!config.params2key) {
                        if (this2key) {
                            instanceMapParamsMapResult.delete(this2key);
                        } else {
                            instanceMapParamsMapResult.clear()
                        }

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
