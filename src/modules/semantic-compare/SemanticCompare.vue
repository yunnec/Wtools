<template>
  <div class="semantic-compare p-6">
    <!-- 标题区 -->
    <div class="mb-4">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">语义对比</h2>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        输入一条文本，同时调用讯飞语义请求和自研语义请求，对比两个模块的返回结果
      </p>
    </div>

    <!-- 输入和操作区（同行） -->
    <div class="card mb-4">
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <!-- 输入框（3列） -->
        <div class="lg:col-span-3">
          <textarea
            ref="queryInputRef"
            v-model="queryText"
            class="w-full h-16 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none"
            placeholder="请输入要对比的语义文本..."
            @keydown.enter.ctrl="sendCompare"
          ></textarea>
          <div class="mt-2 text-sm text-gray-600 flex justify-between">
            <span>字符数: {{ queryText.length }}</span>
            <span class="text-xs text-gray-500">提示: Ctrl+Enter 快速发送</span>
          </div>
        </div>

        <!-- 操作区（2列） -->
        <div class="lg:col-span-2 flex flex-col gap-3">
          <!-- 连接状态 -->
          <div v-if="!xunfeiConnected" class="flex items-center gap-2 p-2 rounded"
               :class="{
                 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300': xunfeiConnected,
                 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300': connectingXunfei,
                 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300': xunfeiError,
                 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400': !connectingXunfei && !xunfeiConnected
               }">
            <span class="text-lg">
              <span v-if="xunfeiConnected">✅</span>
              <span v-else-if="connectingXunfei">⏳</span>
              <span v-else-if="xunfeiError">❌</span>
              <span v-else>⚪</span>
            </span>
            <div class="flex-1 text-xs">
              <div class="font-medium">{{ xunfeiConnected ? '已连接' : (connectingXunfei ? '连接中...' : '未连接') }}</div>
              <div v-if="xunfeiError" class="text-[10px]">{{ xunfeiError }}</div>
            </div>
            <button
              v-if="!xunfeiConnected && !connectingXunfei"
              @click="connectXunfei"
              class="btn-primary text-xs py-1 px-2 bg-orange-500 hover:bg-orange-600"
            >
              连接
            </button>
          </div>
          <div v-else class="text-xs text-green-600 dark:text-green-400 p-2">
            ✅ 讯飞服务已连接，可进行对比查询
          </div>

          <!-- 操作按钮 -->
          <div class="flex gap-2 flex-wrap">
            <button @click="sendCompare" class="btn-primary" :disabled="!queryText || loadingXunfei || loadingSelf || !canSend">
              {{ getButtonText() }}
            </button>
            <button @click="clearAll" class="btn-primary">清空</button>
            <button @click="clearResults" class="btn-primary" :disabled="!hasAnyResult">清空结果</button>
          </div>

          <!-- 对比统计 -->
          <div v-if="hasAnyResult" class="space-y-1">
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                <div class="text-lg font-bold text-blue-600">{{ xunfeiTime || '-' }}ms</div>
                <div class="text-[10px] text-gray-600 dark:text-gray-400">讯飞响应</div>
              </div>
              <div class="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                <div class="text-lg font-bold text-purple-600">{{ selfTime || '-' }}ms</div>
                <div class="text-[10px] text-gray-600 dark:text-gray-400">自研响应</div>
              </div>
            </div>
            <div v-if="xunfeiTime && selfTime" class="text-center text-[10px] text-gray-600 dark:text-gray-400">
              {{ xunfeiTime < selfTime ? '讯飞' : '自研' }}更快 ({{ Math.abs(xunfeiTime - selfTime) }}ms)
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 结果展示区 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 讯飞结果 -->
      <div class="card h-[calc(100vh-14rem)] flex flex-col overflow-hidden">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-lg font-semibold text-blue-700 dark:text-blue-300">📊 讯飞语义结果</h3>
          <div v-if="xunfeiResult" class="flex gap-2">
            <button @click="copyXunfeiResult" class="btn-primary text-xs py-1 px-2">复制</button>
            <button @click="downloadXunfeiResult" class="btn-primary text-xs py-1 px-2">下载</button>
          </div>
        </div>

        <div v-if="loadingXunfei" class="flex-1 flex items-center justify-center">
          <div class="text-center">
            <div class="text-4xl mb-4">⏳</div>
            <div class="text-gray-600 dark:text-gray-400">正在查询讯飞语义...</div>
          </div>
        </div>

        <div v-else-if="xunfeiError" class="flex-1 flex items-center justify-center">
          <div class="text-center">
            <div class="text-4xl mb-4">❌</div>
            <div class="text-red-600 mb-2">查询失败</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">{{ xunfeiError }}</div>
          </div>
        </div>

        <div v-else-if="xunfeiResult" class="flex-1 overflow-y-auto pr-2">
          <pre class="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono overflow-x-auto whitespace-pre-wrap">{{
            formatXunfeiResult
          }}</pre>
        </div>

        <div v-else class="flex-1 flex items-center justify-center text-gray-400">
          <div class="text-center">
            <div class="text-4xl mb-4">📝</div>
            <div>尚未查询</div>
          </div>
        </div>
      </div>

      <!-- 自研结果 -->
      <div class="card h-[calc(100vh-14rem)] flex flex-col overflow-hidden">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-lg font-semibold text-purple-700 dark:text-purple-300">🔍 自研语义结果</h3>
          <div v-if="selfResult" class="flex gap-2">
            <button @click="copySelfResult" class="btn-primary text-xs py-1 px-2">复制</button>
            <button @click="downloadSelfResult" class="btn-primary text-xs py-1 px-2">下载</button>
          </div>
        </div>

        <div v-if="loadingSelf" class="flex-1 flex items-center justify-center">
          <div class="text-center">
            <div class="text-4xl mb-4">⏳</div>
            <div class="text-gray-600 dark:text-gray-400">正在查询自研语义...</div>
          </div>
        </div>

        <div v-else-if="selfError" class="flex-1 flex items-center justify-center">
          <div class="text-center">
            <div class="text-4xl mb-4">❌</div>
            <div class="text-red-600 mb-2">查询失败</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">{{ selfError }}</div>
          </div>
        </div>

        <div v-else-if="selfResult" class="flex-1 overflow-y-auto pr-2">
          <pre class="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono overflow-x-auto whitespace-pre-wrap">{{
            formatSelfResult
          }}</pre>
        </div>

        <div v-else class="flex-1 flex items-center justify-center text-gray-400">
          <div class="text-center">
            <div class="text-4xl mb-4">📝</div>
            <div>尚未查询</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { XunfeiApiService, type WebSocketConnectionState, type WebSocketMessage } from '../xunfei-semantic-request/services/xunfei-api.service'
import { SemanticModuleStateService } from '../../core/services/SemanticModuleStateService'

// 响应式数据
const queryText = ref('')
const xunfeiResult = ref<any>(null)
const xunfeiError = ref('')
const xunfeiTime = ref(0)
const selfResult = ref('')
const selfError = ref('')
const selfTime = ref(0)
const loadingXunfei = ref(false)
const loadingSelf = ref(false)
const xunfeiConnected = ref(false)
const connectingXunfei = ref(false)

// 讯飞服务实例
let xunfeiApiService: XunfeiApiService | null = null

// 讯飞API配置
const xunfeiAppId = ref('d97460e4')
const xunfeiApiKey = ref('33efdde7d2f0d9ea0cd86f4ebb10935e')
const xunfeiAuthId = ref('wttest110322b327287039cd92b4c51n')
const dataType = ref('text')
const interactMode = ref('continuous')
const resultLevel = ref('complete')
const scene = ref('main')

// 转换服务配置
const selectedConvertAppId = ref('9b3d4bz5foji1e5b6eebob4zskgj6q81')
const convertEndpoint = ref('https://voice.auto-pai.cn/voice-cloud/admin/app/command/manager/convert/test')
const convertToken = ref('f5b13aca-ff50-49dc-9e73-f3543b9947a9')

// 自研API配置
const selfAppId = ref('9b3d4bz5foji1e5b6eebob4zskgj6q81')
const selfConfig = {
  userId: 'test11111123',
  tinnoveAiUrl: 'http://nlu-pf.auto-pai.cn/zp/update',
  version: 'cache'
}

// 输入框引用
const queryInputRef = ref<HTMLTextAreaElement | null>(null)

// 计算属性
const canSend = computed(() => {
  return queryText.value.trim().length > 0 && xunfeiConnected.value
})

const hasAnyResult = computed(() => {
  return !!(xunfeiResult.value || selfResult.value)
})

const getButtonText = () => {
  if (loadingXunfei && loadingSelf) return '查询中...'
  if (loadingXunfei) return '讯飞查询中...'
  if (loadingSelf) return '自研查询中...'
  return '开始查询'
}

const formatXunfeiResult = computed(() => {
  if (!xunfeiResult.value) return ''

  try {
    // 如果是对象且有convert字段，优先显示转换结果
    if (typeof xunfeiResult.value === 'object' && xunfeiResult.value !== null) {
      if ('convert' in xunfeiResult.value && xunfeiResult.value.convert) {
        if (xunfeiResult.value.convert.data) {
          const dataStr = xunfeiResult.value.convert.data as string
          try {
            return JSON.stringify(JSON.parse(dataStr), null, 2)
          } catch {
            return dataStr
          }
        }
        return JSON.stringify(xunfeiResult.value.convert, null, 2)
      }
      if ('semantic' in xunfeiResult.value && Array.isArray(xunfeiResult.value.semantic)) {
        return xunfeiResult.value.semantic.map((msg: any) => {
          if (typeof msg === 'object' && msg !== null && 'content' in msg) {
            return msg.content as string
          }
          return JSON.stringify(msg, null, 2)
        }).join('\n\n')
      }
    }

    // 如果是数组
    if (Array.isArray(xunfeiResult.value)) {
      return xunfeiResult.value.map((msg: any) => {
        if (typeof msg === 'object' && msg !== null && 'content' in msg) {
          return msg.content as string
        }
        return JSON.stringify(msg, null, 2)
      }).join('\n\n')
    }

    return JSON.stringify(xunfeiResult.value, null, 2)
  } catch (error) {
    return String(xunfeiResult.value)
  }
})

const formatSelfResult = computed(() => {
  return selfResult.value || ''
})

// 初始化讯飞服务
const initXunfeiService = () => {
  xunfeiApiService = new XunfeiApiService({
    apiKey: xunfeiApiKey.value,
    authId: xunfeiAuthId.value,
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

  xunfeiApiService.initConvertService({
    convertApiUrl: convertEndpoint.value,
    convertAuthToken: convertToken.value,
    convertApplicationId: selectedConvertAppId.value,
    convertSupplier: 0,
    convertVersion: 'lastest'
  })
}

// 连接讯飞服务
const connectXunfei = async () => {
  if (!xunfeiApiService) {
    initXunfeiService()
  }

  try {
    connectingXunfei.value = true
    xunfeiError.value = ''

    await xunfeiApiService!.connect(
      xunfeiAppId.value,
      (state: WebSocketConnectionState) => {
        xunfeiConnected.value = state === 'connected'
        if (state === 'error') {
          xunfeiError.value = '连接失败'
        }
      }
    )
  } catch (err) {
    xunfeiError.value = err instanceof Error ? err.message : '连接失败'
    xunfeiConnected.value = false
  } finally {
    connectingXunfei.value = false
  }
}

// 发送查询
const sendCompare = async () => {
  if (!queryText.value.trim()) {
    return
  }

  if (!xunfeiConnected.value) {
    xunfeiError.value = '讯飞服务未连接'
    return
  }

  // 清理上次结果
  xunfeiResult.value = null
  xunfeiError.value = ''
  xunfeiTime.value = 0
  selfResult.value = ''
  selfError.value = ''
  selfTime.value = 0

  // 并行执行两个查询
  await Promise.allSettled([
    queryXunfei(),
    querySelf()
  ])
}

// 查询讯飞语义
const queryXunfei = async () => {
  if (!xunfeiApiService) return

  loadingXunfei.value = true
  const startTime = Date.now()

  try {
    const result = await xunfeiApiService!.sendQuery(
      queryText.value,
      xunfeiAppId.value
    )
    xunfeiTime.value = Date.now() - startTime
    xunfeiResult.value = result.response
  } catch (err) {
    xunfeiTime.value = Date.now() - startTime
    xunfeiError.value = err instanceof Error ? err.message : '讯飞查询失败'
  } finally {
    loadingXunfei.value = false
  }
}

// 查询自研语义
const querySelf = async () => {
  loadingSelf.value = true
  const startTime = Date.now()

  try {
    const requestBody = {
      wtAppId: selfAppId.value,
      ...selfConfig,
      query: queryText.value
    }

    const response = await fetch('https://api.auto-pai.cn/voiceserver/api/v1/tinnove-ai/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    selfTime.value = Date.now() - startTime

    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`)
    }

    const data = await response.json()
    selfResult.value = JSON.stringify(data, null, 2)
  } catch (err) {
    selfTime.value = Date.now() - startTime
    selfError.value = err instanceof Error ? err.message : '自研查询失败'
  } finally {
    loadingSelf.value = false
  }
}

// 复制讯飞结果
const copyXunfeiResult = async () => {
  try {
    await navigator.clipboard.writeText(formatXunfeiResult.value)
  } catch (err) {
    console.error('复制失败:', err)
  }
}

// 复制自研结果
const copySelfResult = async () => {
  try {
    await navigator.clipboard.writeText(formatSelfResult.value)
  } catch (err) {
    console.error('复制失败:', err)
  }
}

// 下载讯飞结果
const downloadXunfeiResult = () => {
  if (!xunfeiResult.value) return
  const blob = new Blob([formatXunfeiResult.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `xunfei-semantic-compare-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// 下载自研结果
const downloadSelfResult = () => {
  if (!selfResult.value) return
  const blob = new Blob([selfResult.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `self-semantic-compare-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// 清空全部
const clearAll = () => {
  queryText.value = ''
  xunfeiResult.value = null
  xunfeiError.value = ''
  xunfeiTime.value = 0
  selfResult.value = ''
  selfError.value = ''
  selfTime.value = 0
}

// 清空结果
const clearResults = () => {
  xunfeiResult.value = null
  xunfeiError.value = ''
  xunfeiTime.value = 0
  selfResult.value = ''
  selfError.value = ''
  selfTime.value = 0
}

// 保存状态到localStorage
const saveState = () => {
  // 不保存loading状态，因为它只在操作进行时为true
  SemanticModuleStateService.saveState('semantic-compare', {
    queryText: queryText.value,
    xunfeiResult: xunfeiResult.value,
    xunfeiError: xunfeiError.value,
    xunfeiTime: xunfeiTime.value,
    selfResult: selfResult.value,
    selfError: selfError.value,
    selfTime: selfTime.value,
    loadingXunfei: false, // 不保存加载状态
    loadingSelf: false // 不保存加载状态
  })
}

// 从localStorage恢复状态
const restoreState = () => {
  const savedState = SemanticModuleStateService.getState('semantic-compare')
  if (savedState) {
    queryText.value = savedState.queryText || ''
    xunfeiResult.value = savedState.xunfeiResult || null
    xunfeiError.value = savedState.xunfeiError || ''
    xunfeiTime.value = savedState.xunfeiTime || 0
    selfResult.value = savedState.selfResult || ''
    selfError.value = savedState.selfError || ''
    selfTime.value = savedState.selfTime || 0
    console.log('已恢复语义对比模块状态')
  }
}

// 生命周期
onMounted(() => {
  // 恢复状态
  restoreState()

  // 自动连接讯飞服务
  connectXunfei()

  // 聚焦到输入框
  setTimeout(() => {
    queryInputRef.value?.focus()
  }, 100)
})

onUnmounted(() => {
  // 保存状态
  saveState()

  // 清理讯飞连接
  if (xunfeiApiService) {
    xunfeiApiService.disconnect()
  }
})
</script>

<style scoped>
.btn-primary {
  @apply px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed;
}

.card {
  @apply bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm;
}
</style>
