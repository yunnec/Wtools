<template>
  <div class="url-tool p-6">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">URL工具</h2>
      <div class="flex gap-2">
        <button @click="encodeUrl" class="btn-primary">编码</button>
        <button @click="decodeUrl" class="btn-primary">解码</button>
        <button @click="clearAll" class="btn-primary">清空</button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card">
        <h3 class="text-lg font-semibold mb-4">输入URL</h3>
        <textarea
          v-model="inputUrl"
          class="w-full h-96 p-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="输入要编码/解码的URL..."
        ></textarea>
      </div>

      <div class="card">
        <h3 class="text-lg font-semibold mb-4">输出结果</h3>
        <textarea
          :value="outputUrl"
          readonly
          class="w-full h-96 p-4 border border-gray-300 rounded bg-gray-50"
        ></textarea>
        <button @click="copyOutput" class="btn-primary mt-2">复制</button>
      </div>
    </div>

    <div class="mt-6 card">
      <h3 class="text-lg font-semibold mb-4">URL参数解析</h3>
      <div class="space-y-2">
        <div v-for="(value, key) in urlParams" :key="key" class="flex gap-2">
          <span class="font-mono text-blue-600 w-40">{{ key }}:</span>
          <span class="text-gray-700">{{ value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { eventBus } from '../../core/event'

const inputUrl = ref('')
const outputUrl = ref('')

const encodeUrl = () => {
  outputUrl.value = encodeURIComponent(inputUrl.value)
}

const decodeUrl = () => {
  try {
    outputUrl.value = decodeURIComponent(inputUrl.value)
  } catch (e) {
    alert('解码失败: ' + e.message)
  }
}

const clearAll = () => {
  inputUrl.value = ''
  outputUrl.value = ''
}

const copyOutput = () => {
  navigator.clipboard.writeText(outputUrl.value)
  alert('已复制')
}

const urlParams = computed(() => {
  try {
    const url = new URL(inputUrl.value)
    const params = {}
    url.searchParams.forEach((value, key) => {
      params[key] = value
    })
    return params
  } catch {
    return {}
  }
})

eventBus.on('url-tool:open', () => {
  console.log('URL工具已打开')
})
</script>
