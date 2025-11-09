<template>
  <div class="plugin-store p-6">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">🔌 插件商店</h2>
      <p class="text-gray-600">浏览、安装和管理插件</p>

      <!-- 搜索栏 -->
      <div class="mt-4 flex gap-4">
        <div class="relative flex-1">
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
            placeholder="搜索插件..."
            class="search-input pl-10"
          />
        </div>
        <button @click="refreshStore" class="btn-primary">
          <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          刷新
        </button>
      </div>

      <!-- 筛选器 -->
      <div class="mt-4 flex gap-2">
        <button
          v-for="filter in filters"
          :key="filter"
          @click="activeFilter = filter"
          :class="[
            'px-4 py-2 rounded-lg transition-colors',
            activeFilter === filter
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          ]"
        >
          {{ filter }}
        </button>
      </div>
    </div>

    <!-- 插件网格 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="plugin in filteredPlugins"
        :key="plugin.id"
        class="card hover:shadow-xl transition-shadow"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="text-4xl">{{ plugin.icon }}</div>
          <span
            :class="[
              'px-2 py-1 rounded text-xs font-semibold',
              getStatusColor(plugin.status)
            ]"
          >
            {{ getStatusText(plugin.status) }}
          </span>
        </div>

        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
          {{ plugin.name }}
        </h3>

        <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {{ plugin.description }}
        </p>

        <div class="flex items-center gap-2 mb-3 text-sm text-gray-500">
          <span>v{{ plugin.version }}</span>
          <span>•</span>
          <span>{{ plugin.author }}</span>
        </div>

        <div class="mb-4">
          <div class="flex items-center gap-2 mb-2">
            <div class="flex">
              <svg
                v-for="i in 5"
                :key="i"
                class="h-4 w-4"
                :class="i <= plugin.rating ? 'text-yellow-400' : 'text-gray-300'"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <span class="text-sm text-gray-500">{{ plugin.rating.toFixed(1) }}</span>
            <span class="text-sm text-gray-500">({{ plugin.downloads }} 下载)</span>
          </div>

          <div class="flex flex-wrap gap-1">
            <span
              v-for="tag in plugin.tags"
              :key="tag"
              class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
            >
              {{ tag }}
            </span>
          </div>
        </div>

        <div class="flex gap-2">
          <button
            v-if="plugin.status === 'available'"
            @click="installPlugin(plugin)"
            class="flex-1 btn-primary"
          >
            安装
          </button>
          <button
            v-else-if="plugin.status === 'installed'"
            @click="uninstallPlugin(plugin)"
            class="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
          >
            卸载
          </button>
          <button
            v-else-if="plugin.status === 'update'"
            @click="updatePlugin(plugin)"
            class="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
          >
            更新
          </button>
          <button
            v-if="plugin.status === 'installed'"
            @click="configurePlugin(plugin)"
            class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            配置
          </button>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-gray-600">加载中...</p>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && filteredPlugins.length === 0" class="text-center py-12">
      <div class="text-6xl mb-4">🔍</div>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        未找到插件
      </h3>
      <p class="text-gray-600 dark:text-gray-400">
        请尝试其他搜索词或筛选条件
      </p>
    </div>

    <!-- 配置模态框 -->
    <div
      v-if="showConfigModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showConfigModal = false"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold mb-4">配置插件</h3>
        <div v-if="selectedPlugin">
          <div class="space-y-4">
            <div
              v-for="(field, key) in selectedPlugin.configSchema"
              :key="key"
            >
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {{ field.description || key }}
                <span v-if="field.required" class="text-red-500">*</span>
              </label>
              <input
                v-if="field.type === 'string'"
                v-model="pluginConfig[key]"
                type="text"
                class="input-field"
                :placeholder="field.default"
              />
              <input
                v-else-if="field.type === 'number'"
                v-model.number="pluginConfig[key]"
                type="number"
                class="input-field"
                :placeholder="field.default"
              />
              <input
                v-else-if="field.type === 'boolean'"
                v-model="pluginConfig[key]"
                type="checkbox"
                class="rounded"
              />
              <select
                v-else-if="field.type === 'string' && field.options"
                v-model="pluginConfig[key]"
                class="input-field"
              >
                <option v-for="option in field.options" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
            </div>
          </div>
          <div class="flex gap-2 mt-6">
            <button @click="savePluginConfig" class="flex-1 btn-primary">
              保存
            </button>
            <button @click="showConfigModal = false" class="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { pluginManager } from '../core/plugin'

const searchQuery = ref('')
const activeFilter = ref('全部')
const loading = ref(false)
const showConfigModal = ref(false)
const selectedPlugin = ref(null)
const pluginConfig = ref({})

const filters = ['全部', '已安装', '可更新', '推荐', '热门']

// 模拟插件数据
const plugins = ref([
  {
    id: 'example-plugin',
    name: '示例插件 - 记事本',
    description: '展示插件 API 使用方法的示例插件',
    icon: '📝',
    version: '1.0.0',
    author: '梧桐工具箱团队',
    status: 'installed',
    rating: 4.5,
    downloads: 1234,
    tags: ['示例', '教育', '入门'],
    configSchema: {
      autoSave: {
        type: 'boolean',
        default: false,
        description: '自动保存',
        required: false
      },
      fontSize: {
        type: 'number',
        default: 14,
        description: '字体大小',
        required: false
      }
    }
  },
  {
    id: 'markdown-preview',
    name: 'Markdown 预览',
    description: '实时预览 Markdown 文档',
    icon: '📄',
    version: '1.2.0',
    author: '社区开发者',
    status: 'available',
    rating: 4.8,
    downloads: 5678,
    tags: ['文档', '编辑', 'Markdown'],
    configSchema: {}
  },
  {
    id: 'image-compressor',
    name: '图片压缩器',
    description: '压缩图片文件以节省空间',
    icon: '🖼️',
    version: '2.0.1',
    author: '图片工具团队',
    status: 'update',
    rating: 4.3,
    downloads: 8901,
    tags: ['图片', '压缩', '优化'],
    configSchema: {
      quality: {
        type: 'number',
        default: 80,
        description: '压缩质量',
        required: false
      }
    }
  }
])

const filteredPlugins = computed(() => {
  let result = plugins.value

  // 按搜索词过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  // 按状态过滤
  if (activeFilter.value !== '全部') {
    const statusMap = {
      '已安装': 'installed',
      '可更新': 'update',
      '推荐': 'recommended',
      '热门': 'popular'
    }
    const status = statusMap[activeFilter.value]
    if (status) {
      if (status === 'recommended') {
        result = result.filter(p => p.rating >= 4.5)
      } else if (status === 'popular') {
        result = result.filter(p => p.downloads >= 5000)
      } else {
        result = result.filter(p => p.status === status)
      }
    }
  }

  return result
})

const getStatusColor = (status) => {
  const colors = {
    available: 'bg-green-100 text-green-800',
    installed: 'bg-blue-100 text-blue-800',
    update: 'bg-yellow-100 text-yellow-800',
    disabled: 'bg-gray-100 text-gray-800'
  }
  return colors[status] || colors.available
}

const getStatusText = (status) => {
  const texts = {
    available: '可安装',
    installed: '已安装',
    update: '可更新',
    disabled: '已禁用'
  }
  return texts[status] || '未知'
}

const refreshStore = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 1000)
}

const installPlugin = (plugin) => {
  plugin.status = 'installed'
  // 这里可以调用实际的安装逻辑
  console.log('安装插件:', plugin.id)
}

const uninstallPlugin = (plugin) => {
  plugin.status = 'available'
  console.log('卸载插件:', plugin.id)
}

const updatePlugin = (plugin) => {
  // 模拟更新
  const currentVersion = plugin.version.split('.').map(Number)
  currentVersion[2]++
  plugin.version = currentVersion.join('.')
  plugin.status = 'installed'
  console.log('更新插件:', plugin.id)
}

const configurePlugin = (plugin) => {
  selectedPlugin.value = plugin
  pluginConfig.value = {}
  if (plugin.configSchema) {
    Object.entries(plugin.configSchema).forEach(([key, field]) => {
      pluginConfig.value[key] = field.default
    })
  }
  showConfigModal.value = true
}

const savePluginConfig = () => {
  console.log('保存配置:', selectedPlugin.value.id, pluginConfig.value)
  showConfigModal.value = false
}

onMounted(() => {
  console.log('插件商店已加载')
})
</script>
