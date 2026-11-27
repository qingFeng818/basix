import { shallowRef } from 'vue'

export const useFlag = (val = false) => {
  /**
     * 用于管理布尔值的flag
     */
  const flag = shallowRef(val)

  /**
     *  设置flag的值
     * @param {*} value 
     */
  const setFlag = (value) => {
    flag.value = value
  }

  return [flag, setFlag]
}