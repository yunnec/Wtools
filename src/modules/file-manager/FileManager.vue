<template>
  <div class="file-manager p-6">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">文件管理器</h2>

      <!-- 工具栏 -->
      <div class="flex gap-2 mb-4">
        <button
          @click="goUp"
          class="btn-primary"
          :disabled="currentPath === '/'"
        >
          上级目录
        </button>
        <button @click="refresh" class="btn-primary">
          刷新
        </button>
        <input
          v-model="currentPath"
          class="input-field flex-1"
          readonly
        />
      </div>
    </div>

    <!-- 文件列表 -->
    <div class="bg-white rounded-lg shadow">
      <div v-if="loading" class="p-8 text-center text-gray-500">
        加载中...
      </div>

      <div v-else-if="error" class="p-8 text-center text-red-500">
        {{ error }}
      </div>

      <div v-else class="divide-y">
        <div
          v-for="file in files"
          :key="file.path"
          @click="handleFileClick(file)"
          class="p-4 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
        >
          <div class="flex items-center gap-3">
            <span class="text-2xl">
              {{ file.isDirectory ? '📁' : '📄' }}
            </span>
            <div>
              <div class="font-medium text-gray-900">{{ file.name }}</div>
              <div class="text-sm text-gray-500">
                {{ file.isDirectory ? '文件夹' : formatFileSize(file.size) }}
              </div>
            </div>
          </div>
          <div class="text-sm text-gray-500">
            {{ file.modifiedTime }}
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && !error && files.length === 0" class="text-center py-12 text-gray-500">
      当前目录为空
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { eventBus } from '../../core/event'

const currentPath = ref('/')
const files = ref([])
const loading = ref(false)
const error = ref('')

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const fetchFiles = async () => {
  loading.value = true
  error.value = ''

  try {
    // TODO: 使用Tauri文件API
    // 模拟数据
    setTimeout(() => {
      files.value = [
        {
          name: 'Documents',
          path: '/Documents',
          isDirectory: true,
          size: 0,
          modifiedTime: '2024-01-01'
        },
        {
          name: 'Pictures',
          path: '/Pictures',
          isDirectory: true,
          size: 0,
          modifiedTime: '2024-01-01'
        },
        {
          name: 'readme.txt',
          path: '/readme.txt',
          isDirectory: false,
          size: 1024,
          modifiedTime: '2024-01-01'
        }
      ]
      loading.value = false
    }, 500)
  } catch (err) {
    error.value = err.message || '加载文件列表失败'
    loading.value = false
  }
}

const goUp = () => {
  if (currentPath.value === '/') return
  const parts = currentPath.value.split('/')
  parts.pop()
  currentPath.value = parts.join('/') || '/'
  fetchFiles()
}

const refresh = () => {
  fetchFiles()
}

const handleFileClick = (file) => {
  if (file.isDirectory) {
    currentPath.value = file.path
    fetchFiles()
  } else {
    // TODO: 打开文件
    eventBus.emit('file:open', { path: file.path })
  }
}

onMounted(() => {
  fetchFiles()
})
</script>
