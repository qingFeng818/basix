import { provide, inject, ref, computed, readonly } from 'vue'
import { get, set, cloneDeep, isNil } from 'lodash-es'

/**
 * provide/inject key
 */
const SHARED_CONTEXT_KEY = Symbol('shareContextKey')

/**
 * 获取共享上下文数据的只读状态
 * @param {*} val 
 * @returns 
 */
const getReadOnlyData = (val) => {
  // readonly 仅支持对象类型数据，如果不是则直接返回val参数值
  if (val !== null && typeof val === 'object') {
    return readonly(val)
  }
  return val
}

/**
 * 处理默认值
 * @param {*} val 
 * @returns 
 */
const handleDefaultState = (val) => {
  // 如果val形参没有传递，或者传null，则统一返回null
  if (val === undefined || val === null) return null
  if (typeof val === 'object') return cloneDeep(val)
  return val
}

/**
 * 获取上下文数据
 * @param {*} val 
 * @param {*} path 
 * @returns 
 */
const getContext = (val, path) => {
  if (!path) return val
  return get(val, path)
}

/**
 * 父组件提供上下文hooks函数
 * @returns 
 */
export const useProvideContext = () => {
  const context = ref({})

  /**
   * 初始化上下文数据函数
   * @param {*} data 
   * @returns {Function} initContext 用于初始化上下文数据
   */
  const initContext = (data) => {
    if (isNil(data)) return
    context.value = data
  }

  /**
   * 更新上下文数据函数
   * @param {*} val 
   * @param {*} path 
   */
  const updateContext = (val, path) => {
    if (isNil(path)) {
      context.value = val
      return
    }
    set(context.value, path, val)
  }

  /**
     * 获取最新上下文数据函数
     * @returns 
     */
  const getContextState = () => {
    return context.value
  }

  provide(SHARED_CONTEXT_KEY, { context, updateContext })

  return { initContext, updateContext, getContextState }
}

/**
 * 子组件使用上下文hooks函数，获取对应路径下的值
 * @param {*} path 
 * @param {*} defaultState 
 * @returns 
 */
export const useContext = (path, defaultState) => {
  const { context, updateContext } = inject(SHARED_CONTEXT_KEY)
  
  /**
   * 获取当前路径的值, 并且如果当前路径的值不存在，则返回默认值
   */
  const state = computed(() => {
    const contextState = getContext(context.value, path)
    return !isNil(contextState) ? getReadOnlyData(contextState) : getReadOnlyData(handleDefaultState(defaultState))
  })

  /**
   * 子组件调用更新 state 数据函数
   * @param {*} val 
   */
  const setState = (val) => {
    updateContext(val, path)
  }
  
  /**
   * 创建编辑状态数据函数，用于表单编辑时使用
   * @returns 
   */
  const createEditState = () => {
    return cloneDeep(state.value)
  }

  return [state, setState, createEditState]
}