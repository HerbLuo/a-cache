export function isObject(val: any): val is object {
    return val.toString() === '[object Object]'
}

export function isArray(val: any): val is Array<any> {
    return val instanceof Array
}

export function isString(val: any): val is String {
    return typeof val === 'string'
}

export function isFunction(val: any): val is Function {
    return val instanceof Function
}