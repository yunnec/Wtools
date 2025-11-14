<template>
  <Teleport to="body">
    <Transition name="toast">
      <div
        v-if="visible"
        class="fixed top-4 right-4 z-50 toast-container"
        :class="[toastClass]"
      >
        <div class="flex items-center gap-3 p-4 rounded-lg shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 max-w-sm">
          <!-- 图标 -->
          <div class="flex-shrink-0 text-2xl">
            <span v-if="type === 'success'">✅</span>
            <span v-else-if="type === 'error'">❌</span>
            <span v-else-if="type === 'warning'">⚠️</span>
            <span v-else>ℹ️</span>
          </div>

          <!-- 文本内容 -->
          <div class="flex-1 text-gray-900 dark:text-gray-100">
            <p class="font-medium">{{ title }}</p>
            <p v-if="message" class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {{ message }}
            </p>
          </div>

          <!-- 关闭按钮 -->
          <button
            @click="close"
            class="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'

interface ToastProps {
  type?: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  id: string
}

const props = withDefaults(defineProps<ToastProps>(), {
  type: 'success',
  duration: 3000
})

const emit = defineEmits<{
  close: [id: string]
}>()

const visible = ref(false)
const timer = ref<number | null>(null)

const toastClass = computed(() => {
  const base = 'transform transition-all duration-300'
  switch (props.type) {
    case 'success':
      return `${base} border-l-4 border-green-500`
    case 'error':
      return `${base} border-l-4 border-red-500`
    case 'warning':
      return `${base} border-l-4 border-yellow-500`
    default:
      return `${base} border-l-4 border-blue-500`
  }
})

const close = () => {
  visible.value = false
  setTimeout(() => {
    emit('close', props.id)
  }, 300) // 等待动画完成
}

const startTimer = () => {
  if (timer.value) {
    clearTimeout(timer.value)
  }
  timer.value = window.setTimeout(() => {
    close()
  }, props.duration)
}

onMounted(async () => {
  await nextTick()
  visible.value = true
  startTimer()
})

watch(() => props.duration, () => {
  startTimer()
})
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-container {
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
