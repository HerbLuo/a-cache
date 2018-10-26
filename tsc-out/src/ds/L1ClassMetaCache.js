"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var ExMap_1 = require("./ExMap");
var L2MethodNameCache_1 = require("./L2MethodNameCache");
var L1ClassMetaCache = /** @class */ (function (_super) {
    __extends(L1ClassMetaCache, _super);
    function L1ClassMetaCache() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    L1ClassMetaCache.prototype.getOrCreate = function (key) {
        var l2 = this.get(key);
        if (l2) {
            return l2;
        }
        l2 = new L2MethodNameCache_1.L2MethodNameCache();
        this.set(key, l2);
        return l2;
    };
    return L1ClassMetaCache;
}(ExMap_1.ExMap));
exports.l1 = new L1ClassMetaCache();
exports.topLevelCache = exports.l1;
//# sourceMappingURL=L1ClassMetaCache.js.map