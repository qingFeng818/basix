import { h } from 'vue'
import { ElTableColumn } from 'element-plus'

import TagIcon from '@/components/tagIcon/index.vue'
import OperateBtn from '@/components/operateBtn/index.vue'
import { columnTypeMap, operatePropsMap } from '@/constants/pageMap'
import { isEmpty, ishasProperty, getType, assertType, executeFunction } from '@/utils/pageUtils'

/**
 * 配置化表格列组件：单个 column 配置对象进，ElTableColumn 出
 * 内置单元格类型与 tableColumnsRender 对齐（link / format / tag / operate），
 * 并扩展 render / headerRender 支持任意自定义单元格与表头。
 *
 * column 配置键说明：
 * - 原生透传：prop / label / width / minWidth / align / fixed / type / sortable 等，
 *   除下方配置键外全部透传给 ElTableColumn
 * - columnType：columnTypeMap 内置类型（link 可点击文本 / format 格式化 / tag 标签 / operate 操作按钮组）
 * - render(h, row, scope)：完全自定义单元格，优先级高于 columnType
 * - headerRender(h, scope)：完全自定义表头，优先级低于外部传入的 header 插槽
 * - emptyText：空值兜底文本，默认 '-'（显式传 '' 可让空值渲染为空白）
 * - showTooltip：溢出省略提示，默认 true（映射为 showOverflowTooltip）
 * - 类型配套参数：link 用 onClick/class；format 用 formatter({row, rawValue})；
 *   tag 用 tagProps；operate 用 buttons 及 operatePropsMap 中的键
 */
// 渲染配置键：不透传给 ElTableColumn（由各 build 函数从完整配置中读取）
const CONFIG_KEYS = [
  'columnType', 'render', 'headerRender', 'emptyText', 'showTooltip',
  'tagProps', 'buttons', 'isCalOperate', 'calOperate', 'onClick', 'formatter',
  'title', 'gap', 'moreText', 'paddingX', 'borderWidth', 'maxWidth', 'color'
]

export default {
  name: 'BasicTableColumn',
  props: {
    column: {
      type: Object,
      required: true
    }
  },
  setup(props, { slots }) {
    const setValue = (target, key, val) => {
      if (isEmpty(val)) return
      target[key] = val
    }

    const isEmptyExcludeType = (type) => {
      const excludeTypeMap = { operate: 1 }
      return !excludeTypeMap[type]
    }

    const buildLinkSlot = (col, row, rawValue) => {
      if (ishasProperty(col, 'class')) {
        const classMapFn = {
          'object': (cls) => cls['table-column-link'] = true,
          'array': (cls) => cls.push('table-column-link'),
          'string': (cls, col) => col.class += ' table-column-link'
        }
        classMapFn[getType(col.class)]?.(col.class, col)
      }
      const linkProps = {
        class: (col.class && col.class) || 'table-column-link',
        onClick: () => assertType.isFunction(col.onClick) && col.onClick(row)
      }
      return h('span', linkProps, rawValue)
    }

    const buildFormatterSlot = (col, row, rawValue) => {
      return executeFunction(col.formatter, { row, rawValue }) || rawValue
    }

    const buildTagSlot = (col, row, rawValue) => {
      if (!ishasProperty(col, 'tagProps')) return rawValue
      if (!ishasProperty(col.tagProps, 'type')) return rawValue
      const tagConfig = col.tagProps
      const tag = {}
      setValue(tag, 'auto', !!ishasProperty(tagConfig, 'auto') || tagConfig.auto)
      setValue(tag, 'label', executeFunction(tagConfig.label, { row, rawValue }))
      setValue(tag, 'type', executeFunction(tagConfig.type, { row, rawValue }))
      if (!ishasProperty(tag, 'label')) setValue(tag, 'label', rawValue)
      return h(TagIcon, tag)
    }

    const buildOperateBtnSlot = (col, row, rawValue) => {
      if (!ishasProperty(col, 'buttons') || !col.buttons.length) return rawValue
      if (col.isCalOperate && !col.calOperate) return '-'
      const operateBtn = {}
      const operateKeys = Object.values(operatePropsMap)
      operateKeys.forEach((key) => ishasProperty(col, key) && setValue(operateBtn, key, executeFunction(col[key], row)))
      const filterBtn = (item) => !ishasProperty(item, 'hidden') || !executeFunction(item.hidden, { row })
      operateBtn.items = col.buttons.filter(filterBtn)
      operateBtn.row = row
      operateBtn.isCalOperate = col.isCalOperate
      return h(OperateBtn, operateBtn)
    }

    const columnTypeRenderFnMap = {
      [columnTypeMap.link]: buildLinkSlot,
      [columnTypeMap.format]: buildFormatterSlot,
      [columnTypeMap.tag]: buildTagSlot,
      [columnTypeMap.operate]: buildOperateBtnSlot
    }

    // 统一的 default slot 工厂：根据 column 配置决定渲染内容
    const buildDefaultSlot = (col) => (scope) => {
      const { row } = scope
      const rawValue = row[col.prop]
      // 1. 自定义 render 优先，完全交给调用方控制
      if (col.render) return col.render(h, row, scope)
      // 2. 空值兜底
      if (isEmpty(rawValue) && isEmptyExcludeType(col.columnType)) {
        return ishasProperty(col, 'emptyText') ? col.emptyText : '-'
      }
      // 3. 无内置类型时渲染原始值
      if (!ishasProperty(col, 'columnType')) return rawValue
      // 4. 内置类型分发
      const renderFn = columnTypeRenderFnMap[col.columnType]
      return (renderFn && renderFn(col, row, rawValue)) || rawValue
    }

    return () => {
      const col = props.column || {}
      const { columnType, headerRender, showTooltip, formatter } = col
      // 配置键与原生透传键分离，避免配置键成为 ElTableColumn 的无效 attr
      const columnAttrs = {}
      Object.keys(col).forEach((key) => {
        if (!CONFIG_KEYS.includes(key)) columnAttrs[key] = col[key]
      })

      // showTooltip 语义与 tableColumnsRender 对齐：未传时默认开启
      columnAttrs.showOverflowTooltip = !ishasProperty(col, 'showTooltip') || showTooltip

      // formatter 双签名冲突处理：format 类型走 buildFormatterSlot({row, rawValue})，
      // 其余场景按 ElTableColumn 原生 formatter 透传
      if (!columnType && formatter) columnAttrs.formatter = formatter

      const columnSlots = {}
      // 表头：外部 header 插槽 > headerRender 配置 > 原生 label
      if (slots.header) columnSlots.header = slots.header
      else if (headerRender) columnSlots.header = (scope) => headerRender(h, scope)
      // 单元格：外部 default 插槽 > 配置渲染；type 列（selection/index/expand）不接管
      if (slots.default) columnSlots.default = slots.default
      else if (!columnAttrs.type) columnSlots.default = buildDefaultSlot(col)

      return h(ElTableColumn, columnAttrs, columnSlots)
    }
  }
}
