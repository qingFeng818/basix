export const hasOwnProperty = Object.prototype.hasOwnProperty
export const hasProperty = (target, key) => hasOwnProperty.call(target, key)