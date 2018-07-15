import {ExWeakMap, ExWeakMapKeyType} from "./ExMap";
import {L4CallingArgumentsCache} from "./L4CallingArgumentsCache";
import {GetOrCreate} from "./MapLike";

export class L3ObjectInstanceCache extends ExWeakMap<L4CallingArgumentsCache>
    implements GetOrCreate<ExWeakMapKeyType, L4CallingArgumentsCache> {
    getOrCreate(key: ExWeakMapKeyType): L4CallingArgumentsCache {
        let l4 = this.get(key);
        if (l4) {
            return l4
        }
        l4 = new L4CallingArgumentsCache();
        this.set(key, l4);
        return l4;
    }
}

