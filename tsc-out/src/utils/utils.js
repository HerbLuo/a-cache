"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isObject(val) {
    return val.toString() === '[object Object]';
}
exports.isObject = isObject;
function isArray(val) {
    return val instanceof Array;
}
exports.isArray = isArray;
function isString(val) {
    return typeof val === 'string';
}
exports.isString = isString;
function isFunction(val) {
    return val instanceof Function;
}
exports.isFunction = isFunction;
//# sourceMappingURL=utils.js.map