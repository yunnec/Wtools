<template>
  <div class="semantic-request p-6">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">自研语义请求</h2>
      <div class="flex gap-2">
        <button @click="sendRequest" class="btn-primary" :disabled="!queryText || loading">
          {{ loading ? '发送中...' : '发送请求' }}
        </button>
        <button @click="clearAll" class="btn-primary">清空</button>
        <button @click="clearResult" class="btn-primary" :disabled="!result">清空结果</button>
      </div>
    </div>

    <!-- 双栏布局 -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[calc(100vh-12rem)]">
      <!-- 左侧：输入、配置和历史记录（占2列） -->
      <div class="lg:col-span-2 flex flex-col space-y-4 h-full">
        <!-- 输入区域 -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-3">查询输入</h3>
          <textarea
            v-model="queryText"
            class="w-full h-24 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            placeholder="请输入要查询的语义文本..."
            @keydown="handleKeydown"
          ></textarea>
          <div class="mt-2 text-sm text-gray-600 flex justify-between">
            <span>字符数: {{ queryText.length }}</span>
            <span class="text-xs text-gray-500">Enter 发送 | Ctrl+Enter 换行</span>
          </div>
        </div>

        <!-- API配置信息 -->
        <div class="card bg-blue-50 dark:bg-blue-900/20">
          <h3 class="text-lg font-semibold mb-2 text-blue-900 dark:text-blue-100">API配置</h3>
          <div class="space-y-2 text-sm font-mono">
            <div>
              <span class="text-gray-600 dark:text-gray-400">应用ID:</span>
              <div class="mt-1">
                <select
                  v-model="selectedAppId"
                  class="w-full px-3 py-2 border border-gray-300 rounded bg-white dark:bg-gray-800 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option v-for="option in appIdOptions" :key="option.id" :value="option.id">
                    {{ option.name }} ({{ option.id.substring(0, 8) }}...)
                  </option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <span class="text-gray-600 dark:text-gray-400">用户ID:</span>
                <div class="mt-1 break-all text-xs">{{ apiConfig.userId }}</div>
              </div>
              <div>
                <span class="text-gray-600 dark:text-gray-400">版本:</span>
                <div class="mt-1">{{ apiConfig.version }}</div>
              </div>
            </div>
            <div>
              <span class="text-gray-600 dark:text-gray-400">服务地址:</span>
              <div class="mt-1 break-all text-xs">{{ apiConfig.tinnoveAiUrl }}</div>
            </div>
          </div>
        </div>

        <!-- 历史记录 -->
        <div class="card flex-1 flex flex-col overflow-hidden min-h-0">
          <h3 class="text-lg font-semibold mb-3">历史记录</h3>
          <div v-if="history.length > 0" class="flex-1 overflow-y-auto space-y-2 pr-2">
            <div
              v-for="(item, index) in history"
              :key="index"
              class="p-3 bg-gray-50 dark:bg-gray-800 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              @click="loadFromHistory(item)"
            >
              <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {{ new Date(item.timestamp).toLocaleString() }}
              </div>
              <div class="text-sm font-mono mb-1 line-clamp-2">
                {{ item.query }}
              </div>
              <div class="flex items-center justify-between text-xs text-gray-500">
                <span>响应: {{ item.duration }}ms</span>
                <span class="text-blue-500">点击加载</span>
              </div>
            </div>
          </div>
          <div v-else class="flex-1 flex items-center justify-center text-gray-400 text-sm">
            暂无历史记录
          </div>
          <button
            v-if="history.length > 0"
            @click="clearHistory"
            class="btn-primary mt-3 w-full"
          >
            清空历史记录
          </button>
        </div>
      </div>

      <!-- 右侧：响应结果（占3列，最大化显示） -->
      <div class="lg:col-span-3 card h-full">
        <h3 class="text-lg font-semibold mb-4">响应结果</h3>
        <div v-if="loading" class="text-center py-20">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <div class="mt-4 text-gray-600">正在发送请求，请稍候...</div>
        </div>
        <div v-else-if="error" class="text-center py-20">
          <div class="text-red-500 text-2xl mb-3">❌</div>
          <div class="text-red-600 mb-2 font-semibold">请求失败</div>
          <div class="text-red-500 text-sm break-words">{{ error }}</div>
        </div>
        <div v-else-if="result" class="h-[calc(100%-3rem)] flex flex-col">
          <div class="flex-1 relative">
            <textarea
              :value="result"
              readonly
              class="w-full h-full p-4 border border-gray-300 rounded bg-gray-50 dark:bg-gray-800 font-mono text-sm resize-none"
              placeholder="结果将在这里显示..."
            ></textarea>
          </div>
          <div class="mt-4 flex items-center justify-between">
            <div class="text-sm text-gray-600">
              <span class="inline-flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                响应时间: {{ responseTime }}ms
              </span>
            </div>
            <button @click="copyResult" class="btn-primary">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
              复制结果
            </button>
          </div>
        </div>
        <div v-else class="text-center py-20 text-gray-400">
          <svg class="w-20 h-20 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <div class="text-lg">暂无结果</div>
          <div class="text-sm mt-2">输入查询文本并发送请求</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { eventBus } from '../../core/event'
import { SemanticModuleStateService } from '../../core/services/SemanticModuleStateService'

// 可选应用ID列表
const appIdOptions = [
  { id: '21pf2gigt3e56lb0jp8ff78wqig0hmuy', name: 'J90K' },
  { id: 'ncnmfjxkw8unsqbghlivhyfp8652rsuk', name: '主线' },
  { id: 'xsp7jms5lkvjrj2kipv7lm290rmjz9hl', name: '318-1' },
  { id: '8dyf26xi9p8rsw1umkv8d6lrj7g0tgyi', name: '857-LS' },
  { id: '5fae58wc2lerxw1iw2mvxvwd38baic3p', name: '236OTA' },
  { id: 'js0y68yxr4k6pvsdpi5mvbpn9w6p26wd', name: '236ICA2OTA' },
  { id: '8kuyqb19zf82m1jymnw41cg1qtdk47vx', name: '928' },
  { id: 'd35014d19e99e200e32132f462885933', name: '928-2' },
  { id: '9b3d4bz5foji1e5b6eebob4zskgj6q81', name: '成组化大模型' },
  { id: 'bjbwuhspda5mv0w3g78qeqsixq8llo5t', name: 'B216高配' }
]

// 默认应用ID - 从localStorage读取或使用默认值
const selectedAppId = ref(localStorage.getItem('semantic-request-appId') || '9b3d4bz5foji1e5b6eebob4zskgj6q81')

// API配置 - 固定参数（除wtAppId外）
const apiConfig = {
  userId: 'test11111123',
  tinnoveAiUrl: 'http://nlu-pf.auto-pai.cn/zp/update',
  version: 'cache'
}

// 响应式数据
const queryText = ref('')
const result = ref('')
const loading = ref(false)
const error = ref('')
const responseTime = ref(0)
const history = ref([])

// 监听应用ID变化，保存到localStorage
watch(selectedAppId, (newId) => {
  localStorage.setItem('semantic-request-appId', newId)
})

// 处理键盘事件：Enter发送，Ctrl+Enter换行
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    if (event.ctrlKey) {
      // Ctrl+Enter：允许换行（默认行为）
      return
    } else {
      // Enter：发送请求
      event.preventDefault()
      sendRequest()
    }
  }
}

// 发送请求
const sendRequest = async () => {
  if (!queryText.value.trim()) {
    error.value = '请输入查询文本'
    return
  }

  loading.value = true
  error.value = ''
  result.value = ''
  const startTime = Date.now()

  try {
    const requestBody = {
      wtAppId: selectedAppId.value,
      ...apiConfig,
      query: queryText.value
    }

    const response = await fetch('https://api.auto-pai.cn/voiceserver/api/v1/tinnove-ai/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    responseTime.value = Date.now() - startTime

    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status} - ${response.statusText}`)
    }

    const data = await response.json()
    result.value = JSON.stringify(data, null, 2)

    // 保存到历史记录
    history.value.unshift({
      query: queryText.value,
      result: result.value,
      timestamp: Date.now(),
      duration: responseTime.value
    })

    // 限制历史记录数量
    if (history.value.length > 30) {
      history.value = history.value.slice(0, 30)
    }

    eventBus.emit('semantic-request:success', {
      query: queryText.value,
      result: data,
      responseTime: responseTime.value
    })
  } catch (err) {
    responseTime.value = Date.now() - startTime
    error.value = err.message || '请求失败，请检查网络连接'
    console.error('语义请求错误:', err)

    eventBus.emit('semantic-request:error', {
      query: queryText.value,
      error: err.message
    })
  } finally {
    loading.value = false
  }
}

// 复制结果到剪贴板
const copyResult = async () => {
  try {
    await navigator.clipboard.writeText(result.value)
    alert('结果已复制到剪贴板')
  } catch (err) {
    console.error('复制失败:', err)
    alert('复制失败，请手动选择复制')
  }
}

// 清空输入和结果
const clearAll = () => {
  queryText.value = ''
  result.value = ''
  error.value = ''
  responseTime.value = 0
}

// 仅清空结果
const clearResult = () => {
  result.value = ''
  error.value = ''
  responseTime.value = 0
}

// 从历史记录加载
const loadFromHistory = (item) => {
  queryText.value = item.query
  result.value = item.result
  error.value = ''
  responseTime.value = item.duration
}

// 清空历史记录
const clearHistory = () => {
  if (confirm('确定要清空所有历史记录吗？')) {
    history.value = []
  }
}

// 保存状态到localStorage
const saveState = () => {
  SemanticModuleStateService.saveState('semantic-request', {
    queryText: queryText.value,
    result: result.value,
    error: error.value,
    responseTime: responseTime.value,
    history: history.value,
    selectedAppId: selectedAppId.value
  })
}

// 从localStorage恢复状态
const restoreState = () => {
  const savedState = SemanticModuleStateService.getState('semantic-request')
  if (savedState) {
    queryText.value = savedState.queryText || ''
    result.value = savedState.result || ''
    error.value = savedState.error || ''
    responseTime.value = savedState.responseTime || 0
    history.value = savedState.history || []
    if (savedState.selectedAppId) {
      selectedAppId.value = savedState.selectedAppId
    }
    console.log('已恢复自研语义请求模块状态')
  }
}

onMounted(() => {
  eventBus.on('semantic-request:open', () => {
    console.log('语义请求模块已打开')
  })

  // 恢复状态
  restoreState()
})

onUnmounted(() => {
  // 保存状态
  saveState()
})
</script>
