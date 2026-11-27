import {h} from 'vue'
import { getClass, getStyle } from '@/components/basicPage/utils/index.js'
import ErrorIcon from '@/assets/img/details/error-icon.png'
import SuccessIcon from '@/assets/img/details/success-icon.png'
import WarningIcon from '@/assets/img/details/warning-icon.png'

export const statusMap = {
  success: 'success',
  error: 'error',
  warning: 'warning'
}

const statusIcon = {
  [statusMap.success]: SuccessIcon,
  [statusMap.error]: ErrorIcon,
  [statusMap.warning]: WarningIcon
}
const statusColor = {
  [statusMap.success]: '#2AB405',
  [statusMap.error]: '#FF4D4F',
  [statusMap.warning]: '#FF9900'
}

export default {
  name: 'basicCheckResultStatus',
  props: {
    status: {
      type: String,
      default: ''
    },
    description:String
  },
  setup(props, {attrs}) {
    const buildStatusIcon = () => {
      const defaultClass = 'block w-24 h-24 mr-8 object-cover'
      return h('img', {
        src: statusIcon[props.status],
        alt: props.imgAlt || props.description,
        class: getClass(attrs.imgClass, defaultClass),
        style: getStyle(attrs.imgStyle, {})
      })
    }
    const buildStatusText = () => {
      return h('span', {
        class: getClass(attrs.descriptionClass, 'text-[14px] font-bold'),
        style: getStyle(attrs.descriptionStyle, {color: statusColor[props.status]})
      }, {
        default: () => props.description
      })
    }
    const buildCheckResultStatus = () => {
      if (!statusMap[props.status]) {
        console.error('status is not valid')
        return null
      }
      return h('div', {
        class: getClass(attrs.class, 'flex items-center'),
        style: getStyle(attrs.style, {color: statusColor[props.status]})
      }, [buildStatusIcon(), buildStatusText()])
    }
    return buildCheckResultStatus
  }
}