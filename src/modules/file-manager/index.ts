import { defineAsyncComponent } from 'vue'
import { pluginManager } from '../../core/plugin'
import { eventBus } from '../../core/event'

// 异步加载文件管理器组件
const FileManagerComponent = defineAsyncComponent(() => import('./FileManager.vue'))

// 注册文件管理器模块
pluginManager.registerModule({
  id: 'file-manager',
  component: FileManagerComponent,
  meta: {
    id: 'file-manager',
    name: '文件管理器',
    version: '1.0.0',
    description: '浏览和管理本地文件',
    author: '梧桐工具箱团队'
  },
  async initialize() {
    console.log('文件管理器初始化')
    eventBus.on('file-manager:open', () => {
      console.log('文件管理器已打开')
    })
  },
  async destroy() {
    console.log('文件管理器销毁')
  }
})

export default FileManagerComponent
