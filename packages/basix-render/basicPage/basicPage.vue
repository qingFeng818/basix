<template>
  <JflProPageContainer
    :page-name="pageName"
    class="contract-list router-container-page"
  >
    <div
      class="list-main page-container"
      :class="{
        'radio-main': selectType === 'radio',
      }"
    >
      <SearchTable
        ref="tableRef"
        v-model:select="selections"
        :use-select="useSelect"
        :select-type="selectType"
        fixed="left"
        :row-key="rowKey"
        :max-height="tableMaxHeight"
        :request-api="request"
        :properties="formProperties"
        :btn-list="btnList"
      >
        <template
          v-if="buttons && buttons.length > 0"
          #buttons
        >
          <BasicBtns :btn-list="buttons" />
        </template>
        <TableColumnsRender :columns="columns" />
      </SearchTable>
    </div>
  </JflProPageContainer>
</template>
<script setup>
import { ref } from 'vue'
// other
import { assertType, assertAttribute} from '@/utils/pageUtils'
import usePage from '@/hooks/usePage'

// component
import { JflProPageContainer } from '@cfs/pro-components'
import BasicBtns from '@/components/basicPage/components/basicBtn.js'  
import SearchTable from '@/components/searchTable/index.vue'
import TableColumnsRender from '@/components/tableColumnsRender/index.js'

const selections = ref([])
const getSelections = () => selections.value

const props = defineProps({
  columns:Array,
  rowKey:String,
  pageName:String,
  fetchList:Function,
  formProperties:Object,
  handleParams:Function,
  buttons:Array,
  btnList:Array,
  useSelect:{ type:Boolean, default:false },
  selectType:{ type:String, default:'checkbox' },
  tableMaxHeight:{ type:Number, default:550 }
})
const formProperties = props.formProperties

const fetchList = assertAttribute(assertType.isFunction(props.fetchList), props.fetchList) 
const handleParams = assertAttribute(assertType.isFunction(props.handleParams), props.handleParams)
const { tableRef, request } = usePage({ fetchList, handleParams })
const refresh = () => tableRef.value?.getTableData()
defineExpose({
  getSelections,
  refresh
})
</script>

<style scoped lang="scss">
::v-deep(.radio-main){
  .el-checkbox__inner{
    border-radius: 50% !important;
  }
  .el-table__header{
    .el-checkbox{
      display: none;

    }
  }
}
.router-container-page {
  padding: 16px;
  height: 100%;
  border-radius: 8px;
  overflow-y: hidden;
  .page-container {
    padding: 16px;
    background: #fff;
    position: relative;
    border-radius: 8px;
    height: 100%;
  }
}
</style>
