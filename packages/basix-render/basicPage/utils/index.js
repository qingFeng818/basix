import { getType } from '@/utils/pageUtils'
export * from '@/utils/pageUtils'
export function getClass(extraClass, className) {
  const classMap = {
    'string':(extra, defaultClass) => `${extra} ${defaultClass}`,
    'array':(extra, defaultClass) => [...defaultClass, ...extra],
    'object':(extra, defaultClass) => ({ [defaultClass]: true, ...extra})
  }
  const fn = classMap[getType(extraClass)] 
  return fn ? fn(extraClass, className) : className
}

export function getStyle(style = {}, defaultStyle = {}) {
  return {...defaultStyle, ...style }
}
