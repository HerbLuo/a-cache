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
var L3ObjectInstanceCache_1 = require("./L3ObjectInstanceCache");
var L2MethodNameCache = /** @class */ (function (_super) {
    __extends(L2MethodNameCache, _super);
    function L2MethodNameCache() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    L2MethodNameCache.prototype.getOrCreate = function (key) {
        var l3 = this.get(key);
        if (l3) {
            return l3;
        }
        l3 = new L3ObjectInstanceCache_1.L3ObjectInstanceCache();
        this.set(key, l3);
        return l3;
    };
    return L2MethodNameCache;
}(ExMap_1.ExMap));
exports.L2MethodNameCache = L2MethodNameCache;
//# sourceMappingURL=L2MethodNameCache.js.map