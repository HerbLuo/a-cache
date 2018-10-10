import { ExMap } from "./ExMap";
import { L2MethodNameCache } from "./L2MethodNameCache";
import { GetOrCreate } from "./MapLike";
declare class L1ClassMetaCache extends ExMap<string, L2MethodNameCache> implements GetOrCreate<string, L2MethodNameCache> {
    getOrCreate(key: string): L2MethodNameCache;
}
export declare const l1: L1ClassMetaCache;
export declare const topLevelCache: L1ClassMetaCache;
export {};
