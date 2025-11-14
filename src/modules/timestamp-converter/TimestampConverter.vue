<template>
  <div class="timestamp-converter p-6">
    <!-- 标题区 -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">时间戳转换</h2>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        时间戳与日期时间相互转换，支持秒级、毫秒级精度和多种时区
      </p>
    </div>

    <!-- 控制面板 -->
    <div class="card mb-4">
      <div class="flex flex-wrap gap-4 items-center justify-between">
        <!-- 左侧控制 -->
        <div class="flex flex-wrap gap-2 items-center">
          <!-- 转换模式切换 -->
          <div class="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              @click="convertMode = 'ts-to-date'"
              :class="{
                'bg-white dark:bg-gray-600 shadow-sm': convertMode === 'ts-to-date',
                'text-gray-600 dark:text-gray-400': convertMode !== 'ts-to-date'
              }"
              class="px-4 py-2 rounded-md text-sm font-medium transition-all"
            >
              时间戳→日期
            </button>
            <button
              @click="convertMode = 'date-to-ts'"
              :class="{
                'bg-white dark:bg-gray-600 shadow-sm': convertMode === 'date-to-ts',
                'text-gray-600 dark:text-gray-400': convertMode !== 'date-to-ts'
              }"
              class="px-4 py-2 rounded-md text-sm font-medium transition-all"
            >
              日期→时间戳
            </button>
          </div>

          <!-- 时间戳精度 -->
          <div v-if="convertMode === 'ts-to-date'" class="flex items-center gap-2">
            <label class="text-sm text-gray-700 dark:text-gray-300">精度:</label>
            <select v-model="timestampPrecision" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
              <option value="auto">自动检测</option>
              <option value="second">秒级 (10位)</option>
              <option value="millisecond">毫秒级 (13位)</option>
            </select>
          </div>

          <!-- 日期格式 -->
          <div v-if="convertMode === 'ts-to-date'" class="flex items-center gap-2">
            <label class="text-sm text-gray-700 dark:text-gray-300">格式:</label>
            <select v-model="dateFormat" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
              <option value="YYYY-MM-DD HH:mm:ss">YYYY-MM-DD HH:mm:ss</option>
              <option value="YYYY-MM-DD HH:mm:ss.SSS">YYYY-MM-DD HH:mm:ss.SSS</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              <option value="HH:mm:ss">HH:mm:ss</option>
              <option value="timestamp">时间戳</option>
            </select>
          </div>

          <!-- 时区 -->
          <div v-if="convertMode === 'ts-to-date'" class="flex items-center gap-2">
            <label class="text-sm text-gray-700 dark:text-gray-300">时区:</label>
            <select v-model="timezone" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
              <option value="local">本地时间</option>
              <option value="utc">UTC时间</option>
            </select>
          </div>
        </div>

        <!-- 右侧操作按钮 -->
        <div class="flex gap-2">
          <button @click="convertNow" class="btn-primary" :disabled="!hasInput">
            {{ isConverting ? '转换中...' : '转换' }}
          </button>
          <button @click="clearAll" class="btn-primary">清空</button>
          <button @click="copyResult" class="btn-primary" :disabled="!outputValue">复制结果</button>
        </div>
      </div>
    </div>

    <!-- 输入输出区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- 输入区 -->
      <div class="card">
        <h3 class="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
          {{ convertMode === 'ts-to-date' ? '输入时间戳' : '输入日期时间' }}
        </h3>

        <!-- 时间戳输入 -->
        <div v-if="convertMode === 'ts-to-date'">
          <textarea
            v-model="inputTimestamp"
            class="w-full h-64 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="输入时间戳（支持批量，每行一个）..."
            @input="debouncedConvert"
          ></textarea>
          <div class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            支持10位（秒级）或13位（毫秒级）时间戳
          </div>
        </div>

        <!-- 日期输入 -->
        <div v-else>
          <input
            v-model="inputDate"
            type="datetime-local"
            class="w-full h-12 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div class="mt-4">
            <textarea
              v-model="inputDateStr"
              class="w-full h-48 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="或者直接输入日期字符串，如: 2025-01-01 12:00:00"
              @input="debouncedConvert"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- 输出区 -->
      <div class="card">
        <h3 class="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">转换结果</h3>
        <textarea
          :value="outputValue"
          readonly
          class="w-full h-64 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm resize-none"
        ></textarea>
        <div v-if="error" class="mt-2 text-red-500 text-sm">
          ❌ {{ error }}
        </div>
        <div v-if="success" class="mt-2 text-green-500 text-sm">
          ✅ {{ success }}
        </div>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card">
        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">当前时间</h3>
        <div class="space-y-3">
          <div>
            <div class="text-sm text-gray-600 dark:text-gray-400">时间戳（毫秒）</div>
            <div class="text-xl font-mono font-bold text-blue-600 dark:text-blue-400">{{ currentTimestamp }}</div>
          </div>
          <div>
            <div class="text-sm text-gray-600 dark:text-gray-400">本地时间</div>
            <div class="text-lg font-mono text-gray-900 dark:text-gray-100">{{ formatDate(currentTime, 'YYYY-MM-DD HH:mm:ss.SSS') }}</div>
          </div>
          <div>
            <div class="text-sm text-gray-600 dark:text-gray-400">UTC时间</div>
            <div class="text-lg font-mono text-gray-900 dark:text-gray-100">{{ formatDateUTC(currentTime, 'YYYY-MM-DD HH:mm:ss.SSS') }}</div>
          </div>
        </div>
      </div>

      <div class="card">
        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">快捷输入</h3>
        <div class="flex flex-wrap gap-2">
          <button @click="setCurrentTimestamp('second')" class="btn-primary text-sm py-1 px-3">
            当前秒级时间戳
          </button>
          <button @click="setCurrentTimestamp('millisecond')" class="btn-primary text-sm py-1 px-3">
            当前毫秒级时间戳
          </button>
          <button @click="setCommonDate('today')" class="btn-primary text-sm py-1 px-3">
            今天 00:00:00
          </button>
          <button @click="setCommonDate('now')" class="btn-primary text-sm py-1 px-3">
            当前时间
          </button>
        </div>

        <div class="mt-4">
          <h4 class="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">常用时间戳</h4>
          <div class="space-y-2 text-sm">
            <div class="flex items-center justify-between">
              <span class="text-gray-600 dark:text-gray-400">Unix 0 (1970-01-01)</span>
              <button @click="useTimestamp(0)" class="text-blue-600 hover:underline">0</button>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-600 dark:text-gray-400">2024-01-01 00:00:00</span>
              <button @click="useTimestamp(1704038400000)" class="text-blue-600 hover:underline">1704038400000</button>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-600 dark:text-gray-400">2025-01-01 00:00:00</span>
              <button @click="useTimestamp(1735689600000)" class="text-blue-600 hover:underline">1735689600000</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 使用说明 -->
    <div class="mt-6 card">
      <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">使用说明</h3>
      <ul class="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
        <li><strong>时间戳→日期</strong>：支持10位（秒级，如：1609459200）或13位（毫秒级，如：1609459200000）时间戳</li>
        <li><strong>日期→时间戳</strong>：输入日期时间，自动转换为时间戳（毫秒级精度）</li>
        <li><strong>批量转换</strong>：在输入框中输入多个时间戳（每行一个），将批量转换并换行输出</li>
        <li><strong>时区说明</strong>：本地时间使用浏览器时区，UTC时间使用协调世界时</li>
        <li><strong>快捷输入</strong>：点击常用时间戳可直接填入输入框</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { eventBus } from '../../core/event'
import { toastService } from '../../core/services/ToastService'

// 响应式数据
const convertMode = ref('ts-to-date') // ts-to-date | date-to-ts
const timestampPrecision = ref('auto') // auto | second | millisecond
const dateFormat = ref('YYYY-MM-DD HH:mm:ss')
const timezone = ref('local') // local | utc

const inputTimestamp = ref('')
const inputDate = ref('')
const inputDateStr = ref('')
const outputValue = ref('')
const error = ref('')
const success = ref('')
const isConverting = ref(false)

const currentTime = ref(new Date())
let timeInterval = null

// 计算属性
const hasInput = computed(() => {
  return convertMode.value === 'ts-to-date'
    ? inputTimestamp.value.trim() !== ''
    : inputDate.value !== '' || inputDateStr.value.trim() !== ''
})

const currentTimestamp = computed(() => {
  return currentTime.value.getTime()
})

// 转换函数
const convertTimestampToDate = (timestamp) => {
  try {
    let ts = timestamp.trim()

    // 自动检测精度
    if (timestampPrecision.value === 'auto') {
      if (ts.length === 10) {
        ts = ts + '000'
      } else if (ts.length === 13) {
        // 保持不变
      } else if (ts.length === 16) {
        // 微秒级，转换为毫秒
        ts = ts.substring(0, 13)
      } else if (ts.length === 19) {
        // 纳秒级，转换为毫秒
        ts = ts.substring(0, 13)
      }
    } else if (timestampPrecision.value === 'second') {
      ts = ts + '000'
    }

    const num = parseInt(ts, 10)
    if (isNaN(num)) {
      throw new Error('无效的时间戳')
    }

    const date = new Date(num)

    if (timezone.value === 'utc') {
      return formatDateUTC(date, dateFormat.value)
    } else {
      return formatDate(date, dateFormat.value)
    }
  } catch (e) {
    throw new Error('转换失败: ' + e.message)
  }
}

const convertDateToTimestamp = (dateStr) => {
  try {
    let date

    if (dateStr.trim()) {
      date = new Date(dateStr)
    } else if (inputDate.value) {
      // datetime-local格式: "2025-01-01T12:00"
      date = new Date(inputDate.value)
    } else {
      throw new Error('请输入日期时间')
    }

    if (isNaN(date.getTime())) {
      throw new Error('无效的日期格式')
    }

    return date.getTime().toString()
  } catch (e) {
    throw new Error('转换失败: ' + e.message)
  }
}

// 格式化函数
const formatDate = (date, formatStr) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0')

  let result = formatStr
  result = result.replace('YYYY', year)
  result = result.replace('MM', month)
  result = result.replace('DD', day)
  result = result.replace('HH', hours)
  result = result.replace('mm', minutes)
  result = result.replace('ss', seconds)
  result = result.replace('SSS', milliseconds)

  if (formatStr === 'timestamp') {
    return String(date.getTime())
  }

  return result
}

const formatDateUTC = (date, formatStr) => {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  const hours = String(date.getUTCHours()).padStart(2, '0')
  const minutes = String(date.getUTCMinutes()).padStart(2, '0')
  const seconds = String(date.getUTCSeconds()).padStart(2, '0')
  const milliseconds = String(date.getUTCMilliseconds()).padStart(3, '0')

  let result = formatStr
  result = result.replace('YYYY', year)
  result = result.replace('MM', month)
  result = result.replace('DD', day)
  result = result.replace('HH', hours)
  result = result.replace('mm', minutes)
  result = result.replace('ss', seconds)
  result = result.replace('SSS', milliseconds)

  if (formatStr === 'timestamp') {
    return String(date.getTime())
  }

  return result
}

// 主要操作函数
const convertNow = () => {
  try {
    error.value = ''
    success.value = ''
    isConverting.value = true

    if (convertMode.value === 'ts-to-date') {
      const lines = inputTimestamp.value.trim().split('\n').filter(line => line.trim())
      const results = lines.map(line => convertTimestampToDate(line))
      outputValue.value = results.join('\n')
      success.value = `成功转换 ${results.length} 个时间戳`
    } else {
      const dateStr = inputDateStr.value.trim() || inputDate.value
      outputValue.value = convertDateToTimestamp(dateStr)
      success.value = '转换成功'
    }
  } catch (e) {
    error.value = e.message
    outputValue.value = ''
    success.value = ''
  } finally {
    isConverting.value = false
  }
}

const clearAll = () => {
  inputTimestamp.value = ''
  inputDate.value = ''
  inputDateStr.value = ''
  outputValue.value = ''
  error.value = ''
  success.value = ''
}

const copyOutput = async () => {
  try {
    await navigator.clipboard.writeText(outputValue.value)
    toastService.copySuccess('转换结果')
  } catch (err) {
    toastService.copyError()
  }
}

// 快捷操作
const setCurrentTimestamp = (precision) => {
  const now = Date.now()
  if (precision === 'second') {
    inputTimestamp.value = Math.floor(now / 1000).toString()
  } else {
    inputTimestamp.value = now.toString()
  }
  convertNow()
}

const setCommonDate = (type) => {
  const now = new Date()
  if (type === 'today') {
    now.setHours(0, 0, 0, 0)
    inputDate.value = now.toISOString().slice(0, 16)
  } else {
    inputDate.value = now.toISOString().slice(0, 16)
  }
  convertNow()
}

const useTimestamp = (timestamp) => {
  inputTimestamp.value = timestamp.toString()
  convertMode.value = 'ts-to-date'
  convertNow()
}

// 防抖转换
let debounceTimer = null
const debouncedConvert = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    convertNow()
  }, 300)
}

// 生命周期
onMounted(() => {
  eventBus.on('timestamp-converter:open', () => {
    console.log('时间戳转换工具已打开')
  })

  // 更新当前时间
  timeInterval = setInterval(() => {
    currentTime.value = new Date()
  }, 1000)
})

// 组件销毁时清理定时器
onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>
