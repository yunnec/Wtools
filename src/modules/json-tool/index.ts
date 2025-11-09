import { defineAsyncComponent } from 'vue'
import { pluginManager } from '../../core/plugin'
import { eventBus } from '../../core/event'

const JsonToolComponent = defineAsyncComponent(() => import('./JsonTool.vue'))

pluginManager.registerModule({
  id: 'json-tool',
  component: JsonToolComponent,
  meta: {
    id: 'json-tool',
    name: 'JSON工具',
    version: '1.0.0',
    description: '格式化、验证、压缩JSON数据',
    author: '梧桐工具箱团队'
  },
  async initialize() {
    console.log('JSON工具初始化')
  },
  async destroy() {
    console.log('JSON工具销毁')
  }
})

export default JsonToolComponent
