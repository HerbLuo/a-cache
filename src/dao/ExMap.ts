import {
    MapLike,
    MapLikeConstructor,
    WeakMapLike,
    WeakMapLikeConstructor
} from "./MapLike";

let consumeMap: MapLikeConstructor = Map;
let consumeWeakMap: WeakMapLikeConstructor = WeakMap;
let couldConsume = true;

export abstract class ExMap<K, V> implements MapLike<K, V> {
    private _map?: MapLike<K, V>;
    abstract getOrCreate(key: K): V;

    set(key: K, value: V): this {
        if (!this._map) {
            this._map = new consumeMap([[key, value]]);
            couldConsume = false
        } else {
            this._map.set(key, value);
        }
        return this;
    }
    get(key: K): V | undefined {
        return this._map && this._map.get(key);
    }
    delete(key: K): boolean {
        return Boolean(this._map && this._map.delete(key));
    }
    forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void,
            thisArg?: any): void {
        this._map && this._map.forEach(callbackfn, thisArg)
    }
    has(key: K): boolean {
        return Boolean(this._map && this._map.has(key));
    }
    clear(): void {
        this._map && this._map.clear();
    }
    get size(): number {
        return this._map ? this._map.size : 0;
    }
}

type ExWeakMapKeyTypeExcludeObject = string | number | void | symbol;
type ExWeakMapKeyType = object | ExWeakMapKeyTypeExcludeObject;
export abstract class ExWeakMap<V> implements WeakMapLike<{}, V> {
    abstract getOrCreate(key: ExWeakMapKeyType): V;

    private _weakMap?: WeakMapLike<{}, V>;
    private _keyReference: Map<ExWeakMapKeyType, {}> = new Map();

    private getRelKey (exKey: ExWeakMapKeyType): {} | void {
        if (typeof exKey === 'object') {
            return exKey;
        }
        return this._keyReference.get(exKey);
    }

    private getRelKeyAndCreateIfNone (exKey: ExWeakMapKeyType): {} {
        let nKey = this.getRelKey(exKey);
        if (!nKey) {
            nKey = {};
            this._keyReference.set(exKey, nKey);
        }
        return nKey;
    }

    delete(key: ExWeakMapKeyType): boolean {
        if (!this._weakMap) {
            return false
        }
        const relKey = this.getRelKey(key);
        if (!relKey) {
            return false
        }
        return this._weakMap.delete(relKey);
    }

    has(key: ExWeakMapKeyType): boolean {
        if (!this._weakMap) {
            return false
        }
        const relKey = this.getRelKey(key);
        if (!relKey) {
            return false
        }
        return this._weakMap.has(relKey);
    }

    get(key: ExWeakMapKeyType): V | undefined {
        if (!this._weakMap) {
            return undefined
        }
        const relKey = this.getRelKey(key);
        if (!relKey) {
            return undefined
        }
        return this._weakMap.get(relKey);
    }
    set(key: ExWeakMapKeyType, value: V): this {
        if (!this._weakMap) {
            this._weakMap = new consumeWeakMap();
            couldConsume = false;
        }
        this._weakMap.set(this.getRelKeyAndCreateIfNone(key), value);
        return this
    }
}

export function consumeMapStructure
(map: MapLikeConstructor, weakMap: WeakMapLikeConstructor): void {
    if (!couldConsume) {
        throw new Error('this function can not be called after any data is cached.')
    }
    consumeMap = map;
    consumeWeakMap = weakMap;
}
