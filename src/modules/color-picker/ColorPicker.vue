<template>
  <div class="color-picker p-6">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">颜色选择器</h2>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 颜色选择区域 -->
      <div class="card">
        <h3 class="text-lg font-semibold mb-4">选择颜色</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">颜色选择器</label>
            <input type="color" v-model="selectedColor" class="w-full h-32 rounded cursor-pointer" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">R (红)</label>
              <input type="number" v-model="rgb.r" min="0" max="255" class="input-field" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">G (绿)</label>
              <input type="number" v-model="rgb.g" min="0" max="255" class="input-field" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">B (蓝)</label>
              <input type="number" v-model="rgb.b" min="0" max="255" class="input-field" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">A (透明度)</label>
              <input type="number" v-model="rgb.a" min="0" max="1" step="0.1" class="input-field" />
            </div>
          </div>
        </div>
      </div>

      <!-- 颜色信息展示 -->
      <div class="card">
        <h3 class="text-lg font-semibold mb-4">颜色信息</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">颜色预览</label>
            <div class="w-full h-32 rounded border border-gray-300" :style="{ backgroundColor: colorPreview }"></div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">HEX</label>
            <div class="flex gap-2">
              <input :value="hexValue" readonly class="input-field flex-1" />
              <button @click="copyToClipboard(hexValue)" class="btn-primary">
                复制
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">RGB</label>
            <div class="flex gap-2">
              <input :value="rgbString" readonly class="input-field flex-1" />
              <button @click="copyToClipboard(rgbString)" class="btn-primary">
                复制
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">HSL</label>
            <div class="flex gap-2">
              <input :value="hslString" readonly class="input-field flex-1" />
              <button @click="copyToClipboard(hslString)" class="btn-primary">
                复制
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 调色板 -->
    <div class="mt-6">
      <h3 class="text-lg font-semibold mb-4">预设调色板</h3>
      <div class="grid grid-cols-6 md:grid-cols-12 gap-2">
        <div
          v-for="color in palette"
          :key="color"
          class="w-full h-12 rounded cursor-pointer border border-gray-200 hover:scale-110 transition"
          :style="{ backgroundColor: color }"
          @click="setColor(color)"
          :title="color"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { eventBus } from '../../core/event'
import { toastService } from '../../core/services/ToastService'

const selectedColor = ref('#3b82f6')
const rgb = ref({ r: 59, g: 130, b: 246, a: 1 })

const palette = [
  '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
  '#FFA500', '#800080', '#FFC0CB', '#A52A2A', '#808080', '#000000',
  '#FFFFFF', '#FFD700', '#00CED1', '#FF69B4', '#8B4513', '#90EE90',
  '#FF6347', '#4682B4', '#DDA0DD', '#F0E68C', '#98FB98', '#FF1493'
]

const colorPreview = computed(() => {
  return `rgba(${rgb.value.r}, ${rgb.value.g}, ${rgb.value.b}, ${rgb.value.a})`
})

const hexValue = computed(() => {
  const r = rgb.value.r.toString(16).padStart(2, '0')
  const g = rgb.value.g.toString(16).padStart(2, '0')
  const b = rgb.value.b.toString(16).padStart(2, '0')
  return `#${r}${g}${b}`.toUpperCase()
})

const rgbString = computed(() => {
  return `rgb(${rgb.value.r}, ${rgb.value.g}, ${rgb.value.b})`
})

const hslString = computed(() => {
  // 简单的RGB到HSL转换
  const r = rgb.value.r / 255
  const g = rgb.value.g / 255
  const b = rgb.value.b / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2

  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }

  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
})

const setColor = (color) => {
  const hex = color.replace('#', '')
  rgb.value = {
    r: parseInt(hex.substring(0, 2), 16),
    g: parseInt(hex.substring(2, 4), 16),
    b: parseInt(hex.substring(4, 6), 16),
    a: 1
  }
  selectedColor.value = color
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    toastService.copySuccess('颜色值')
  } catch (err) {
    console.error('复制失败:', err)
    toastService.copyError()
  }
}

onMounted(() => {
  eventBus.on('color-picker:open', () => {
    console.log('颜色选择器已打开')
  })
})
</script>
