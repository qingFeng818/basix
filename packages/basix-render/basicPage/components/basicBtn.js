
import { h, defineComponent, resolveDynamicComponent, onBeforeUnmount } from 'vue'
import { ElButton, ElIcon, ElDropdown, ElDropdownItem, ElDropdownMenu } from 'element-plus'
import { getClass, getStyle, isEmpty } from '../utils/index.js'

/** ElButton 专属字段（非保留字段会被透传，所以 reserved 里是"不外传"的） */
const BUTTON_RESERVED = new Set([
  'key', 'label', 'labelClass', 'labelStyle', 'labelRender',
  'icon', 'iconSize', 'iconPosition', 'onClick',
  'split', 'trigger', 'placement', 'children'
])

/** ElDropdownItem 专属字段 */
const DROPDOWN_ITEM_RESERVED = new Set([
  'key', 'label', 'icon', 'iconSize', 'onClick'
])

export default defineComponent({
  name: 'BasicBtn',
  props: {
    btnList: { type: Array, required: true },
    align: { type: String, default: 'right' },
    gap: { type: Number, default: 8 },
    class: { type: String, default: '' },
    style: { type: Object, default: () => ({}) }
  },
  emits: ['click', 'command'],
  setup(props, { emit }) {
    /** 从 btn 里挑出要透传给 ElButton 的属性 */
    const pickButtonProps = (btn) => {
      const result = {}
      Object.keys(btn).forEach((k) => {
        if (!BUTTON_RESERVED.has(k)) result[k] = btn[k]
      })
      return result
    }

    /** 从 item 里挑出要透传给 ElDropdownItem 的属性 */
    const pickDropdownItemProps = (item) => {
      const result = {}
      Object.keys(item).forEach((k) => {
        if (!DROPDOWN_ITEM_RESERVED.has(k)) result[k] = item[k]
      })
      return result
    }

    /** 渲染图标 VNode */
    const renderIcon = (icon, iconSize, btn) => {
      if (!icon) return null
      return h(ElIcon, { size: iconSize || 14, class: btn.iconClass, style: btn.iconStyle }, () => h(resolveDynamicComponent(icon)))
    }

    /** 渲染 label VNode */
    const renderLabel = (btn) => {
      if (btn.labelRender) return btn.labelRender(h)
      if (btn.label == null || btn.label === '') return null
      return h('span', { class: btn.labelClass, style: btn.labelStyle }, btn.label)
    }

    /**
     * 组装按钮子节点：按 iconPosition 决定图标和 label 顺序
     * @param {Object} btn BtnConfig
     * @param {boolean} includeLabel 是否包含 label（split-button 的 caret 按钮不需要）
     */
    const buildButtonChildren = (btn, includeLabel = true) => {
      const iconVNode = renderIcon(btn.icon, btn.iconSize, btn)
      const position = btn.iconPosition || 'left'
      const labelVNode = includeLabel ? renderLabel(btn) : null

      if (position === 'only') return iconVNode ? [iconVNode] : []
      if (position === 'right') return [labelVNode, iconVNode].filter(Boolean)
      // left（默认）
      return [iconVNode, labelVNode].filter(Boolean)
    }

    /** 渲染普通 ElButton */
    const renderNormalButton = (btn, index) => {
      const buttonProps = {
        ...pickButtonProps(btn),
        onClick: (e) => {
          if (btn.disabled || btn.loading) return
          btn.onClick?.(btn, index, e)
          emit('click', btn, index, e)
        }
      }
      const children = buildButtonChildren(btn)
      return h(ElButton, buttonProps, children.length ? { default: () => children } : null)
    }

    /** 渲染 ElDropdown 的每一个 ElDropdownItem */
    const renderDropdownItem = (item, parentBtn, btnIndex) => {
      const onClick = (e) => {
        if (item.disabled) return
        item.onClick?.(item, parentBtn, btnIndex, e)
        emit('command', item, parentBtn, btnIndex, e)
      }
      const itemProps = {
        ...pickDropdownItemProps(item),
        command: item,
        onClick
      }
      const children = [
        renderIcon(item.icon, item.iconSize),
        item.label != null ? h('span', item.label) : null
      ].filter(Boolean)
      return h(ElDropdownItem, itemProps, children.length ? { default: () => children } : null)
    }

    /** 渲染下拉按钮（ElDropdown） */
    const renderDropdownButton = (btn, index) => {
      const trigger = btn.trigger || 'hover'
      const placement = btn.placement || 'bottom-end'
      const buttonProps = pickButtonProps(btn)

      const dropdownProps = {
        trigger,
        placement,
        ...(btn.split ? { splitButton: true } : {}),
        onVisibleChange: (val) => btn.onVisibleChange?.(val, btn, index)
      }

      const dropdownMenu = h(
        ElDropdownMenu,
        null,
        () => btn.children.map((item) => renderDropdownItem(item, btn, index))
      )

      if (btn.split) {
        // split-button：主按钮负责 btn.onClick，caret 按钮由 ElDropdown 自动接管；
        // 下拉项点击统一走 ElDropdownItem 里的 onClick
        const mainBtn = h(ElButton, {
          ...buttonProps,
          onClick: (e) => {
            if (btn.disabled || btn.loading) return
            btn.onClick?.(btn, index, e)
            emit('click', btn, index, e)
          }
        }, { default: () => buildButtonChildren(btn) })

        return h(ElDropdown, dropdownProps, {
          default: () => [mainBtn, h(ElButton, buttonProps)],
          dropdown: () => dropdownMenu
        })
      }

      // 普通下拉：trigger 就是一个按钮，ElDropdown 自动附加 caret
      // 注意：Element Plus 下拉按钮的点击由 ElDropdown 拦截来打开弹层，
      // 不会透传到 ElButton 的 click 事件，所以 btn.onClick 在这里不会触发；
      // 如果业务需要响应「打开」，请使用 btn.onVisibleChange
      const triggerBtn = h(ElButton, buttonProps, { default: () => buildButtonChildren(btn) })

      return h(ElDropdown, dropdownProps, {
        default: () => triggerBtn,
        dropdown: () => dropdownMenu
      })
    }

    /**
     * 路由：有 children 就渲染下拉按钮，否则普通按钮
     */
    const renderBtn = (btn, index) => {
      if (Array.isArray(btn.children) && btn.children.length) {
        return renderDropdownButton(btn, index)
      }
      return renderNormalButton(btn, index)
    }
    const handleLeavePage = () => {
      BUTTON_RESERVED.clear()
      DROPDOWN_ITEM_RESERVED.clear()
    }
    onBeforeUnmount(handleLeavePage)
    return () => {
      const justify = { left: 'flex-start', center: 'center', right: 'flex-end' }[props.align] || 'flex-end'
      if (isEmpty(props.btnList)) return null
      return h(
        'div',
        {
          class: getClass(props.class, 'btn-list'),
          style: getStyle(props.style, {
            display: 'flex',
            justifyContent: justify,
            alignItems: 'center',
            gap: `${props.gap}px`,
            marginLeft: `${props.gap}px`
          })
        },
        props.btnList.map(renderBtn)
      )
    }
  }
})
