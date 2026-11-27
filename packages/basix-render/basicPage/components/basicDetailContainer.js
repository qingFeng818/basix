import { h } from 'vue'
import { getClass, getStyle } from '../utils/index.js'
import {JflProPageContainer} from '@cfs/pro-components'
export default {
  name: 'BasicDetailContainer',
  props: {
    title: {
      type: String,
      default: ''
    },
    class: String,
    style: Object,
    pageId: String,
    pageName: String
  },
  setup(props, { slots }) {
    const buildPage = () => {
      return h(
        JflProPageContainer,
        {
          style: getStyle(props.style, { padding: '16px'}),
          class: getClass(props.class, 'router-container-detail'),
          pageId:props.pageId,
          pageName:props.pageName
        },
        {
          default: () => slots.default?.() || props.title
        }
      )
    }
    return buildPage
  }
}
