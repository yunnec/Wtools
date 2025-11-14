<template>
  <div id="app" class="min-h-screen bg-gray-50 dark:bg-dark-bg flex">
    <!-- 左侧栏 -->
    <aside
      v-show="sidebarExpanded"
      class="w-64 bg-white dark:bg-dark-card border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ease-in-out overflow-hidden"
    >
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 class="text-xl font-bold text-gray-900 dark:text-gray-100">梧桐工具箱</h1>
      </div>
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索工具..."
          class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div class="flex-1 overflow-y-auto p-2">
        <button
          v-for="tab in filteredTabs"
          :key="tab.id"
          @click="switchToTab(tab.id)"
          :class="currentModuleId === tab.id
            ? 'w-full text-left p-3 rounded-lg mb-1 flex items-center gap-3 bg-blue-500 text-white'
            : 'w-full text-left p-3 rounded-lg mb-1 flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'"
        >
          <span class="text-2xl">{{ tab.icon }}</span>
          <div class="flex-1">
            <div class="font-medium">{{ tab.name }}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">{{ tab.description }}</div>
          </div>
        </button>
      </div>
      <div class="p-4 border-t border-gray-200 dark:border-gray-700 text-center">
        <ThemeToggle />
      </div>
    </aside>

    <!-- 右侧主内容区 -->
    <main class="flex-1 flex flex-col transition-all duration-300 ease-in-out">
      <!-- 顶部导航栏 -->
      <header class="bg-white dark:bg-dark-card border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold">{{ currentTab?.name || '梧桐工具箱' }}</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400">{{ currentTab?.description }}</p>
        </div>
        <!-- 收起/展开按钮 -->
        <button
          @click="toggleSidebar"
          class="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          :title="sidebarExpanded ? '收起侧边栏' : '展开侧边栏'"
        >
          <svg
            v-if="sidebarExpanded"
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
          <svg
            v-else
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 5l7 7-7 7M5 5l7 7-7 7"
            />
          </svg>
        </button>
      </header>

      <!-- 内容区域 -->
      <div class="flex-1 overflow-auto bg-gray-50 dark:bg-dark-bg p-6">
        <div v-if="!currentModule" class="h-full flex items-center justify-center text-center">
          <div>
            <div class="text-6xl mb-4">🛠️</div>
            <h3 class="text-2xl font-semibold mb-2">欢迎使用梧桐工具箱</h3>
            <p class="text-gray-600 dark:text-gray-400">从左侧选择一个工具开始使用</p>
          </div>
        </div>
        <component v-else :is="currentModule" />
      </div>
    </main>

    <!-- Toast 提示容器 -->
    <ToastContainer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { defineAsyncComponent } from 'vue'
import { eventBus } from './core/event'
import ThemeToggle from './components/ui/ThemeToggle.vue'
import ToastContainer from './components/ui/ToastContainer.vue'
import { moduleRegistry } from './modules/ModuleRegistry'

const currentModule = ref(null)
const currentModuleId = ref('home')
const searchQuery = ref('')
// 左侧栏展开状态，默认展开
const sidebarExpanded = ref(true)

const currentTab = computed(() => {
  if (currentModuleId.value === 'home') return null
  return moduleRegistry.find(m => m.id === currentModuleId.value)
})

const filteredTabs = computed(() => {
  if (!searchQuery.value) return moduleRegistry
  const query = searchQuery.value.toLowerCase()
  return moduleRegistry.filter(module =>
    module.name.toLowerCase().includes(query) ||
    module.description.toLowerCase().includes(query)
  )
})

const moduleComponents = {
  'shortcut-commands': defineAsyncComponent(() => import('./modules/shortcut-commands/index.ts')),
  'semantic-compare': defineAsyncComponent(() => import('./modules/semantic-compare/index.ts')),
  'color-picker': defineAsyncComponent(() => import('./modules/color-picker/index.ts')),
  'json-tool': defineAsyncComponent(() => import('./modules/json-tool/index.ts')),
  'base64-tool': defineAsyncComponent(() => import('./modules/base64-tool/index.ts')),
  'semantic-request': defineAsyncComponent(() => import('./modules/semantic-request/index.ts')),
  'xunfei-semantic-request': defineAsyncComponent(() => import('./modules/xunfei-semantic-request/index.ts')),
  'offline-semantic': defineAsyncComponent(() => import('./modules/offline-semantic/index.ts')),
  'text-diff': defineAsyncComponent(() => import('./modules/text-diff/index.ts')),
}

// 切换左侧栏展开/收起状态
const toggleSidebar = () => {
  sidebarExpanded.value = !sidebarExpanded.value
  // 保存用户偏好
  localStorage.setItem('wutong-sidebar-expanded', sidebarExpanded.value.toString())
}

const switchToTab = async (moduleId) => {
  console.log('%c[App] 🔄 切换模块', 'color: purple; font-weight: bold;', moduleId)
  if (currentModuleId.value === moduleId) {
    console.log('[App] 当前已在该模块，跳过')
    return
  }

  const previousId = currentModuleId.value
  console.log('[App] 上一个模块:', previousId)

  if (previousId !== 'home') {
    eventBus.emit('module:closed', { id: previousId })
  }

  if (moduleId === 'home') {
    console.log('[App] 切换到首页')
    currentModule.value = null
    currentModuleId.value = 'home'
  } else {
    console.log('[App] 正在加载模块组件:', moduleId)
    currentModuleId.value = moduleId
    await new Promise(resolve => setTimeout(resolve, 100))

    const component = moduleComponents[moduleId]
    console.log('[App] 获取到的组件:', component)

    currentModule.value = component
    console.log('[App] ✅ 模块组件已设置')
    eventBus.emit('module:opened', { id: moduleId })
  }
}

onMounted(() => {
  // 加载用户保存的侧边栏状态
  const savedState = localStorage.getItem('wutong-sidebar-expanded')
  if (savedState !== null) {
    sidebarExpanded.value = savedState === 'true'
  }
  console.log('梧桐工具箱已启动 - 9个实用工具')
})
</script>
