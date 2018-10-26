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
var L4CallingArgumentsCache_1 = require("./L4CallingArgumentsCache");
var L3ObjectInstanceCache = /** @class */ (function (_super) {
    __extends(L3ObjectInstanceCache, _super);
    function L3ObjectInstanceCache() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    L3ObjectInstanceCache.prototype.getOrCreate = function (key) {
        var l4 = this.get(key);
        if (l4) {
            return l4;
        }
        l4 = new L4CallingArgumentsCache_1.L4CallingArgumentsCache();
        this.set(key, l4);
        return l4;
    };
    return L3ObjectInstanceCache;
}(ExMap_1.ExWeakMap));
exports.L3ObjectInstanceCache = L3ObjectInstanceCache;
//# sourceMappingURL=L3ObjectInstanceCache.js.map