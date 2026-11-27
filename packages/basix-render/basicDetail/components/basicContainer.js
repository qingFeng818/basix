
import { h } from 'vue'
import { getClass, getStyle } from '@/components/basicPage/utils'
import { isEmpty } from 'lodash-es'

export default {
  name: 'BasicContainer',
  props:{
    containerDescription:Object
  },
  setup(props, { slots }) {
    const containerDescription = props.containerDescription || {} 
   
    const renderComponentChildren = (item) => {
      const children = buildChildren(item)
      if (children) return children
      if (item.text) return item.text
      if (item.renderChildren) return item.renderChildren(h, item)
      return null
    }

    const buildItem = (item) => {
      if (item.render) return item.render(h, item)
      if (item.slot) return slots?.[item.slot]?.(item)
      if (item.component) return h(item.component, item.props, renderComponentChildren(item))
      if (item.text) return item.text
      return slots?.default?.() || null
    }
    const buildChildren = (item) => {
      if (Array.isArray(item.children) && !isEmpty(item.children)) {
        return item.children.map(item => buildItem(item))
      }
      return null
    }
    const buildContainer = () => {
      return h('div', {
        class: getClass(containerDescription?.class || '', 'basic-container p-16 bg-[#fff]'),
        style: getStyle(containerDescription?.style || {}, {})
      }, buildChildren(containerDescription))
    }
    return buildContainer
  }
}