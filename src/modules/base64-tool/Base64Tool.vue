<template>
  <div class="base64-tool p-6">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Base64工具</h2>
      <div class="flex gap-2">
        <button @click="encodeText" class="btn-primary">编码</button>
        <button @click="decodeText" class="btn-primary">解码</button>
        <button @click="clearAll" class="btn-primary">清空</button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card">
        <h3 class="text-lg font-semibold mb-4">输入文本</h3>
        <textarea
          v-model="inputText"
          class="w-full h-96 p-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="输入要编码/解码的文本..."
        ></textarea>
      </div>

      <div class="card">
        <h3 class="text-lg font-semibold mb-4">输出结果</h3>
        <textarea
          :value="outputText"
          readonly
          class="w-full h-96 p-4 border border-gray-300 rounded bg-gray-50"
        ></textarea>
        <button @click="copyOutput" class="btn-primary mt-2">复制</button>
      </div>
    </div>

    <div class="mt-6 card">
      <h3 class="text-lg font-semibold mb-4">使用说明</h3>
      <ul class="list-disc list-inside text-gray-600 space-y-1">
        <li>编码：将普通文本转换为Base64编码</li>
        <li>解码：将Base64编码还原为普通文本</li>
        <li>支持中文字符和特殊符号</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { eventBus } from '../../core/event'
import { toastService } from '../../core/services/ToastService'

const inputText = ref('')
const outputText = ref('')

const encodeText = () => {
  try {
    outputText.value = btoa(unescape(encodeURIComponent(inputText.value)))
  } catch (e) {
    alert('编码失败: ' + e.message)
  }
}

const decodeText = () => {
  try {
    outputText.value = decodeURIComponent(escape(atob(inputText.value)))
  } catch (e) {
    alert('解码失败: ' + e.message)
  }
}

const clearAll = () => {
  inputText.value = ''
  outputText.value = ''
}

const copyOutput = async () => {
  try {
    await navigator.clipboard.writeText(outputText.value)
    toastService.copySuccess('Base64编码结果')
  } catch (err) {
    toastService.copyError()
  }
}

eventBus.on('base64-tool:open', () => {
  console.log('Base64工具已打开')
})
</script>
