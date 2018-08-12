import {WeakMapLike, WeakMapLikeConstructor} from "./MapLike";

export interface CouldClearWeakMap<K extends object, V> extends WeakMapLike<K, V>{
    clear(): void;
}
export interface CouldClearWeakMapConstructor {
    new (): CouldClearWeakMap<object, any>;
    new <K extends object, V>(entries?: ReadonlyArray<[K, V]>): CouldClearWeakMap<K, V>;
}

export function createCouldClearWeakMap(cWeakMap: WeakMapLikeConstructor)
    : CouldClearWeakMapConstructor {
    return class <K extends object, V>extends cWeakMap {
        areClear: boolean = false;

        get (key: K): V | undefined {
            if (this.areClear) {
                return undefined
            }
            return super.get(key)
        }

        set (key: K, value: V) {
            this.areClear = false

        }

        clear() {
            this.areClear = true
        }
    }
}
