import {ExMap} from "./ExMap";
import {L3ObjectInstanceCache} from "./L3ObjectInstanceCache";
import {GetOrCreate} from "./MapLike";

export class L2MethodNameCache extends ExMap<string, L3ObjectInstanceCache>
    implements GetOrCreate<string, L3ObjectInstanceCache> {
    getOrCreate(key: string): L3ObjectInstanceCache {
        let l3 = this.get(key);
        if (l3) {
            return l3
        }
        l3 = new L3ObjectInstanceCache();
        this.set(key, l3);
        return l3
    }
}