export interface MapLike<K, V> {
    clear(): void;
    delete(key: K): boolean;
    forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void;
    get(key: K): V | undefined;
    has(key: K): boolean;
    set(key: K, value: V): this;
    readonly size: number;
}
export interface MapLikeConstructor {
    new (): MapLike<any, any>;
    new <K, V>(entities?: ReadonlyArray<[K, V]>): MapLike<K, V>;
}
export interface WeakMapLike<K extends object, V> {
    delete(key: K): boolean;
    get(key: K): V | undefined;
    has(key: K): boolean;
    set(key: K, value: V): this;
}
export interface WeakMapLikeConstructor {
    new (): WeakMapLike<object, any>;
    new <K extends object, V>(entries?: ReadonlyArray<[K, V]>): WeakMapLike<K, V>;
}
export interface GetOrCreate<K, V> {
    getOrCreate(key: K): V;
}
