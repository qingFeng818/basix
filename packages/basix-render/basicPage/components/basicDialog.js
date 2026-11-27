import { h, defineComponent, ref } from 'vue'
import { ElDialog } from 'element-plus'
import BasicBtns from './basicBtn.js'
import { useFlag } from '@/hooks'

/** 默认 footer 按钮配置：取消 + 确定 */
const defaultBtnList = [
  { key: 'cancel', label: '取消' },
  { key: 'confirm', label: '确定', type: 'primary' }
]

export default defineComponent({
  name: 'BaseDialog',
  /**
   * 关闭默认属性继承，由 render 手动把 $attrs 透传给 ElDialog，
   * 这样 top / center / modal / lockScroll / draggable / fullscreen / zIndex 等
   * ElDialog 原生属性无需在 props 中重复声明，直接写在 BaseDialog 上即可生效。
   */
  inheritAttrs: false,
  props: {
    /** v-model 绑定的显示状态 */
    modelValue: { type: Boolean, default: false },
    /** 弹窗标题，支持字符串 / VNode / render 函数 */
    title: { type: [String, Object, Function], default: '' },
    /** 宽度，默认 680px（ElDialog 默认是 50%，这里覆盖） */
    width: { type: [String, Number], default: '680px' },
    /** 是否追加到 body，默认 true（ElDialog 默认 false） */
    appendToBody: { type: Boolean, default: true },
    /** 关闭时销毁子组件，默认 true（ElDialog 默认 false） */
    destroyOnClose: { type: Boolean, default: true },
    /** 是否允许点击遮罩关闭，默认 false（ElDialog 默认 true） */
    closeOnClickModal: { type: Boolean, default: false },
    /** 自定义弹窗容器类名 */
    customClass: { type: String, default: 'basic-dialog' },
    /** 自定义遮罩层类名 */
    modalClass: { type: String, default: 'basic-dialog-modal' },
    /** 是否显示 footer，默认 true */
    showFooter: { type: Boolean, default: true },
    /** 自定义 footer 按钮配置；不传则使用默认「取消 + 确定」 */
    btnList: { type: Array, default: () => defaultBtnList },
    /** footer 对齐方式：left / center / right，默认 right */
    footerAlign: { type: String, default: 'right' },
    /** footer 按钮之间的间距（px） */
    footerGap: { type: Number, default: 8 },
    /**
     * 完全自定义 footer 的 render 函数：
     *   (h, { close }) => VNode
     * 优先级低于 footer slot，高于 btnList。
     */
    footerRender: { type: Function, default: null }
  },
  emits: [
    'update:modelValue',
    'confirm',
    'cancel',
    'open',
    'opened',
    'close',
    'closed'
  ],
  setup(props, { emit, slots, expose, attrs }) {
    /**
     * 内部确认按钮 loading 状态，供父组件通过 setLoading(true) / setLoading(false) 控制
     * （也可直接在 btnList 的 confirm 项上配置 loading 字段）
     */
    const [confirmLoading, setConfirmLoading] = useFlag(false)

    /** 统一关闭弹窗：向父组件发 modelValue=false */
    const close = () => emit('update:modelValue', false)

    /** 统一打开弹窗 */
    const open = () => emit('update:modelValue', true)
 
    const handleCancel = () => {
      let result
      try {
        result = emit('cancel')
      } catch (e) {
        return
      }
      if (result === false) return
      close()
    }
   
    const handleConfirm = async () => {
      let result
      try {
        result = emit('confirm', setConfirmLoading)
      } catch (e) {
        return
      }
      if (result && typeof result.then === 'function') {
        setConfirmLoading(true)
        try {
          const resolved = await result
          if (resolved !== false) close()
        } catch (_) {
          // 父组件抛错保持关闭
        } finally {
          setConfirmLoading(false)
        }
      } else if (result !== false) {
        close()
      }
    }
    expose({ close, open, setConfirmLoading })

    const bindDefaultHandler = (btn) => {
      if (btn.onClick) return btn
      const key = String(btn.key || btn.label || '').trim()
      const label = String(btn.label || '').trim()
      const cancelWords = ['cancel', '取消', '关闭']
      const confirmWords = ['confirm', '确定', '确认', '保存', '提交']
      if (cancelWords.includes(key) || cancelWords.includes(label)) {
        return { ...btn, onClick: handleCancel }
      }
      if (confirmWords.includes(key) || confirmWords.includes(label)) {
        return { ...btn, loading: btn.loading ?? confirmLoading.value, onClick: handleConfirm }
      }
      return btn
    }

    const renderTitle = () => {
      if (slots.title) return null
      const t = props.title
      if (t == null || t === '') return null
      if (typeof t === 'function') return h(t)
      if (typeof t === 'object') return t
      return t
    }

    const renderFooter = () => {
      if (!props.showFooter) return null
      if (slots.footer) return null
      if (props.footerRender) {
        return h(props.footerRender, null, { close })
      }
      const boundBtns = (props.btnList || defaultBtnList).map(bindDefaultHandler)
      return h(BasicBtns, {
        btnList: boundBtns,
        align: props.footerAlign,
        gap: props.footerGap
      })
    }

    return () => {
      const dialogProps = {
        // ElDialog 原生属性透传（top / center / modal / lockScroll / draggable / fullscreen / zIndex / beforeClose 等）
        ...attrs,
        modelValue: props.modelValue,
        'onUpdate:modelValue': (val) => emit('update:modelValue', val),
        title: renderTitle(),
        width: props.width,
        appendToBody: props.appendToBody,
        destroyOnClose: props.destroyOnClose,
        closeOnClickModal: props.closeOnClickModal,
        customClass: props.customClass,
        modalClass: props.modalClass,
        onOpen: () => emit('open'),
        onOpened: () => emit('opened'),
        onClose: () => emit('close'),
        onClosed: () => {
          setConfirmLoading(false)
          emit('closed')
        }
      }

      return h(ElDialog, dialogProps, {
        default: () => slots.default?.() ?? null,
        title: slots.title,
        footer: slots.footer || renderFooter
      })
    }
  }
})
