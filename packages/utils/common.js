import { isFunction, isObject, isArray, isMap, isDate } from "./type"
import { hasProperty } from "./find"

const baseClone = () => { }

/**
 * 深拷贝
 * @param {*} target 
 * @returns 
 */

export const cloneDeep = (target) => {
  if (isObject(target)) {
    let newObj = {}
    for (let key in target) {
      if (hasProperty(target, key)) {
        newObj[key] = cloneDeep(target[key])
      }
    }
    return newObj
  } else if (isArray(target)) {
    let newTarget = []
    for (let i = 0; i < target.length; i++) {
      newTarget.push(cloneDeep(target[i]))
    }
    return newTarget
  } else if (isMap(target)) {
    let newTarget = new Map()
    for (let [key, value] of target) {
      newTarget.set(cloneDeep(key), cloneDeep(value))
    }
    return newTarget
  } else if (isSet(target)) {
    let newTarget = new Set()
    for (let item of target) {
      newTarget.add(cloneDeep(item))
    }
    return newTarget
  } else if (isArrayBuffer(target)) {
    const newArrayBuffer = target.slice(0)
    return newArrayBuffer
  } else if (isDate(target)) {
    return new Date(target.getTime())
  } else if (isRegExp(target)) {
    const newTarget = new RegExp(target.source, target.flags)
    newTarget.lastIndex = target.lastIndex
    return newTarget
  }
  return target
}