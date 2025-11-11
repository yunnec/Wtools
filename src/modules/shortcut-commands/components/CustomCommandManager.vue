<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" @click.self="close">
    <div class="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">管理自定义命令</h2>
          <button @click="close" class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <p class="text-gray-600 dark:text-gray-400 mt-2">添加、编辑或删除您的自定义ADB命令</p>
        <button
          @click="showCategoryOrder = !showCategoryOrder"
          class="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          {{ showCategoryOrder ? '隐藏' : '显示' }}分类排序
        </button>
      </div>

      <div class="flex-1 overflow-hidden flex flex-col">
        <div v-if="showCategoryOrder" class="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">分类排序</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">拖拽或使用按钮调整分类显示顺序</p>
          <div class="flex flex-wrap gap-2 mb-4">
            <div
              v-for="(category, index) in categoryOrder"
              :key="category"
              class="relative"
            >
              <div
                class="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center gap-2 cursor-move hover:shadow-md transition-shadow"
                draggable="true"
                @dragstart="handleDragStart(index)"
                @dragover.prevent
                @drop="handleDrop(index)"
              >
                <span class="text-lg">{{ getCategoryIcon(category) }}</span>
                <span class="text-sm font-medium">{{ category }}</span>
                <div class="flex gap-1 ml-2">
                  <button
                    @click="moveCategoryUp(index)"
                    :disabled="index === 0"
                    class="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="上移"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
                    </svg>
                  </button>
                  <button
                    @click="moveCategoryDown(index)"
                    :disabled="index === categoryOrder.length - 1"
                    class="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="下移"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <button
              @click="applyCategoryOrder"
              :disabled="!hasUnsavedChanges"
              class="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              应用排序
            </button>
            <span v-if="hasUnsavedChanges" class="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              有未保存的更改
            </span>
            <button
              @click="resetCategoryOrder"
              :disabled="!hasUnsavedChanges"
              class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              重置
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-hidden flex">
          <div class="w-2/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索命令..."
                class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent mr-4"
              />
              <button
                @click="openCreateForm"
                class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                新建命令
              </button>
              <button
                v-if="selectedIds.length > 0"
                @click="deleteMultiple"
                class="ml-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                删除选中 ({{ selectedIds.length }})
              </button>
            </div>

            <div class="flex-1 overflow-y-auto p-4">
              <div v-if="filteredCommands.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
                <svg class="h-16 w-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <p class="text-lg">暂无自定义命令</p>
                <p class="text-sm">点击"新建命令"开始添加</p>
              </div>

              <div v-else class="space-y-3">
                <div
                  v-for="cmd in filteredCommands"
                  :key="cmd.id"
                  :class="selectedIds.includes(cmd.id) ? 'ring-2 ring-blue-500' : ''"
                  class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div class="flex items-start gap-3">
                    <input
                      type="checkbox"
                      :checked="selectedIds.includes(cmd.id)"
                      @change="toggleSelect(cmd.id)"
                      class="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div class="flex-1 cursor-pointer" @click="openEditForm(cmd)">
                      <div class="flex items-center gap-2 mb-2">
                        <span class="text-xl">{{ cmd.icon }}</span>
                        <h3 class="font-semibold text-gray-900 dark:text-gray-100">{{ cmd.name }}</h3>
                        <span class="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">{{ cmd.category }}</span>
                      </div>
                      <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">{{ cmd.description }}</p>
                      <code class="block p-2 bg-gray-900 dark:bg-gray-900 text-green-400 rounded text-sm font-mono overflow-x-auto">
                        {{ cmd.command }}
                      </code>
                      <div class="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>创建：{{ formatDate(cmd.createdAt) }}</span>
                        <span>更新：{{ formatDate(cmd.updatedAt) }}</span>
                      </div>
                    </div>
                    <div class="flex gap-2">
                      <button
                        @click.stop="openEditForm(cmd)"
                        class="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors"
                        title="编辑"
                      >
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </button>
                      <button
                        @click.stop="deleteCommand(cmd.id)"
                        class="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors"
                        title="删除"
                      >
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="w-1/3 bg-gray-50 dark:bg-gray-900 p-6">
            <div v-if="!showForm" class="h-full flex items-center justify-center text-center">
              <div class="text-gray-500 dark:text-gray-400">
                <svg class="h-16 w-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <p>选择一个命令编辑</p>
                <p class="text-sm">或点击"新建命令"创建</p>
              </div>
            </div>

            <div v-else>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {{ isEditing ? '编辑命令' : '新建命令' }}
              </h3>

              <form @submit.prevent="saveCommand" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    命令名称 <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.name"
                    type="text"
                    required
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="例如：启动应用"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    命令描述 <span class="text-red-500">*</span>
                  </label>
                  <textarea
                    v-model="formData.description"
                    required
                    rows="3"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="简要描述这个命令的作用"
                  ></textarea>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    分类 <span class="text-red-500">*</span>
                  </label>
                  <select
                    v-model="formData.category"
                    required
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option v-for="cat in categories" :key="cat.name" :value="cat.name">
                      {{ cat.icon }} {{ cat.name }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    图标 <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.icon"
                    type="text"
                    required
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="例如：✨"
                  />
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">输入Emoji或特殊字符作为图标</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ADB命令 <span class="text-red-500">*</span>
                  </label>
                  <textarea
                    v-model="formData.command"
                    required
                    rows="4"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    placeholder="adb shell ..."
                  ></textarea>
                </div>

                <div class="flex gap-2 pt-4">
                  <button
                    type="submit"
                    :disabled="!formData.name || !formData.description || !formData.category || !formData.icon || !formData.command"
                    class="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                  >
                    {{ isEditing ? '更新' : '创建' }}
                  </button>
                  <button
                    type="button"
                    @click="resetForm"
                    class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    取消
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { customCommandService } from '../services/CustomCommandService'
import type { CustomCommand, CustomCommandForm } from '@/types/adb-commands'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
  update: []
}>()

const searchQuery = ref('')
const selectedIds = ref<string[]>([])
const showForm = ref(false)
const isEditing = ref(false)
const currentId = ref<string | null>(null)
const showCategoryOrder = ref(false)
const draggedIndex = ref<number | null>(null)

const formData = ref<CustomCommandForm>({
  name: '',
  description: '',
  command: '',
  category: '自定义',
  icon: '✨'
})

const commands = ref<CustomCommand[]>([])
const categories = customCommandService.getCategories()
const categoryOrder = ref<string[]>(customCommandService.getCategoryOrder())
const originalCategoryOrder = ref<string[]>(customCommandService.getCategoryOrder())

// 检查是否有未保存的更改
const hasUnsavedChanges = computed(() => {
  return JSON.stringify(categoryOrder.value) !== JSON.stringify(originalCategoryOrder.value)
})

const filteredCommands = computed(() => {
  if (!searchQuery.value) {
    return commands.value.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }

  const query = searchQuery.value.toLowerCase()
  return commands.value
    .filter(cmd =>
      cmd.name.toLowerCase().includes(query) ||
      cmd.description.toLowerCase().includes(query) ||
      cmd.command.toLowerCase().includes(query)
    )
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
})

const loadCommands = () => {
  commands.value = customCommandService.getAll()
}

const close = () => {
  // 如果有未保存的更改，先重置
  if (hasUnsavedChanges.value) {
    categoryOrder.value = [...originalCategoryOrder.value]
  }
  resetForm()
  emit('close')
}

// 应用分类排序
const applyCategoryOrder = () => {
  console.log('[CustomCommandManager] applyCategoryOrder 被调用, hasUnsavedChanges:', hasUnsavedChanges.value)
  if (!hasUnsavedChanges.value) {
    console.log('[CustomCommandManager] 没有未保存的更改，直接返回')
    return
  }

  console.log('[CustomCommandManager] 准备保存分类顺序:', categoryOrder.value)
  // 保存到配置服务（这会触发事件总线通知）
  customCommandService.setCategoryOrder(categoryOrder.value)

  // 更新原始顺序
  originalCategoryOrder.value = [...categoryOrder.value]

  // 通知自定义命令列表更新
  console.log('[CustomCommandManager] 发送 update 事件')
  emit('update')
  console.log('[CustomCommandManager] applyCategoryOrder 完成')
}

// 重置分类排序
const resetCategoryOrder = () => {
  categoryOrder.value = [...originalCategoryOrder.value]
}

const toggleSelect = (id: string) => {
  const index = selectedIds.value.indexOf(id)
  if (index === -1) {
    selectedIds.value.push(id)
  } else {
    selectedIds.value.splice(index, 1)
  }
}

const deleteMultiple = () => {
  if (confirm(`确定要删除选中的 ${selectedIds.value.length} 个命令吗？此操作不可恢复。`)) {
    customCommandService.deleteMultiple(selectedIds.value)
    selectedIds.value = []
    loadCommands()
    emit('update')
  }
}

const deleteCommand = (id: string) => {
  if (confirm('确定要删除这个命令吗？此操作不可恢复。')) {
    customCommandService.delete(id)
    loadCommands()
    emit('update')
  }
}

const openCreateForm = () => {
  isEditing.value = false
  currentId.value = null
  resetForm()
  showForm.value = true
}

const openEditForm = (cmd: CustomCommand) => {
  isEditing.value = true
  currentId.value = cmd.id
  formData.value = {
    name: cmd.name,
    description: cmd.description,
    command: cmd.command,
    category: cmd.category,
    icon: cmd.icon
  }
  showForm.value = true
}

const resetForm = () => {
  formData.value = {
    name: '',
    description: '',
    command: '',
    category: '自定义',
    icon: '✨'
  }
  showForm.value = false
  isEditing.value = false
  currentId.value = null
}

const saveCommand = () => {
  if (isEditing.value && currentId.value) {
    customCommandService.update(currentId.value, formData.value)
  } else {
    customCommandService.create(formData.value)
  }

  loadCommands()
  resetForm()
  emit('update')
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleDragStart = (index: number) => {
  draggedIndex.value = index
}

const handleDrop = (dropIndex: number) => {
  if (draggedIndex.value === null || draggedIndex.value === dropIndex) {
    draggedIndex.value = null
    return
  }

  const newOrder = [...categoryOrder.value]
  const draggedItem = newOrder.splice(draggedIndex.value, 1)[0]
  newOrder.splice(dropIndex, 0, draggedItem)

  categoryOrder.value = newOrder
  draggedIndex.value = null
}

const moveCategoryUp = (index: number) => {
  console.log('[CustomCommandManager] moveCategoryUp, index:', index)
  if (index === 0) return
  const newOrder = [...categoryOrder.value]
  const [item] = newOrder.splice(index, 1)
  newOrder.splice(index - 1, 0, item)
  categoryOrder.value = newOrder
  console.log('[CustomCommandManager] 移动后顺序:', newOrder)
}

const moveCategoryDown = (index: number) => {
  console.log('[CustomCommandManager] moveCategoryDown, index:', index)
  if (index === categoryOrder.value.length - 1) return
  const newOrder = [...categoryOrder.value]
  const [item] = newOrder.splice(index, 1)
  newOrder.splice(index + 1, 0, item)
  categoryOrder.value = newOrder
  console.log('[CustomCommandManager] 移动后顺序:', newOrder)
}

const getCategoryIcon = (category: string) => {
  const cat = categories.find(c => c.name === category)
  return cat?.icon || '✨'
}

onMounted(() => {
  if (props.visible) {
    loadCommands()
  }
})

watch(() => props.visible, (newVal) => {
  if (newVal) {
    loadCommands()
  }
})
</script>
