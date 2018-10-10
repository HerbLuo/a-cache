import { MapLike, MapLikeConstructor, WeakMapLike, WeakMapLikeConstructor } from "./MapLike";
export declare abstract class ExMap<K, V> implements MapLike<K, V> {
    private _map?;
    set(key: K, value: V): this;
    get(key: K): V | undefined;
    delete(key: K): boolean;
    forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void;
    has(key: K): boolean;
    clear(): void;
    readonly size: number;
}
declare type ExWeakMapKeyTypeExcludeObject = string | number | void | symbol;
export declare type ExWeakMapKeyType = object | ExWeakMapKeyTypeExcludeObject;
export declare abstract class ExWeakMap<V> implements WeakMapLike<{}, V> {
    private weakMap?;
    private keyReference;
    private cleared;
    private CouldClearWeakMap;
    private getRelKey;
    private getRelKeyAndCreateIfNone;
    delete(key: ExWeakMapKeyType): boolean;
    has(key: ExWeakMapKeyType): boolean;
    get(key: ExWeakMapKeyType): V | undefined;
    set(key: ExWeakMapKeyType, value: V): this;
    clear(): void;
}
export declare function consumeMapStructure(map: MapLikeConstructor, weakMap: WeakMapLikeConstructor): void;
export {};
