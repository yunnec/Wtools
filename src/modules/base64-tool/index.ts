import { defineAsyncComponent } from 'vue'
import { pluginManager } from '../../core/plugin'
import { eventBus } from '../../core/event'

const Base64ToolComponent = defineAsyncComponent(() => import('./Base64Tool.vue'))

pluginManager.registerModule({
  id: 'base64-tool',
  component: Base64ToolComponent,
  meta: {
    id: 'base64-tool',
    name: 'Base64工具',
    version: '1.0.0',
    description: 'Base64编码和解码',
    author: '梧桐工具箱团队'
  },
  async initialize() {
    console.log('Base64工具初始化')
  },
  async destroy() {
    console.log('Base64工具销毁')
  }
})

export default Base64ToolComponent
