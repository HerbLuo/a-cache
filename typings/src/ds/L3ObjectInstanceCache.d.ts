import { ExWeakMap, ExWeakMapKeyType } from "./ExMap";
import { L4CallingArgumentsCache } from "./L4CallingArgumentsCache";
import { GetOrCreate } from "./MapLike";
export declare class L3ObjectInstanceCache extends ExWeakMap<L4CallingArgumentsCache> implements GetOrCreate<ExWeakMapKeyType, L4CallingArgumentsCache> {
    getOrCreate(key: ExWeakMapKeyType): L4CallingArgumentsCache;
}
