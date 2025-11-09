import { defineAsyncComponent } from 'vue'
import { pluginManager } from '../../core/plugin'
import { eventBus } from '../../core/event'

// 异步加载颜色选择器组件
const ColorPickerComponent = defineAsyncComponent(() => import('./ColorPicker.vue'))

// 注册颜色选择器模块
pluginManager.registerModule({
  id: 'color-picker',
  component: ColorPickerComponent,
  meta: {
    id: 'color-picker',
    name: '颜色选择器',
    version: '1.0.0',
    description: '选择颜色、生成调色板、格式转换',
    author: '梧桐工具箱团队'
  },
  async initialize() {
    console.log('颜色选择器初始化')
    eventBus.on('color-picker:open', () => {
      console.log('颜色选择器已打开')
    })
  },
  async destroy() {
    console.log('颜色选择器销毁')
  }
})

export default ColorPickerComponent
