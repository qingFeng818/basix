import { h } from 'vue'
import { ElTable } from 'element-plus'
import BasicTableColumn from './basicTableColumn.js'

export default {
  name: 'BasicTable',
  props: {
    // 复用 ElTable 自己的 props 声明：类型校验、默认值与 ElTable 完全同步
    ...ElTable.props,
    // 配置化列：[{ label, prop, width, minWidth, align, fixed, columnType, render, headerRender, slot, headerSlot, ... }]
    // 除 slot / headerSlot 外的键交给 BasicTableColumn 处理（内置 columnType + 原生属性透传）
    // 渲染优先级：具名插槽(slot/headerSlot) > render/headerRender > columnType > 原始值
    columns: {
      type: Array,
      default: () => []
    }
  },
  // 关闭自动落根，class/style、事件等未声明属性经 attrs 手动透传，避免重复
  inheritAttrs: false,
  setup(props, { slots, attrs }) {
    const buildColumn = (column, index) => {
      const { slot, headerSlot, ...colConfig } = column
      const columnSlots = {}
      if (slot && slots[slot]) {
        columnSlots.default = (scope) => slots[slot](scope)
      }
      if (headerSlot && slots[headerSlot]) {
        columnSlots.header = (scope) => slots[headerSlot](scope)
      }
      return h(BasicTableColumn, {
        column: colConfig,
        key: colConfig.prop || index
      }, columnSlots)
    }

    const buildTable = () => {
      // columns 是 BasicTable 自有配置，不能透传给 ElTable（会变成根节点 DOM attribute）
      const { columns, ...tableProps } = props
      return h(ElTable, { ...attrs, ...tableProps }, {
        default: () => [
          ...columns.map(buildColumn),
          // 同时保留默认插槽，配置列之外还可手写 el-table-column 混用
          slots.default?.()
        ]
      })
    }

    return buildTable
  }
}
