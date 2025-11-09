<template>
  <div id="app" class="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors">
    <header class="bg-white dark:bg-dark-card shadow-sm transition-colors">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center gap-4">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">梧桐工具箱</h1>
            <button v-if="currentModule" @click="closeModule" class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
              ← 返回主页
            </button>
            <span v-if="currentModule" class="text-sm text-gray-500 dark:text-gray-400">
              {{ getCurrentModuleName() }}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <!-- 主页模块选择 -->
      <div v-if="!currentModule">
        <div class="mb-6">
          <h2 class="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">选择工具</h2>
          <p class="text-gray-600 dark:text-gray-400 mb-4">点击下方卡片打开对应工具</p>

          <!-- 搜索框 -->
          <div class="relative">
            <svg
              class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索工具..."
              class="search-input"
            />
          </div>
        </div>

        <!-- 搜索结果提示 -->
        <div v-if="searchQuery && filteredModules.length === 0" class="card text-center py-12">
          <div class="text-4xl mb-4">🔍</div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">未找到匹配的工具</h3>
          <p class="text-gray-600 dark:text-gray-400">请尝试其他关键词</p>
        </div>

        <!-- 按分类显示模块 -->
        <div v-if="!searchQuery">
          <div v-for="(modules, category) in modulesByCategory" :key="category" class="mb-8">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              {{ getCategoryName(category) }}
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              <div
                v-for="module in modules"
                :key="module.id"
                class="card hover:shadow-lg dark:hover:shadow-xl transform hover:-translate-y-1 transition-all cursor-pointer"
                @click="openModule(module.id)"
              >
                <div class="flex flex-col items-center text-center">
                  <span class="text-4xl mb-3">{{ module.icon }}</span>
                  <h2 class="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">{{ module.name }}</h2>
                  <p class="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-1">{{ module.description }}</p>
                  <button class="btn-primary w-full">打开</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 搜索结果 -->
        <div v-else>
          <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            搜索结果 ({{ filteredModules.length }})
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            <div
              v-for="module in filteredModules"
              :key="module.id"
              class="card hover:shadow-lg dark:hover:shadow-xl transform hover:-translate-y-1 transition-all cursor-pointer"
              @click="openModule(module.id)"
            >
              <div class="flex flex-col items-center text-center">
                <span class="text-4xl mb-3">{{ module.icon }}</span>
                <h2 class="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">{{ module.name }}</h2>
                <p class="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-1">{{ module.description }}</p>
                <button class="btn-primary w-full">打开</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 模块内容 -->
      <div v-else>
        <component :is="currentModule" />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { defineAsyncComponent } from 'vue'
import { eventBus } from './core/event'
import { pluginManager } from './core/plugin'
import { themeService } from './core/theme'
import ThemeToggle from './components/ui/ThemeToggle.vue'
import { moduleRegistry } from './modules/ModuleRegistry'

const currentModule = ref(null)
const currentModuleId = ref(null)
const searchQuery = ref('')

// 搜索过滤
const filteredModules = computed(() => {
  if (!searchQuery.value) return []
  const query = searchQuery.value.toLowerCase()
  return moduleRegistry.filter(module =>
    module.name.toLowerCase().includes(query) ||
    module.description.toLowerCase().includes(query) ||
    module.category.toLowerCase().includes(query)
  )
})

const modulesByCategory = computed(() => {
  if (searchQuery.value) return {}
  const categories = {}
  moduleRegistry.forEach(module => {
    if (!categories[module.category]) {
      categories[module.category] = []
    }
    categories[module.category].push(module)
  })
  return categories
})

const getCategoryName = (category) => {
  const names = {
    file: '📁 文件工具',
    text: '✏️ 文本工具',
    calc: '🧮 计算工具',
    convert: '🔄 转换工具',
    image: '🎨 图像工具',
    other: '🛠️ 其他工具'
  }
  return names[category] || category
}

const moduleComponents = {
  'file-manager': defineAsyncComponent(() => import('./modules/file-manager/index.ts')),
  'text-editor': defineAsyncComponent(() => import('./modules/text-editor/index.ts')),
  'calculator': defineAsyncComponent(() => import('./modules/calculator/index.ts')),
  'color-picker': defineAsyncComponent(() => import('./modules/color-picker/index.ts')),
  'json-tool': defineAsyncComponent(() => import('./modules/json-tool/index.ts')),
  'base64-tool': defineAsyncComponent(() => import('./modules/base64-tool/index.ts')),
  'url-tool': defineAsyncComponent(() => import('./modules/url-tool/index.ts')),
  'qrcode': defineAsyncComponent(() => import('./modules/qrcode/index.ts')),
  'example-plugin': defineAsyncComponent(() => import('./modules/example-plugin/index.ts')),
  'plugin-store': defineAsyncComponent(() => import('./components/PluginStore.vue'))
}

const openModule = async (moduleId) => {
  try {
    console.log(`Opening module: ${moduleId}`)
    currentModuleId.value = moduleId

    eventBus.emit('plugin:load', moduleId)
    await new Promise(resolve => setTimeout(resolve, 100))

    currentModule.value = moduleComponents[moduleId]
    eventBus.emit('module:opened', { id: moduleId })
    searchQuery.value = ''
  } catch (error) {
    console.error('打开模块失败:', error)
    alert('打开模块失败: ' + error.message)
  }
}

const closeModule = () => {
  if (currentModule.value && currentModuleId.value) {
    eventBus.emit('module:closed', { id: currentModuleId.value })
  }
  currentModule.value = null
  currentModuleId.value = null
}

const getCurrentModuleName = () => {
  if (!currentModuleId.value) return ''
  const module = moduleRegistry.find(m => m.id === currentModuleId.value)
  return module ? module.name : ''
}

// 快捷键处理
const handleKeydown = (e) => {
  // Esc 返回主页
  if (e.key === 'Escape' && currentModule.value) {
    closeModule()
  }
  // Ctrl/Cmd + K 打开搜索
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    const searchInput = document.querySelector('.search-input')
    if (searchInput) {
      searchInput.focus()
    }
  }
}

onMounted(() => {
  console.log('梧桐工具箱已启动 - 支持主题切换和搜索')

  eventBus.on('app:ready', () => {
    console.log('应用已就绪')
  })

  eventBus.on('plugin:loaded', ({ id, meta }) => {
    console.log(`模块已加载: ${meta.name}`)
  })

  eventBus.on('plugin:error', ({ id, error }) => {
    console.error(`模块错误: ${id}`, error)
  })

  // 监听主题变更
  eventBus.on('theme:changed', (theme) => {
    console.log('主题已切换:', theme)
  })

  // 添加键盘事件监听
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>
