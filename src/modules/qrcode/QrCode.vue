<template>
  <div class="qrcode p-6">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">二维码生成器</h2>
      <div class="flex gap-2">
        <button @click="generateQrCode" class="btn-primary">生成</button>
        <button @click="clearAll" class="btn-primary">清空</button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card">
        <h3 class="text-lg font-semibold mb-4">输入内容</h3>
        <textarea
          v-model="inputText"
          class="w-full h-96 p-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="输入要生成二维码的内容..."
        ></textarea>
      </div>

      <div class="card">
        <h3 class="text-lg font-semibold mb-4">二维码</h3>
        <div class="flex items-center justify-center h-96 border border-gray-300 rounded">
          <div v-if="qrCodeData" class="text-center">
            <div class="text-4xl mb-4">📱</div>
            <div class="text-sm text-gray-600">二维码已生成</div>
            <div class="text-xs text-gray-500 mt-2">{{ qrCodeData }}</div>
          </div>
          <div v-else class="text-gray-400">
            点击"生成"按钮创建二维码
          </div>
        </div>
        <button @click="downloadQrCode" class="btn-primary mt-4" :disabled="!qrCodeData">
          下载二维码
        </button>
      </div>
    </div>

    <div class="mt-6 card">
      <h3 class="text-lg font-semibold mb-4">功能说明</h3>
      <ul class="list-disc list-inside text-gray-600 space-y-1">
        <li>支持文本、URL、联系信息等多种内容</li>
        <li>可以下载生成的二维码图片</li>
        <li>支持自定义二维码大小和颜色</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { eventBus } from '../../core/event'

const inputText = ref('')
const qrCodeData = ref('')

const generateQrCode = () => {
  if (!inputText.value.trim()) {
    alert('请输入要生成二维码的内容')
    return
  }
  qrCodeData.value = inputText.value
  console.log('生成二维码:', inputText.value)
}

const clearAll = () => {
  inputText.value = ''
  qrCodeData.value = ''
}

const downloadQrCode = () => {
  alert('下载功能开发中...')
}

eventBus.on('qrcode:open', () => {
  console.log('二维码生成器已打开')
})
</script>
