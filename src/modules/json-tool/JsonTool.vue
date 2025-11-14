<template>
  <div class="json-tool p-6">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">JSON工具</h2>
      <div class="flex gap-2">
        <button @click="formatJson" class="btn-primary">格式化</button>
        <button @click="minifyJson" class="btn-primary">压缩</button>
        <button @click="validateJson" class="btn-primary">验证</button>
        <button @click="clearAll" class="btn-primary">清空</button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 输入区域 -->
      <div class="card">
        <h3 class="text-lg font-semibold mb-4">输入 JSON</h3>
        <textarea
          v-model="inputJson"
          class="w-full h-[800px] p-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          placeholder="在此输入 JSON 数据..."
        ></textarea>
        <div v-if="error" class="mt-2 text-red-500 text-sm">
          ❌ {{ error }}
        </div>
      </div>

      <!-- 输出区域 -->
      <div class="card">
        <h3 class="text-lg font-semibold mb-4">输出结果</h3>
        <textarea
          :value="outputJson"
          readonly
          class="w-full h-[800px] p-4 border border-gray-300 rounded bg-gray-50 font-mono text-sm"
        ></textarea>
        <div class="mt-2 text-green-500 text-sm" v-if="success">
          ✅ {{ success }}
        </div>
        <button @click="copyOutput" class="btn-primary mt-2">复制结果</button>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="mt-6 card">
      <h3 class="text-lg font-semibold mb-4">统计信息</h3>
      <div class="grid grid-cols-4 gap-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-600">{{ stats.charCount }}</div>
          <div class="text-sm text-gray-600">字符数</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-green-600">{{ stats.lineCount }}</div>
          <div class="text-sm text-gray-600">行数</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-purple-600">{{ stats.keyCount }}</div>
          <div class="text-sm text-gray-600">键数量</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-orange-600">{{ stats.depth }}</div>
          <div class="text-sm text-gray-600">嵌套深度</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { eventBus } from '../../core/event'

const inputJson = ref('')
const outputJson = ref('')
const error = ref('')
const success = ref('')

const formatJson = () => {
  try {
    const parsed = JSON.parse(inputJson.value)
    outputJson.value = JSON.stringify(parsed, null, 2)
    error.value = ''
    success.value = '格式化成功'
  } catch (e) {
    error.value = 'JSON 格式错误: ' + e.message
    success.value = ''
  }
}

const minifyJson = () => {
  try {
    const parsed = JSON.parse(inputJson.value)
    outputJson.value = JSON.stringify(parsed)
    error.value = ''
    success.value = '压缩成功'
  } catch (e) {
    error.value = 'JSON 格式错误: ' + e.message
    success.value = ''
  }
}

const validateJson = () => {
  try {
    JSON.parse(inputJson.value)
    error.value = ''
    success.value = 'JSON 有效'
    outputJson.value = inputJson.value
  } catch (e) {
    error.value = 'JSON 无效: ' + e.message
    success.value = ''
  }
}

const clearAll = () => {
  inputJson.value = ''
  outputJson.value = ''
  error.value = ''
  success.value = ''
}

const copyOutput = () => {
  navigator.clipboard.writeText(outputJson.value)
  alert('已复制到剪贴板')
}

const stats = computed(() => {
  const input = inputJson.value
  return {
    charCount: input.length,
    lineCount: input.split('\n').length,
    keyCount: (input.match(/"/g) || []).length / 2,
    depth: getJsonDepth(inputJson.value)
  }
})

const getJsonDepth = (str) => {
  try {
    const obj = JSON.parse(str)
    return getDepth(obj)
  } catch {
    return 0
  }
}

const getDepth = (obj, depth = 0) => {
  if (typeof obj !== 'object' || obj === null) return depth
  if (Array.isArray(obj)) {
    return Math.max(...obj.map(item => getDepth(item, depth + 1)), depth)
  }
  return Math.max(
    ...Object.values(obj).map(value => getDepth(value, depth + 1)),
    depth
  )
}

onMounted(() => {
  eventBus.on('json-tool:open', () => {
    console.log('JSON工具已打开')
  })
})
</script>
