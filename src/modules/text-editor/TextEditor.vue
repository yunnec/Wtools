<template>
  <div class="text-editor p-6">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">文本编辑器</h2>

      <!-- 工具栏 -->
      <div class="flex gap-2 mb-4">
        <button @click="newFile" class="btn-primary">
          新建
        </button>
        <button @click="openFile" class="btn-primary">
          打开
        </button>
        <button @click="saveFile" class="btn-primary" :disabled="!hasContent">
          保存
        </button>
        <button @click="searchText" class="btn-primary" :disabled="!hasContent">
          查找
        </button>
        <button @click="replaceText" class="btn-primary" :disabled="!hasContent">
          替换
        </button>
        <span class="ml-4 text-sm text-gray-500">
          字符数: {{ content.length }}
        </span>
      </div>
    </div>

    <!-- 编辑器 -->
    <div class="bg-white rounded-lg shadow">
      <textarea
        v-model="content"
        class="w-full h-96 p-4 border-0 focus:outline-none resize-none"
        placeholder="开始输入..."
      ></textarea>
    </div>

    <!-- 搜索框 -->
    <div v-if="showSearch" class="mt-4 bg-white rounded-lg shadow p-4">
      <div class="flex gap-2 items-center">
        <input
          v-model="searchQuery"
          class="input-field"
          placeholder="搜索..."
        />
        <button @click="doSearch" class="btn-primary">
          查找
        </button>
        <button @click="showSearch = false" class="px-4 py-2 bg-gray-200 rounded">
          取消
        </button>
        <span v-if="searchResult" class="text-sm text-gray-600">
          {{ searchResult }}
        </span>
      </div>
    </div>

    <!-- 替换框 -->
    <div v-if="showReplace" class="mt-4 bg-white rounded-lg shadow p-4">
      <div class="flex gap-2 items-center">
        <input
          v-model="searchQuery"
          class="input-field"
          placeholder="查找内容..."
        />
        <input
          v-model="replaceQuery"
          class="input-field"
          placeholder="替换为..."
        />
        <button @click="doReplace" class="btn-primary">
          替换
        </button>
        <button @click="replaceAll" class="btn-primary">
          全部替换
        </button>
        <button @click="showReplace = false" class="px-4 py-2 bg-gray-200 rounded">
          取消
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { eventBus } from '../../core/event'

const content = ref('')
const showSearch = ref(false)
const showReplace = ref(false)
const searchQuery = ref('')
const replaceQuery = ref('')
const searchResult = ref('')

const hasContent = computed(() => content.value.length > 0)

const newFile = () => {
  if (content.value && !confirm('当前内容未保存，确定要新建吗？')) {
    return
  }
  content.value = ''
  eventBus.emit('text-editor:new')
}

const openFile = async () => {
  try {
    // TODO: 使用Tauri文件对话框
    // 模拟打开文件
    content.value = '这是一个示例文本文件。\n您可以在这里编辑内容。\n\n支持多行文本编辑。'
    eventBus.emit('text-editor:opened', { path: '模拟文件' })
  } catch (err) {
    alert('打开文件失败: ' + err.message)
  }
}

const saveFile = async () => {
  try {
    // TODO: 使用Tauri文件保存API
    console.log('保存文件:', content.value)
    eventBus.emit('text-editor:saved', {
      content: content.value,
      timestamp: new Date().toISOString()
    })
    alert('保存成功！')
  } catch (err) {
    alert('保存失败: ' + err.message)
  }
}

const searchText = () => {
  showSearch.value = true
  showReplace.value = false
  searchResult.value = ''
}

const replaceText = () => {
  showReplace.value = true
  showSearch.value = false
  searchResult.value = ''
}

const doSearch = () => {
  if (!searchQuery.value) return

  const index = content.value.indexOf(searchQuery.value)
  if (index !== -1) {
    searchResult.value = `找到匹配 (位置: ${index})`
  } else {
    searchResult.value = '未找到匹配'
  }
}

const doReplace = () => {
  if (!searchQuery.value) return

  content.value = content.value.replace(
    searchQuery.value,
    replaceQuery.value
  )
  doSearch()
}

const replaceAll = () => {
  if (!searchQuery.value) return

  const regex = new RegExp(searchQuery.value, 'g')
  content.value = content.value.replace(regex, replaceQuery.value)
  searchResult.value = '全部替换完成'
}

onMounted(() => {
  eventBus.on('file:open', ({ path }) => {
    // 从文件管理器打开文件
    console.log('从文件管理器打开:', path)
  })
})
</script>
