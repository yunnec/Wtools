import { defineAsyncComponent } from 'vue'
import { pluginManager } from '../../core/plugin'
import { eventBus } from '../../core/event'

const QrCodeComponent = defineAsyncComponent(() => import('./QrCode.vue'))

pluginManager.registerModule({
  id: 'qrcode',
  component: QrCodeComponent,
  meta: {
    id: 'qrcode',
    name: '二维码生成器',
    version: '1.0.0',
    description: '生成和解析二维码',
    author: '梧桐工具箱团队'
  },
  async initialize() {
    console.log('二维码生成器初始化')
  },
  async destroy() {
    console.log('二维码生成器销毁')
  }
})

export default QrCodeComponent
