import { h } from 'vue'
import { getClass, getStyle } from '@/components/basicPage/utils'
import BasicSectionTitle from '@/components/basicPage/components/basicSectionTitle'
export default {
  name: 'DetailCardItem',
  props: {
    title: String,
    class: String | Object | Array,
    style: Object
  },
  setup(props, {slots, attrs}) {

    const buildHeaderLeft = () => {
      return h(BasicSectionTitle, {
        class: '-ml-16 section-header-left gap-x-8',
        title:$tl(props.title || '详情')
      })
    }
    const buildHeaderRight = () => {
      return h('div', {
        class: 'flex items-center justify-end section-header-right gap-x-8'
      }, {
        default: () => slots.headerRight?.()
      })
    }
    const buildCardItem = () => {
      return h('div', {
        class: getClass(props.class, 'section-item bg-[#fff] rounded-[8px] mb-[16px] overflow-hidden'),
        style: getStyle(props.style)
      }, [
        h('div', {
          class: 'section-header flex items-center justify-between px-16 py-12'
        }, [
          buildHeaderLeft(),
          buildHeaderRight()
        ]),
        h('div', {
          class: 'section-content p-16 pt-0'
        }, {
          default: () => slots.default?.()
        })
      ])
    }

    return buildCardItem
  }
}