import {h} from 'vue'
import { getClass, getStyle } from '@/components/basicPage/utils'
import { isEmpty } from '@/utils/pageUtils'
import {ElIcon, ElTooltip} from 'element-plus'
import {InfoFilled} from '@element-plus/icons-vue'
import tagIcon from '@/components/tagIcon/index.vue'
import { statusMap as tagStatusMap } from '@/constants/pageMap'

export default {
  name: 'BasicDescription',
  props:{
    fields:Array,
    detailData:Object,
    mainKey:{
      type:String,
      default:'prop'
    }
  },
  setup(props, { slots, attrs }) {
    console.log(props.detailData, 'detailData')
    const buildTip = (item) => {
      if (!item.tip) return null
      return h(ElTooltip, {
        class: getClass('description-tooltip', item.tooltipClass),
        style: getStyle({}, item.tooltipStyle),
        content: item.tip
      }, h('span', {
        class: getClass('description-tooltip-icon', item.tooltipIconClass),
        style: getStyle({}, item.tooltipIconStyle)
      }, h(ElIcon, {}, InfoFilled)))
    }

    const buildLabel = (item) => {
      if (item.renderLabel) return item.renderLabel(item, props.detailData)
      if (item.slotLabel) return slots?.[item.slotLabel]?.(item, props.detailData)
      return h('span', {
        class: getClass(item.labelClass, 'module-label text-[#666]')
      }, [item.label, buildTip(item), ':'])
    }
    const getValue = (item, key, detailData) => {
      if (item.formatter) return item.formatter(detailData, item)
      if (item.tagType) {
        const props = item.tagProps || {}
        // TODO: 需要重写tagIcon组件
        if (!tagStatusMap[item.tagType]) return detailData[key] || '-'
        return h(tagIcon, {
          auto: props.auto || false,
          type: item.tagType,
          label: detailData[item[props.mainKey]] || '-',
          class: getClass(props.class, 'module-tag text-[12px] text-[#fff]'),
          style: getStyle({}, props.style)
        })
      }
      return detailData[item[props.mainKey]] || '-'
    }
    const buildValue = (item) => {
      if (item.renderValue) return item.renderValue(item, props.detailData)
      if (item.slotValue) return slots?.[item.slotValue]?.(item, props.detailData)
      return h('span', {
        class: getClass(item.valueClass, 'module-value text-ellipsis text-[#121212] ml-[8px]'),
        style: getStyle({}, item.valueStyle)
      }, getValue(item, item[props.mainKey], props.detailData))
    }

    const buildDescription = () => {
      return h('div', {
        class: getClass(attrs.class, 'basic-description grid grid-cols-4 gap-x-24 gap-y-12'),
        style: getStyle(attrs.style, {})
      }, {
        default: () => {
          if (isEmpty(props.fields)) return null
          return props.fields.map((item) => {
            return h('div', {
              class: getClass('module-item flex items-center min-w-0 text-[14px]', item.class),
              style: getStyle({}, item.style),
              key: item.prop
            }, [
              buildLabel(item), 
              buildValue(item)
            ])
          })
        }
      })
    }

    return buildDescription
  }
}