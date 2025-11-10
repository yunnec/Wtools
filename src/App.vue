<template>
  <div id="app" class="min-h-screen bg-gray-50 dark:bg-dark-bg flex">
    <aside class="w-64 bg-white dark:bg-dark-card border-r border-gray-200 dark:border-gray-700 flex flex-col transition-colors">
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
    <main class="flex-1 flex flex-col">
      <header class="bg-white dark:bg-dark-card border-b px-6 py-4">
        <h2 class="text-xl font-bold">{{ currentTab?.name || '梧桐工具箱' }}</h2>
        <p class="text-sm text-gray-600 dark:text-gray-400">{{ currentTab?.description }}</p>
      </header>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { defineAsyncComponent } from 'vue'
import { eventBus } from './core/event'
import ThemeToggle from './components/ui/ThemeToggle.vue'
import { moduleRegistry } from './modules/ModuleRegistry'

const currentModule = ref(null)
const currentModuleId = ref('home')
const searchQuery = ref('')

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
  'file-manager': defineAsyncComponent(() => import('./modules/file-manager/index.ts')),
  'text-editor': defineAsyncComponent(() => import('./modules/text-editor/index.ts')),
  'calculator': defineAsyncComponent(() => import('./modules/calculator/index.ts')),
  'color-picker': defineAsyncComponent(() => import('./modules/color-picker/index.ts')),
  'json-tool': defineAsyncComponent(() => import('./modules/json-tool/index.ts')),
  'base64-tool': defineAsyncComponent(() => import('./modules/base64-tool/index.ts')),
  'url-tool': defineAsyncComponent(() => import('./modules/url-tool/index.ts')),
  'qrcode': defineAsyncComponent(() => import('./modules/qrcode/index.ts')),
  'semantic-request': defineAsyncComponent(() => import('./modules/semantic-request/index.ts')),
  'xunfei-semantic-request': defineAsyncComponent(() => import('./modules/xunfei-semantic-request/index.ts'))
}

const switchToTab = async (moduleId) => {
  if (currentModuleId.value === moduleId) return
  
  const previousId = currentModuleId.value
  
  if (previousId !== 'home') {
    eventBus.emit('module:closed', { id: previousId })
  }
  
  if (moduleId === 'home') {
    currentModule.value = null
    currentModuleId.value = 'home'
  } else {
    currentModuleId.value = moduleId
    await new Promise(resolve => setTimeout(resolve, 100))
    currentModule.value = moduleComponents[moduleId]
    eventBus.emit('module:opened', { id: moduleId })
  }
}

onMounted(() => {
  console.log('梧桐工具箱已启动 - 8个实用工具')
})
</script>
