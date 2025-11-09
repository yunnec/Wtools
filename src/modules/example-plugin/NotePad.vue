<template>
  <div class="note-pad p-6">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">📝 简易记事本</h2>
      <p class="text-gray-600 mb-4">这是一个示例插件，展示插件 API 的使用</p>

      <!-- 配置面板 -->
      <div class="bg-white rounded-lg shadow p-4 mb-4">
        <h3 class="font-semibold mb-3">插件配置</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              自动保存
            </label>
            <input
              type="checkbox"
              v-model="config.autoSave"
              class="rounded"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              字体大小
            </label>
            <input
              type="number"
              v-model.number="config.fontSize"
              min="12"
              max="24"
              class="input-field"
            />
          </div>
        </div>
        <button @click="saveConfig" class="btn-primary mt-3">
          保存配置
        </button>
      </div>

      <!-- 工具栏 -->
      <div class="flex gap-2 mb-4">
        <button @click="newNote" class="btn-primary">
          新建
        </button>
        <button @click="saveNote" class="btn-primary">
          保存
        </button>
        <button @click="exportNotes" class="btn-primary">
          导出
        </button>
        <span class="ml-4 text-sm text-gray-500">
          笔记数: {{ notes.length }}
        </span>
      </div>
    </div>

    <!-- 笔记列表 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow p-4">
        <h3 class="font-semibold mb-3">我的笔记</h3>
        <div v-if="notes.length === 0" class="text-gray-500 text-sm">
          暂无笔记
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="(note, index) in notes"
            :key="index"
            @click="selectNote(index)"
            :class="[
              'p-2 rounded cursor-pointer transition-colors',
              selectedNoteIndex === index
                ? 'bg-blue-100 border-l-4 border-blue-500'
                : 'hover:bg-gray-100'
            ]"
          >
            <div class="font-medium text-sm">{{ note.title }}</div>
            <div class="text-xs text-gray-500">{{ formatDate(note.timestamp) }}</div>
          </div>
        </div>
      </div>

      <!-- 编辑器 -->
      <div class="lg:col-span-2 bg-white rounded-lg shadow p-4">
        <div v-if="selectedNoteIndex !== -1">
          <input
            v-model="currentNote.title"
            class="input-field mb-3 text-lg font-semibold"
            placeholder="笔记标题"
          />
          <textarea
            v-model="currentNote.content"
            class="w-full h-64 p-3 border rounded resize-none"
            :style="{ fontSize: config.fontSize + 'px' }"
            placeholder="开始写作..."
          ></textarea>
          <div class="mt-2 text-sm text-gray-500">
            字数: {{ currentNote.content.length }}
          </div>
        </div>
        <div v-else class="text-center text-gray-500 py-12">
          请选择或新建一个笔记
        </div>
      </div>
    </div>

    <!-- 插件信息 -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 class="font-semibold text-blue-900 mb-2">💡 插件 API 示例</h3>
      <ul class="text-sm text-blue-800 space-y-1">
        <li>✓ 上下文服务访问 (context.services)</li>
        <li>✓ 配置管理 (context.config)</li>
        <li>✓ 日志记录 (context.logger)</li>
        <li>✓ 生命周期钩子 (hooks)</li>
        <li>✓ 事件监听与发送</li>
        <li>✓ 错误处理机制</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  context: {
    type: Object,
    required: true
  }
})

const config = ref({
  autoSave: false,
  fontSize: 14
})

const notes = ref([])
const selectedNoteIndex = ref(-1)
const currentNote = ref({
  title: '',
  content: '',
  timestamp: Date.now()
})

// 选择笔记
const selectNote = (index) => {
  selectedNoteIndex.value = index
  currentNote.value = { ...notes.value[index] }
}

// 新建笔记
const newNote = () => {
  notes.value.unshift({
    title: '新笔记',
    content: '',
    timestamp: Date.now()
  })
  selectNote(0)
  props.context.logger.info('新建笔记')
  props.context.services.eventBus.emit('note:created', {
    timestamp: Date.now()
  })
}

// 保存笔记
const saveNote = () => {
  if (selectedNoteIndex.value !== -1) {
    notes.value[selectedNoteIndex.value] = {
      ...currentNote.value,
      timestamp: Date.now()
    }
    props.context.logger.info('笔记已保存', {
      title: currentNote.value.title,
      length: currentNote.value.content.length
    })
    props.context.services.eventBus.emit('note:saved', {
      index: selectedNoteIndex.value,
      title: currentNote.value.title
    })
  }
}

// 导出笔记
const exportNotes = () => {
  const dataStr = JSON.stringify(notes.value, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'notes.json'
  link.click()
  URL.revokeObjectURL(url)

  props.context.logger.info('笔记已导出', { count: notes.value.length })
  props.context.services.eventBus.emit('note:exported', {
    count: notes.value.length
  })
}

// 保存配置
const saveConfig = () => {
  if (props.context.services.config) {
    props.context.services.config.set('note-pad-config', config.value)
  }
  props.context.logger.info('配置已保存', config.value)
  props.context.services.eventBus.emit('note:config-saved', config.value)
}

// 格式化日期
const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleString('zh-CN')
}

// 初始化
onMounted(() => {
  // 加载配置
  if (props.context.services.config) {
    const savedConfig = props.context.services.config.get('note-pad-config')
    if (savedConfig) {
      config.value = { ...config.value, ...savedConfig }
    }
  }

  // 监听主题变化
  props.context.services.eventBus.on('theme:changed', (theme) => {
    props.context.logger.debug('主题变化', theme)
  })

  // 监听应用就绪事件
  props.context.services.eventBus.on('app:ready', () => {
    props.context.logger.info('记事本插件收到应用就绪事件')
  })

  props.context.logger.info('记事本插件已就绪')
})

// 清理
onUnmounted(() => {
  // 移除事件监听器
  props.context.services.eventBus.off('theme:changed')
  props.context.services.eventBus.off('app:ready')
})
</script>
