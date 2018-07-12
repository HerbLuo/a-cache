import {ExMap} from "./ExMap";
import {L2MethodNameCache} from "./L2MethodNameCache";

class L1ClassMetaCache extends ExMap<string, L2MethodNameCache> {
    getOrCreate (key: string): L2MethodNameCache {

    }
}

export const l1 = new L1ClassMetaCache();
export const topLevelCache = l1;
