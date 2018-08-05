import {ExMap} from "./ExMap";
import {L2MethodNameCache} from "./L2MethodNameCache";
import {GetOrCreate} from "./MapLike";

class L1ClassMetaCache extends ExMap<string, L2MethodNameCache>
    implements GetOrCreate<string, L2MethodNameCache>{
    getOrCreate (key: string): L2MethodNameCache {
        let l2 = this.get(key);
        if (l2) {
            return l2
        }
        l2 = new L2MethodNameCache();
        this.set(key, l2);
        return l2
    }
}

export const l1 = new L1ClassMetaCache();
export const topLevelCache = l1;
