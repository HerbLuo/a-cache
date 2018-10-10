import { ExMap } from "./ExMap";
import { L3ObjectInstanceCache } from "./L3ObjectInstanceCache";
import { GetOrCreate } from "./MapLike";
export declare class L2MethodNameCache extends ExMap<string, L3ObjectInstanceCache> implements GetOrCreate<string, L3ObjectInstanceCache> {
    getOrCreate(key: string): L3ObjectInstanceCache;
}
