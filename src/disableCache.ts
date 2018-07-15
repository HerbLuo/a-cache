import {isArray, isString} from "./utils/utils";
import {l1} from "./dao/L1ClassMetaCache";
import {L3ObjectInstanceCache} from "./dao/L3ObjectInstanceCache";
import {logger} from "./utils/helper";

interface DisableCacheConfig {
    key?: string;
    this2Key?: (that: any) => any;
    params2key?: Function | string;
}

type DisableCacheArgType = string | string[] | DisableCacheConfig | DisableCacheConfig[]

function formatDisableCacheConfig (config: DisableCacheArgType)
    : DisableCacheConfig[] {
    if (isString(config)) {
        return [{key: config}]
    }

    if (isArray(config)) {
        if (config.length === 0) {
            throw new Error('参数错误')
        }
        if (isString(config[0])) {
            return (<string[]>config).map(it => ({key: it}))
        }
        return <DisableCacheConfig []>config
    }

    return [config]
}

export function disableCache(conf?: DisableCacheArgType) {
    let configs: DisableCacheConfig[] = formatDisableCacheConfig(conf || {});

    return (target: any, methodName: string, descriptor: PropertyDescriptor) => {
        // 原有方法
        const oldFunc = descriptor.get || descriptor.value;

        if (!conf) {
            logger('deleting all cache in', target.constructor.name);
            l1.delete(target.constructor.name);
            return
        }

        type ConfigAndDataTuple = [DisableCacheConfig, L3ObjectInstanceCache|void]

        const instanceMapParamsMapResults: Array<ConfigAndDataTuple> =
            configs.map(config => {
                const l2 = l1.get(target.constructor.name);
                const l3 = l2 && l2.get(methodName);
                return <ConfigAndDataTuple>[ config, l3 ];
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
