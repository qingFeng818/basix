export const toString = Object.prototype.toString
export const getType = (target) => toString.call(target).slice(8, -1).toLowerCase()
export const isString = (target) => getType(target) === 'string'
export const isNumber = (target) => getType(target) === 'number'
export const isBoolean = (target) => getType(target) === 'boolean'
export const isObject = (target) => getType(target) === 'object'
export const isArray = (target) => getType(target) === 'array'
export const isFunction = (target) => getType(target) === 'function'
export const isNull = (target) => getType(target) === 'null'
export const isUndefined = (target) => getType(target) === 'undefined'
export const isSymbol = (target) => getType(target) === 'symbol'
export const isDate = (target) => getType(target) === 'date'
export const isRegExp = (target) => getType(target) === 'regexp'
export const isMap = target => getType(target) === 'map'
export const isSet = target => getType(target) === 'set'
export const isWeakMap = target => getType(target) === 'weakmap'
export const isWeakSet = target => getType(target) === 'weakset'
export const isArrayBuffer = target => getType(target) === 'arraybuffer'



export const isEmptyObject = (target) => isObject(target) && JSON.stringify(target) === '{}'
export const isEmptyArray = (target) => isArray(target) && target.length === 0
export const isEmptyString = (target) => isString(target) && target === ''
export const isEmpty = (target) => isNull(target) || isUndefined(target) || isEmptyString(target) || isEmptyObject(target) || isEmptyArray(target)
