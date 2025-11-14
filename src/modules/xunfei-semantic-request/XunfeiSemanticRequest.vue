<template>
  <div class="xunfei-semantic-request p-6">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">讯飞语义请求</h2>
      <div class="flex gap-2 flex-wrap">
        <button @click="sendQuery" class="btn-primary" :disabled="!isConnected || !queryText || loading">
          {{ loading ? '查询中...' : '发送语义查询' }}
        </button>
        <button @click="clearAll" class="btn-primary">清空</button>
        <button @click="clearResult" class="btn-primary" :disabled="!result">清空结果</button>
        <button v-if="connectionState === 'error' || connectionState === 'disconnected'" @click="autoConnect" class="btn-primary bg-red-500 hover:bg-red-600">
          {{ connectionState === 'disconnected' ? '重新连接' : '重连' }}
        </button>
      </div>
    </div>

    <!-- 连接状态指示 -->
    <div class="mb-4">
      <div class="flex items-center gap-2 p-3 rounded-lg"
           :class="{
             'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300': connectionState === 'connected',
             'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300': connectionState === 'connecting' || connectionState === 'reconnecting',
             'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300': connectionState === 'error',
             'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400': connectionState === 'disconnected'
           }">
        <span class="text-2xl">
          <span v-if="connectionState === 'connected'">✅</span>
          <span v-else-if="connectionState === 'connecting' || connectionState === 'reconnecting'">⏳</span>
          <span v-else-if="connectionState === 'error'">❌</span>
          <span v-else>⚪</span>
        </span>
        <div class="flex-1">
          <div class="font-medium">
            {{ getStateDescription() }}
            <span v-if="isConnected" class="text-xs text-green-600 ml-2">● 实时连接</span>
          </div>
          <div v-if="reconnectAttempts > 0" class="text-sm">
            重连次数: {{ reconnectAttempts }}
          </div>
          <div v-if="isConnected" class="text-xs text-gray-500 mt-1">
            连接正常，可直接发送查询
          </div>
          <div v-else-if="connectionState === 'disconnected'" class="text-xs text-gray-500 mt-1">
            连接已断开，请点击右侧按钮重新连接
          </div>
        </div>
        <div class="flex items-center gap-2">
          <div v-if="error" class="text-sm text-red-600 dark:text-red-400">
            {{ error }}
          </div>
          <div v-if="success && !error" class="text-sm text-green-600 dark:text-green-400">
            {{ success }}
          </div>
          <button
            v-if="connectionState === 'error' || connectionState === 'disconnected'"
            @click="autoConnect"
            :disabled="connecting"
            class="btn-primary text-sm py-1 px-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-300"
          >
            {{ connecting ? '连接中...' : '重新连接' }}
          </button>
        </div>
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
            ref="queryInputRef"
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

        <!-- 转换服务配置 -->
        <div class="card bg-green-50 dark:bg-green-900/20">
          <h3 class="text-lg font-semibold mb-2 text-green-900 dark:text-green-100">转换服务配置</h3>
          <div class="space-y-2 text-sm">
            <div>
              <span class="text-gray-600 dark:text-gray-400">应用ID选择:</span>
              <div class="mt-1">
                <select
                  v-model="selectedConvertAppId"
                  class="w-full px-3 py-2 border border-gray-300 rounded bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option v-for="option in appIdOptions" :key="option.id" :value="option.id">
                    {{ option.name }} ({{ option.id.substring(0, 8) }}...)
                  </option>
                </select>
              </div>
            </div>
            <div class="text-xs text-gray-500">
              💡 选择要使用的转换服务应用ID
            </div>
          </div>
        </div>

        <!-- WebSocket配置信息（只读） -->
        <div class="card bg-blue-50 dark:bg-blue-900/20">
          <h3 class="text-lg font-semibold mb-2 text-blue-900 dark:text-blue-100">WebSocket配置</h3>
          <div class="space-y-2 text-sm font-mono">
            <div>
              <span class="text-gray-600 dark:text-gray-400">应用ID (appId):</span>
              <div class="mt-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono">
                {{ appId }}
              </div>
            </div>
            <div>
              <span class="text-gray-600 dark:text-gray-400">API密钥 (APIKey):</span>
              <div class="mt-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono">
                {{ apiKey.substring(0, 10) }}...
              </div>
            </div>
            <div>
              <span class="text-gray-600 dark:text-gray-400">认证ID (authId):</span>
              <div class="mt-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono">
                {{ authId }}
              </div>
            </div>
            <div class="mt-3 text-xs text-gray-500">
              💡 WebSocket配置已固定，无需修改
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
              <div class="flex items-center justify-between text-xs">
                <span :class="{
                  'text-green-600': item.status === 'success',
                  'text-red-600': item.status === 'error',
                  'text-yellow-600': item.status === 'timeout'
                }">
                  {{ item.status === 'success' ? '成功' : item.status === 'error' ? '失败' : '超时' }}
                </span>
                <span class="text-gray-500">响应: {{ item.duration }}ms</span>
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
      <div class="lg:col-span-3 flex flex-col h-full">
        <div class="card flex-1 flex flex-col overflow-hidden min-h-0">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-lg font-semibold">响应结果</h3>
            <div v-if="result" class="flex gap-2">
              <button @click="copyResult" class="btn-primary text-sm py-1 px-3">
                复制结果
              </button>
              <button @click="downloadResult" class="btn-primary text-sm py-1 px-3">
                下载JSON
              </button>
            </div>
          </div>

          <div v-if="loading" class="flex-1 flex items-center justify-center">
            <div class="text-center">
              <div class="text-4xl mb-4">⏳</div>
              <div class="text-gray-600">正在处理请求...</div>
              <div class="text-sm text-gray-500 mt-2">
                连接状态: {{ getStateDescription() }}
              </div>
            </div>
          </div>

          <div v-else-if="error" class="flex-1 flex items-center justify-center">
            <div class="text-center">
              <div class="text-4xl mb-4">❌</div>
              <div class="text-red-600 mb-2">发生错误</div>
              <div class="text-sm text-gray-600">{{ error }}</div>
            </div>
          </div>

          <div v-else-if="result" class="flex-1 overflow-y-auto pr-2">
            <div class="space-y-4">
              <!-- 当前查询 -->
              <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div class="text-sm text-blue-600 dark:text-blue-300 mb-2">当前查询</div>
                <div class="font-mono text-sm">{{ currentQuery }}</div>
              </div>

              <!-- 响应内容 -->
              <div>
                <div class="text-sm text-gray-600 mb-2">响应内容 ({{ responseCount }}条消息)</div>
                <pre class="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono overflow-x-auto whitespace-pre-wrap">{{
                  formattedResult
                }}</pre>
              </div>

              <!-- 统计信息 -->
              <div class="grid grid-cols-3 gap-4">
                <div class="bg-gray-50 dark:bg-gray-800 p-3 rounded text-center">
                  <div class="text-2xl font-bold text-blue-600">{{ result.duration }}ms</div>
                  <div class="text-sm text-gray-600">响应时间</div>
                </div>
                <div class="bg-gray-50 dark:bg-gray-800 p-3 rounded text-center">
                  <div class="text-2xl font-bold text-green-600">{{ responseCount }}</div>
                  <div class="text-sm text-gray-600">消息数量</div>
                </div>
                <div class="bg-gray-50 dark:bg-gray-800 p-3 rounded text-center">
                  <div class="text-2xl font-bold text-purple-600">{{ characterCount }}</div>
                  <div class="text-sm text-gray-600">字符数</div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="flex-1 flex items-center justify-center text-gray-400">
            <div class="text-center">
              <div class="text-4xl mb-4">📝</div>
              <div>请先建立连接并发送查询</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { eventBus } from '../../core/event'
import { XunfeiApiService, type HistoryRecord, type WebSocketConnectionState, type WebSocketMessage } from './services/xunfei-api.service'
import { SemanticModuleStateService } from '../../core/services/SemanticModuleStateService'
import { toastService } from '../../core/services/ToastService'

// 响应式数据
const queryText = ref('')
const currentQuery = ref('')
const result = ref<any>(null)
const loading = ref(false)
const error = ref('')
const success = ref('')

// 转换服务appId选项
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

// 默认转换服务appId
const selectedConvertAppId = ref(localStorage.getItem('xunfei-convert-appId') || '9b3d4bz5foji1e5b6eebob4zskgj6q81')

// 输入框引用
const queryInputRef = ref<HTMLTextAreaElement | null>(null)

// WebSocket相关状态
const connectionState = ref<WebSocketConnectionState>('disconnected')
const isConnected = ref(false)
const connecting = ref(false)
const reconnectAttempts = ref(0)

// WebSocket API配置
const appId = ref('d97460e4')
const apiKey = ref('33efdde7d2f0d9ea0cd86f4ebb10935e')
const authId = ref('wttest110322b327287039cd92b4c51n')
const dataType = ref('text')
const interactMode = ref('continuous')
const resultLevel = ref('complete')
const scene = ref('main')

// 转换服务配置（使用完全不同的变量名避免冲突）
const convertEndpoint = ref('https://voice.auto-pai.cn/voice-cloud/admin/app/command/manager/convert/test')
const convertToken = ref('f5b13aca-ff50-49dc-9e73-f3543b9947a9')

// 历史记录
const history = ref<HistoryRecord[]>([])

// API服务实例
let apiService: XunfeiApiService | null = null

// 计算属性
const formattedResult = computed(() => {
  if (!result.value) return ''

  console.log('[formattedResult] result.value结构:', result.value)
  console.log('[formattedResult] result.value类型:', typeof result.value)
  console.log('[formattedResult] result.value是否为数组:', Array.isArray(result.value))

  // 如果结果是对象且包含convert字段，优先显示转换结果
  if (typeof result.value === 'object' && result.value !== null) {
    // 检查是否有转换结果
    if ('convert' in result.value) {

      // 特殊处理：转换结果中的data字段
      if (result.value.convert.data) {
        const dataStr = result.value.convert.data as string

        try {
          // 尝试解析data中的JSON字符串
          const parsedData = JSON.parse(dataStr)
          return JSON.stringify(parsedData, null, 2)
        } catch (error) {
          // 如果解析失败，直接显示原始字符串
          return dataStr
        }
      }

      return JSON.stringify(result.value.convert, null, 2)
    }
    // 如果有语义结果数组
    else if ('semantic' in result.value && Array.isArray(result.value.semantic)) {
        return result.value.semantic.map((msg: any) => {
        if (typeof msg === 'object' && msg !== null && 'content' in msg) {
          return msg.content as string
        }
        return JSON.stringify(msg, null, 2)
      }).join('\n\n')
    }
  }

  // 如果是数组，直接显示
  if (Array.isArray(result.value)) {
    return result.value.map(msg => {
      if (typeof msg === 'object' && msg !== null && 'content' in msg) {
        return msg.content as string
      }
      return JSON.stringify(msg, null, 2)
    }).join('\n\n')
  }

  // 其他情况直接返回
  console.log('[formattedResult] 显示其他类型结果')
  return JSON.stringify(result.value, null, 2)
})

const responseCount = computed(() => {
  if (!result.value) return 0
  // 如果有转换结果，尝试从转换结果中获取消息数量
  if (typeof result.value === 'object' && result.value !== null) {
    if ('convert' in result.value) {
      // 转换结果通常是一个对象，不是数组，返回1
      return 1
    } else if ('semantic' in result.value && Array.isArray(result.value.semantic)) {
      return result.value.semantic.length
    }
  }
  return Array.isArray(result.value) ? result.value.length : 1
})

const characterCount = computed(() => {
  return formattedResult.value.length
})

// 监听selectedConvertAppId变化，保存到localStorage
watch(selectedConvertAppId, (newId) => {
  localStorage.setItem('xunfei-convert-appId', newId)
})

// 方法
const getStateDescription = () => {
  const descriptions: Record<WebSocketConnectionState, string> = {
    disconnected: '未连接',
    connecting: '连接中',
    connected: '已连接',
    reconnecting: '重连中',
    error: '连接错误'
  }
  return descriptions[connectionState.value] || '未知状态'
}

const handleConnect = async () => {
  try {
    if (!appId.value || !apiKey.value || !authId.value) {
      error.value = '请填写完整的API配置信息'
      return
    }

    connecting.value = true
    error.value = ''
    success.value = '正在建立连接...'

    // 保存API配置
    localStorage.setItem('xunfei-app-id', appId.value)
    localStorage.setItem('xunfei-api-key', apiKey.value)
    localStorage.setItem('xunfei-auth-id', authId.value)

    // 创建API服务实例
    apiService = new XunfeiApiService({
      apiKey: apiKey.value,
      authId: authId.value,
      dataType: dataType.value,
      interactMode: interactMode.value,
      resultLevel: resultLevel.value,
      scene: scene.value,
      closeDelay: '100',
      deviceId: '00000000000000000000000000000000',
      speechClientVer: '1.6.0.1_beta',
      startAsrNum: '1',
      vin: 'Test_10000001',
      voiceActiveDetect: 'inactive',
      aiStatus: ''
    })

    // 初始化转换服务
    apiService.initConvertService({
      convertApiUrl: convertEndpoint.value,
      convertAuthToken: convertToken.value,
      convertApplicationId: selectedConvertAppId.value,
      convertSupplier: 0,
      convertVersion: 'lastest'
    })

    await apiService.connect(
      appId.value,
      (state) => {
        connectionState.value = state
        isConnected.value = state === 'connected'
        connecting.value = state === 'connecting'

        if (state === 'connected') {
          success.value = '连接建立成功'
        } else if (state === 'error') {
          error.value = '连接失败，请检查配置'
        }
      }
    )

    success.value = '连接建立成功'
  } catch (err) {
    error.value = err instanceof Error ? err.message : '连接失败'
    connectionState.value = 'error'
    isConnected.value = false
  } finally {
    connecting.value = false
  }
}

const handleDisconnect = () => {
  if (apiService) {
    apiService.disconnect()
    connectionState.value = 'disconnected'
    isConnected.value = false
    success.value = '已断开连接'
  }
}

// 处理键盘事件：Enter发送，Ctrl+Enter换行
const handleKeydown = (event) => {
  if (event.key === 'Enter') {
    if (event.ctrlKey) {
      // Ctrl+Enter：允许换行（默认行为）
      return
    } else {
      // Enter：发送请求
      event.preventDefault()
      sendQuery()
    }
  }
}

const sendQuery = async () => {

  if (!apiService) {
    console.error('[sendQuery] 错误: apiService不存在')
    error.value = 'API服务未初始化'
    return
  }

  if (!queryText.value) {
    console.error('[sendQuery] 错误: 查询内容为空')
    error.value = '请输入查询内容'
    return
  }

  if (!isConnected.value) {
    console.error('[sendQuery] 错误: WebSocket未连接, connectionState:', connectionState.value)
    error.value = 'WebSocket未连接，请检查网络或点击重连'
    return
  }

  try {
    loading.value = true
    error.value = ''
    success.value = ''
    result.value = null
    currentQuery.value = queryText.value

    const messages: Array<{ content: string; timestamp: number }> = []

    const sendResult = await apiService.sendQuery(
      queryText.value,
      appId.value,
      (message) => {
        // 提取content字段以保持与最终结果一致
        let displayContent = ''
        if (message.data && typeof message.data === 'object' && 'content' in message.data) {
          displayContent = message.data.content as string
        } else {
          displayContent = JSON.stringify(message)
        }
        messages.push({ content: displayContent, timestamp: Date.now() })
        // 实时更新结果（先显示语义结果）
        result.value = messages
      },
      (state) => {
        connectionState.value = state
        isConnected.value = state === 'connected'
      }
    )

    // 使用sendQuery的返回值（包含转换结果）
    if (sendResult) {
      result.value = sendResult.response
    }

    console.log('[sendQuery] 查询完成，结果类型:', typeof result.value)
    success.value = '查询完成'
    // 刷新历史记录
    loadHistory()

    // ✨ 新增功能：查询完成后2秒自动重连
    console.log('[sendQuery] 设置2秒后自动重连')
    setTimeout(() => {
      console.log('[sendQuery] 2秒后开始自动重连')
      success.value = '查询完成，2秒后自动重连...'
      autoConnect()
    }, 2000)
  } catch (err) {
    console.error('[sendQuery] 查询失败:', err)
    error.value = err instanceof Error ? err.message : '查询失败'
  } finally {
    console.log('[sendQuery] 结束，设置loading为false')
    loading.value = false
  }
  console.log('=== [sendQuery] 发送查询结束 ===')
}

const clearAll = () => {
  queryText.value = ''
  result.value = null
  currentQuery.value = ''
  error.value = ''
  success.value = ''
}

const clearResult = () => {
  result.value = null
  currentQuery.value = ''
  error.value = ''
  success.value = ''
}

const copyResult = async () => {
  try {
    await navigator.clipboard.writeText(formattedResult.value)
    toastService.copySuccess('语义解析结果')
    success.value = ''
    error.value = ''
  } catch (err) {
    toastService.copyError()
    error.value = ''
  }
}

const downloadResult = () => {
  if (!result.value) return

  const blob = new Blob([formattedResult.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `xunfei-semantic-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)

  success.value = '结果已下载'
}

const loadFromHistory = (item: HistoryRecord) => {
  queryText.value = item.query
  if (item.response) {
    try {
      result.value = JSON.parse(item.response)
    } catch {
      result.value = item.response
    }
  }
}

const clearHistory = () => {
  if (apiService) {
    apiService.clearHistory()
    loadHistory()
    success.value = '历史记录已清空'
  }
}

const loadHistory = () => {
  if (apiService) {
    history.value = apiService.getHistory()
  }
}

const loadConfig = () => {
  appId.value = localStorage.getItem('xunfei-app-id') || 'd97460e4'
  apiKey.value = localStorage.getItem('xunfei-api-key') || '33efdde7d2f0d9ea0cd86f4ebb10935e'
  authId.value = localStorage.getItem('xunfei-auth-id') || 'wttest110322b327287039cd92b4c51n'
}

// 保存状态到localStorage
const saveState = () => {
  // 不保存loading状态，因为它只在操作进行时为true
  SemanticModuleStateService.saveState('xunfei-semantic-request', {
    queryText: queryText.value,
    currentQuery: currentQuery.value,
    result: result.value,
    loading: false, // 不保存加载状态
    error: error.value,
    success: success.value,
    history: history.value,
    selectedConvertAppId: selectedConvertAppId.value
  })
}

// 从localStorage恢复状态
const restoreState = () => {
  const savedState = SemanticModuleStateService.getState('xunfei-semantic-request')
  if (savedState) {
    queryText.value = savedState.queryText || ''
    currentQuery.value = savedState.currentQuery || ''
    result.value = savedState.result || null
    error.value = savedState.error || ''
    success.value = savedState.success || ''
    history.value = savedState.history || []
    if (savedState.selectedConvertAppId) {
      selectedConvertAppId.value = savedState.selectedConvertAppId
    }
    console.log('已恢复讯飞语义请求模块状态')
  }
}

// 生命周期
onMounted(async () => {
  loadConfig()
  loadHistory()

  // 恢复状态
  restoreState()

  // 立即自动建立连接
  console.log('讯飞语义请求模块已打开，自动建立连接...')
  await autoConnect()

  // 监听模块事件
  eventBus.on('module:opened', (data: any) => {
    if (data.id === 'xunfei-semantic-request') {
      console.log('讯飞语义请求模块已激活')
    }
  })

  eventBus.on('module:closed', (data: any) => {
    if (data.id === 'xunfei-semantic-request') {
      // 模块关闭时清理连接
      handleDisconnect()
    }
  })
})

onUnmounted(() => {
  // 保存状态
  saveState()

  // 清理WebSocket连接
  handleDisconnect()
})

// 自动连接函数
const autoConnect = async () => {
  try {
    console.log('开始自动连接流程...')
    console.log('API配置:', {
      appId: appId.value,
      apiKey: apiKey.value ? `${apiKey.value.substring(0, 10)}...` : '空',
      authId: authId.value
    })

    if (!appId.value || !apiKey.value || !authId.value) {
      console.error('API配置不完整')
      error.value = 'API配置不完整，请检查appId、apiKey和authId'
      return
    }

    connecting.value = true
    success.value = '正在自动建立连接...'
    error.value = ''

    // 创建API服务实例
    apiService = new XunfeiApiService({
      apiKey: apiKey.value,
      authId: authId.value,
      dataType: dataType.value,
      interactMode: interactMode.value,
      resultLevel: resultLevel.value,
      scene: scene.value,
      closeDelay: '100',
      deviceId: '00000000000000000000000000000000',
      speechClientVer: '1.6.0.1_beta',
      startAsrNum: '1',
      vin: 'Test_10000001',
      voiceActiveDetect: 'inactive',
      aiStatus: ''
    })

    // 初始化转换服务（使用完全不同的配置）
    console.log('[autoConnect] 初始化转换服务...')
    apiService.initConvertService({
      convertApiUrl: convertEndpoint.value,
      convertAuthToken: convertToken.value,
      convertApplicationId: selectedConvertAppId.value,
      convertSupplier: 0,
      convertVersion: 'lastest'
    })
    console.log('[autoConnect] 转换服务初始化完成，appId:', selectedConvertAppId.value)

    console.log('API服务实例已创建，开始连接...')

    // 设置连接超时
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('连接超时')), 10000)
    })

    const connectPromise = apiService.connect(
      appId.value,
      (state) => {
        console.log('连接状态变更:', state)
        connectionState.value = state
        isConnected.value = state === 'connected'
        connecting.value = state === 'connecting'

        if (state === 'connected') {
          success.value = '✅ 自动连接成功，可以开始查询'
          console.log('自动连接成功！')
          // 自动聚焦到输入框
          setTimeout(() => {
            queryInputRef.value?.focus()
            console.log('已聚焦到输入框')
          }, 500)
          // 3秒后清除成功提示
          setTimeout(() => {
            if (success.value.includes('自动连接成功')) {
              success.value = ''
            }
          }, 3000)
        } else if (state === 'error') {
          console.error('连接状态错误')
          error.value = '❌ 自动连接失败，请检查网络或稍后重试'
        }
      }
    )

    // 等待连接完成或超时
    await Promise.race([connectPromise, timeoutPromise])
    console.log('连接流程完成')
  } catch (err) {
    console.error('自动连接发生错误:', err)
    error.value = '❌ 自动连接失败: ' + (err instanceof Error ? err.message : '未知错误')
    connectionState.value = 'error'
    isConnected.value = false
  } finally {
    connecting.value = false
    console.log('自动连接流程结束，connecting设为false')
  }
}
</script>

<style scoped>
.btn-primary {
  @apply px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed;
}

.card {
  @apply bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
