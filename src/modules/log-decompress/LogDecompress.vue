<template>
  <div class="log-decompress p-6">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">236日志解压</h2>
      <p class="text-gray-600 dark:text-gray-400">
        自动解密并解压车机日志文件
      </p>
    </div>

    <!-- 开发模式提示 -->
    <div v-if="!isTauri" class="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
      <div class="flex items-start">
        <svg class="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
        </svg>
        <div>
          <h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-200">开发模式提示</h3>
          <p class="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
            您当前在Web开发模式，236日志解压功能需要在Tauri桌面应用中使用。
            请运行 <code class="px-1 py-0.5 bg-yellow-100 dark:bg-yellow-800 rounded text-xs">npm run tauri dev</code> 启动完整的桌面应用。
          </p>
        </div>
      </div>
    </div>

    <!-- 进度显示 -->
    <div v-if="isProcessing" class="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <div class="flex items-center mb-2">
        <svg class="animate-spin h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
        <span class="text-sm font-medium text-blue-800 dark:text-blue-200">{{ progressText }}</span>
      </div>
      <div class="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
        <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" :style="{ width: progressPercent + '%' }"></div>
      </div>
    </div>

    <!-- 错误显示 -->
    <div v-if="errorMessage" class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <div class="flex items-start">
        <svg class="h-5 w-5 text-red-600 dark:text-red-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
        </svg>
        <div>
          <h3 class="text-sm font-medium text-red-800 dark:text-red-200">操作失败</h3>
          <p class="text-sm text-red-700 dark:text-red-300 mt-1 whitespace-pre-line">{{ errorMessage }}</p>
        </div>
      </div>
    </div>

    <!-- 成功结果 -->
    <div v-if="successMessage" class="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
      <div class="flex items-start">
        <svg class="h-5 w-5 text-green-600 dark:text-green-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        <div>
          <h3 class="text-sm font-medium text-green-800 dark:text-green-200">操作成功</h3>
          <p class="text-sm text-green-700 dark:text-green-300 mt-1 whitespace-pre-line">{{ successMessage }}</p>
        </div>
      </div>
    </div>

    <!-- 文件选择区域 -->
    <div class="mb-6">
      <div
        @drop="handleDrop"
        @dragover.prevent
        @dragenter="dragActive = true"
        @dragleave="dragActive = false"
        :class="dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'"
        class="border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer hover:border-blue-400 dark:hover:border-blue-500"
        @click="triggerFileSelect"
      >
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
        </svg>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          <span class="font-medium text-blue-600 dark:text-blue-400">点击选择</span>
          或
          <span class="font-medium text-blue-600 dark:text-blue-400">拖拽文件</span>
          到此区域
        </p>
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-500">
          支持 .gz, .tar.gz, .dat, .log, .enc 等加密日志文件
        </p>
      </div>
    </div>

    <!-- 选中的文件信息 -->
    <div v-if="selectedFile" class="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">选中的文件</h3>
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <p class="text-sm text-gray-700 dark:text-gray-300">{{ selectedFile.name }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-500">
            {{ formatFileSize(selectedFile.size) }}
          </p>
        </div>
        <button
          @click="clearSelection"
          class="ml-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="flex items-center gap-4">
      <button
        @click="startDecompression"
        :disabled="!selectedFile || isProcessing || !isTauri"
        class="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
      >
        <svg
          v-if="isProcessing"
          class="animate-spin h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
        <span v-else>▶</span>
        {{ isTauri ? '开始解压' : '演示模式' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const isTauri = ref(false)
const isProcessing = ref(false)
const progressText = ref('')
const progressPercent = ref(0)
const errorMessage = ref('')
const successMessage = ref('')
const selectedFile = ref<File | null>(null)
const dragActive = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

onMounted(() => {
  checkTauri()
})

const checkTauri = async () => {
  try {
    // 检查是否在Tauri环境中运行
    // 方法1: 检查window对象
    const isTauriWindow = typeof (window as any).__TAURI__ !== 'undefined'
    if (isTauriWindow) {
      isTauri.value = true
      return
    }

    // 方法2: 尝试导入Tauri API
    const { invoke } = await import('@tauri-apps/api/core')
    await invoke('decompress_236_log', {
      encryptedFilePath: '',
      outputDir: null
    })
    isTauri.value = true
  } catch (error) {
    console.warn('Tauri环境检测失败:', error)
    isTauri.value = false
  }
}

const triggerFileSelect = async () => {
  if (!isTauri.value || isProcessing.value) return

  try {
    // 使用Rust的文件选择API
    const { invoke } = await import('@tauri-apps/api/core')
    const filePath = await invoke<string | null>('open_file_dialog', { filters: null })

    if (filePath) {
      const fileName = filePath.split(/[\\/]/).pop() || 'unknown'

      // @ts-ignore - 创建带路径信息的文件对象
      selectedFile.value = {
        name: fileName,
        path: filePath,
        size: 0, // 未知大小
        type: 'application/gzip'
      } as any

      errorMessage.value = ''
      successMessage.value = ''

      console.log('[236解压] 选择的文件:', filePath)
    }
  } catch (error) {
    console.warn('文件选择取消:', error)
  }
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    selectedFile.value = file
    errorMessage.value = ''
    successMessage.value = ''
  }
}

const handleDrop = async (event: DragEvent) => {
  event.preventDefault()
  dragActive.value = false

  if (!isTauri.value || isProcessing.value) return

  const files = event.dataTransfer?.files
  if (!files || files.length === 0) return

  const file = files[0]
  if (file) {
    // 提示用户使用文件对话框选择相同文件
    successMessage.value = `已检测到拖拽文件: ${file.name}\n\n请点击"点击选择"按钮从文件系统中选择该文件。`
    console.log('[236解压] 拖拽文件:', file.name)
  }
}

const clearSelection = () => {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const startDecompression = async () => {
  if (!selectedFile.value || !isTauri.value || isProcessing.value) return

  try {
    isProcessing.value = true
    errorMessage.value = ''
    successMessage.value = ''
    progressPercent.value = 0

    progressText.value = '准备文件...'
    progressPercent.value = 10

    const filePath = selectedFile.value.path || selectedFile.value.name
    progressText.value = '正在解密文件...'
    progressPercent.value = 30

    const { invoke } = await import('@tauri-apps/api/core')

    progressText.value = '处理中...'
    progressPercent.value = 60

    const result = await invoke('decompress_236_log', {
      encryptedFilePath: filePath,
      outputDir: null
    })

    progressText.value = '清理临时文件...'
    progressPercent.value = 90

    successMessage.value = result as string
    progressPercent.value = 100
    progressText.value = '完成'

  } catch (error) {
    console.error('解压错误:', error)
    errorMessage.value = error instanceof Error ? error.message : '未知错误'
  } finally {
    isProcessing.value = false
  }
}
</script>
