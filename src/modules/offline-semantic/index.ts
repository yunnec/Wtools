import { defineAsyncComponent } from 'vue'

// 异步加载组件
const Component = defineAsyncComponent(() => import('./OfflineSemantic.vue'))

export default Component
