import { defineAsyncComponent } from 'vue'
import { pluginManager } from '../../core/plugin'
import { eventBus } from '../../core/event'

const UrlToolComponent = defineAsyncComponent(() => import('./UrlTool.vue'))

pluginManager.registerModule({
  id: 'url-tool',
  component: UrlToolComponent,
  meta: {
    id: 'url-tool',
    name: 'URL工具',
    version: '1.0.0',
    description: 'URL编码/解码、参数解析',
    author: '梧桐工具箱团队'
  },
  async initialize() {
    console.log('URL工具初始化')
  },
  async destroy() {
    console.log('URL工具销毁')
  }
})

export default UrlToolComponent
