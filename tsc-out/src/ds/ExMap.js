"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var consumeMap = Map;
var consumeWeakMap = WeakMap;
var couldConsume = true;
var ExMap = /** @class */ (function () {
    function ExMap() {
    }
    ExMap.prototype.set = function (key, value) {
        if (!this._map) {
            this._map = new consumeMap([[key, value]]);
            couldConsume = false;
        }
        else {
            this._map.set(key, value);
        }
        return this;
    };
    ExMap.prototype.get = function (key) {
        return this._map && this._map.get(key);
    };
    ExMap.prototype.delete = function (key) {
        return Boolean(this._map && this._map.delete(key));
    };
    ExMap.prototype.forEach = function (callbackfn, thisArg) {
        this._map && this._map.forEach(callbackfn, thisArg);
    };
    ExMap.prototype.has = function (key) {
        return Boolean(this._map && this._map.has(key));
    };
    ExMap.prototype.clear = function () {
        this._map && this._map.clear();
    };
    Object.defineProperty(ExMap.prototype, "size", {
        get: function () {
            return this._map ? this._map.size : 0;
        },
        enumerable: true,
        configurable: true
    });
    return ExMap;
}());
exports.ExMap = ExMap;
var ExWeakMap = /** @class */ (function () {
    function ExWeakMap() {
        this.keyReference = new Map();
        this.cleared = false;
        this.CouldClearWeakMap = /** @class */ (function () {
            function class_1() {
            }
            return class_1;
        }());
    }
    ExWeakMap.prototype.getRelKey = function (exKey) {
        if (typeof exKey === 'object') {
            return exKey;
        }
        return this.keyReference.get(exKey);
    };
    ExWeakMap.prototype.getRelKeyAndCreateIfNone = function (exKey) {
        var nKey = this.getRelKey(exKey);
        if (!nKey) {
            nKey = {};
            this.keyReference.set(exKey, nKey);
        }
        return nKey;
    };
    ExWeakMap.prototype.delete = function (key) {
        if (!this.weakMap) {
            return false;
        }
        var relKey = this.getRelKey(key);
        if (!relKey) {
            return false;
        }
        return this.weakMap.delete(relKey);
    };
    ExWeakMap.prototype.has = function (key) {
        if (!this.weakMap) {
            return false;
        }
        var relKey = this.getRelKey(key);
        if (!relKey) {
            return false;
        }
        return this.weakMap.has(relKey);
    };
    ExWeakMap.prototype.get = function (key) {
        if (!this.weakMap) {
            return undefined;
        }
        var relKey = this.getRelKey(key);
        if (!relKey) {
            return undefined;
        }
        return this.weakMap.get(relKey);
    };
    ExWeakMap.prototype.set = function (key, value) {
        if (!this.weakMap) {
            this.weakMap = new consumeWeakMap();
            couldConsume = false;
        }
        this.weakMap.set(this.getRelKeyAndCreateIfNone(key), value);
        return this;
    };
    ExWeakMap.prototype.clear = function () {
        this.weakMap = undefined;
        this.keyReference.clear();
    };
    return ExWeakMap;
}());
exports.ExWeakMap = ExWeakMap;
function consumeMapStructure(map, weakMap) {
    if (!couldConsume) {
        throw new Error('this function can not be called after any data is cached.');
    }
    consumeMap = map;
    consumeWeakMap = weakMap;
}
exports.consumeMapStructure = consumeMapStructure;
//# sourceMappingURL=ExMap.js.map