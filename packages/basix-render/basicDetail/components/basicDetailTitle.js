import { h } from 'vue'
import { getClass, getStyle } from '@/components/basicPage/utils'
import {ElButton, ElIcon} from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
// v2 JIT 不支持 bg-[url(...)] 任意值，背景图走 import + inline style
import headerBg from '@/assets/img/details/leaseApplyDetailTitle.png'
export default {
  name: 'DetailTitleContainer',
  props: {
    title: String,
    class: [String, Object, Array],
    backText:String,
    style:Object
  },
  setup(props, {slots}) {
    const router = useRouter()
    const buildBackIcon = () => {
      return h(ElIcon, {
        class: 'mr-0 text-[14px] text-[#fff]'
      }, h(ArrowLeft))
    }
    const buildBackText = () => {
      return h('span', {
        class: 'text-[14px] text-[#fff] '
      }, $tl(props.backText || '返回'))  
    }
    const buildBackBtn = () => {
      return h(ElButton, {
        type: 'primary',
        onClick: () => {
          router.back()
        },
        class: getClass(props.class, 'h-32 w-80')
      }, [
        buildBackIcon(),
        buildBackText()
      ])
    }
    const buildTitle = () => {
      return h('span', {
        class: 'text-[20px] text-[#121212] font-medium'
      }, $tl(props.title || '详情'))
    }
    const buildLeft = () => {
      return h('div', {
        class: getClass(props.class, ' flex items-center gap-x-12')
      }, [buildBackBtn(), buildTitle()])
    }
    const buildRight = () => {
      return h('span', {
        class: 'flex items-center gap-x-12' 
      }, {
        default: () => slots.right?.()
      })
    }

    const buildHeaderContainer = () => {
      const containerDefaultClass = 'flex items-center justify-between px-16 mb-[16px] h-[60px] rounded-[8px] ]'
      return h('div', {
        class: getClass(props.class, containerDefaultClass),
        style: getStyle(props.style, {
          backgroundImage: `url(${headerBg})`,
          backgroundRepeat: 'no-repeat'
        })
      }, [buildLeft(), buildRight()])
    }
    return buildHeaderContainer
  }
}