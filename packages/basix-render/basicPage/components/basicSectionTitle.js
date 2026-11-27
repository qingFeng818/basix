import {h} from 'vue'
import { getClass, getStyle } from '../utils'

export default {
  name: 'BasicSectionTitle',
  props: {
    title: {
      type: String,
      default: ''
    },
    class: String,
    style: Object
  },

  setup(props) {
    const defaultStyle = {
      display: 'flex',
      alignItems: 'center',
      borderLeft: '2px solid #5a82f6',
      paddingLeft: '16px',
      height: '26px',
      position: 'relative',
      fontSize: 'var(--jz-font-size)',
      fontWeight: 'var(--jz-title-weight)',
      color: 'var(--jz-text-color)',
      background: 'linear-gradient(90deg, rgba(79, 131, 254, 0.14) 0%, rgba(255, 255, 255, 0) 100%)'
    }

    const buildSectionTitle = () => {
      return h('div', 
        {
          style: getStyle(props.style, {...defaultStyle}),
          class: getClass(props.class, 'section-title')
        }, 
        {
          default: () => props.title
        }
      )
    }
    return buildSectionTitle
  }
}