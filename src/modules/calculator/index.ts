import { defineAsyncComponent } from 'vue'
import { pluginManager } from '../../core/plugin'
import { eventBus } from '../../core/event'

// 异步加载计算器组件
const CalculatorComponent = defineAsyncComponent(() => import('./Calculator.vue'))

// 注册计算器模块
pluginManager.registerModule({
  id: 'calculator',
  component: CalculatorComponent,
  meta: {
    id: 'calculator',
    name: '计算器',
    version: '1.0.0',
    description: '执行基础和高级数学计算',
    author: '梧桐工具箱团队'
  },
  async initialize() {
    console.log('计算器初始化')
    eventBus.on('calculator:calculated', (data) => {
      console.log('计算结果:', data)
    })
    eventBus.on('calculator:cleared', () => {
      console.log('计算器已清空')
    })
  },
  async destroy() {
    console.log('计算器销毁')
  }
})

export default CalculatorComponent
