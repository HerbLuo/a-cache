interface DisableCacheConfig {
    key?: string;
    this2Key?: (that: any) => any;
    params2key?: Function | string;
}
declare type DisableCacheArgType = string | string[] | DisableCacheConfig | DisableCacheConfig[];
export declare function disableCache(conf?: DisableCacheArgType): (target: any, methodName: string, descriptor: PropertyDescriptor) => void;
export {};
