<template>
  <div class="text-diff p-6">
    <!-- 标题区 -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">文本差异对比</h2>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        输入两个文本来对比差异，绿色表示新增，红色表示删除
      </p>
    </div>

    <!-- 控制面板 -->
    <div class="card mb-4">
      <div class="flex flex-wrap gap-4 items-center justify-between">
        <!-- 左侧控制 -->
        <div class="flex flex-wrap gap-2 items-center">
          <!-- 对比模式切换 -->
          <div class="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              @click="compareMode = 'side-by-side'"
              :class="{
                'bg-white dark:bg-gray-600 shadow-sm': compareMode === 'side-by-side',
                'text-gray-600 dark:text-gray-400': compareMode !== 'side-by-side'
              }"
              class="px-4 py-2 rounded-md text-sm font-medium transition-all"
            >
              并排模式
            </button>
            <button
              @click="compareMode = 'inline'"
              :class="{
                'bg-white dark:bg-gray-600 shadow-sm': compareMode === 'inline',
                'text-gray-600 dark:text-gray-400': compareMode !== 'inline'
              }"
              class="px-4 py-2 rounded-md text-sm font-medium transition-all"
            >
              行内模式
            </button>
          </div>

          <!-- 对比粒度切换 -->
          <div class="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              @click="compareGranularity = 'line'"
              :class="{
                'bg-white dark:bg-gray-600 shadow-sm': compareGranularity === 'line',
                'text-gray-600 dark:text-gray-400': compareGranularity !== 'line'
              }"
              class="px-4 py-2 rounded-md text-sm font-medium transition-all"
            >
              行级对比
            </button>
            <button
              @click="compareGranularity = 'word'"
              :class="{
                'bg-white dark:bg-gray-600 shadow-sm': compareGranularity === 'word',
                'text-gray-600 dark:text-gray-400': compareGranularity !== 'word'
              }"
              class="px-4 py-2 rounded-md text-sm font-medium transition-all"
            >
              词级对比
            </button>
          </div>
        </div>

        <!-- 右侧操作按钮 -->
        <div class="flex gap-2">
          <button @click="compareNow" class="btn-primary" :disabled="!originalText && !modifiedText">
            {{ isComparing ? '对比中...' : '开始对比' }}
          </button>
          <button @click="clearAll" class="btn-primary">清空</button>
          <button @click="copyResult" class="btn-primary" :disabled="!hasResult">复制结果</button>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- 原始文本 -->
      <div class="card">
        <h3 class="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">原始文本</h3>
        <textarea
          v-model="originalText"
          class="w-full h-64 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="请输入原始文本..."
          @input="debouncedCompare"
        ></textarea>
        <div class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          字符数: {{ originalText.length }} | 行数: {{ originalText.split('\n').length }}
        </div>
      </div>

      <!-- 对比文本 -->
      <div class="card">
        <h3 class="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">对比文本</h3>
        <textarea
          v-model="modifiedText"
          class="w-full h-64 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="请输入对比文本..."
          @input="debouncedCompare"
        ></textarea>
        <div class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          字符数: {{ modifiedText.length }} | 行数: {{ modifiedText.split('\n').length }}
        </div>
      </div>
    </div>

    <!-- 对比结果展示区 -->
    <div class="card mb-4">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">对比结果</h3>
        <div v-if="stats" class="text-sm text-gray-600 dark:text-gray-400">
          <span class="inline-flex items-center gap-1 mr-4">
            <span class="w-3 h-3 bg-green-500 rounded"></span>
            新增: {{ stats.addedLines }}行
          </span>
          <span class="inline-flex items-center gap-1 mr-4">
            <span class="w-3 h-3 bg-red-500 rounded"></span>
            删除: {{ stats.removedLines }}行
          </span>
          <span class="inline-flex items-center gap-1">
            <span class="w-3 h-3 bg-yellow-500 rounded"></span>
            修改: {{ stats.modifiedLines }}行
          </span>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!hasResult" class="text-center py-20 text-gray-400">
        <svg class="w-20 h-20 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <div class="text-lg">请输入文本来查看差异</div>
      </div>

      <!-- 并排模式结果 -->
      <div v-else-if="compareMode === 'side-by-side' && sideBySidePairs.length > 0" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-200 dark:border-gray-700">
              <th class="text-left py-2 px-3 text-gray-600 dark:text-gray-400 w-20">行号</th>
              <th class="text-left py-2 px-3 text-gray-600 dark:text-gray-400">原始文本</th>
              <th class="text-left py-2 px-3 text-gray-600 dark:text-gray-400 w-20">行号</th>
              <th class="text-left py-2 px-3 text-gray-600 dark:text-gray-400">对比文本</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(pair, index) in sideBySidePairs"
              :key="index"
              class="border-b border-gray-100 dark:border-gray-800"
            >
              <td class="py-1 px-3 text-gray-500 dark:text-gray-500 font-mono text-xs">
                {{ pair.original?.lineNumber || '' }}
              </td>
              <td class="py-1 px-3 font-mono">
                <span v-if="pair.original" :class="getLineClass(pair.original.type)">
                  {{ pair.original.content || ' ' }}
                </span>
                <span v-else class="text-gray-300 dark:text-gray-700"> </span>
              </td>
              <td class="py-1 px-3 text-gray-500 dark:text-gray-500 font-mono text-xs">
                {{ pair.modified?.lineNumber || '' }}
              </td>
              <td class="py-1 px-3 font-mono">
                <span v-if="pair.modified" :class="getLineClass(pair.modified.type)">
                  {{ pair.modified.content || ' ' }}
                </span>
                <span v-else class="text-gray-300 dark:text-gray-700"> </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 行内模式结果 -->
      <div v-else-if="compareMode === 'inline' && inlineLines.length > 0" class="space-y-1 font-mono text-sm">
        <div
          v-for="(line, index) in inlineLines"
          :key="index"
          :class="getLineClass(line.type)"
          class="py-1 px-3 rounded"
        >
          <span v-if="line.lineNumber" class="text-gray-500 dark:text-gray-500 text-xs mr-4">
            {{ line.lineNumber }}
          </span>
          <span>{{ line.content || ' ' }}</span>
        </div>
      </div>

      <!-- 统计信息 -->
      <div v-if="stats && hasResult" class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div class="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
            <div class="text-2xl font-bold text-green-600">{{ stats.addedLines }}</div>
            <div class="text-gray-600 dark:text-gray-400">新增行数</div>
          </div>
          <div class="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
            <div class="text-2xl font-bold text-red-600">{{ stats.removedLines }}</div>
            <div class="text-gray-600 dark:text-gray-400">删除行数</div>
          </div>
          <div class="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
            <div class="text-2xl font-bold text-yellow-600">{{ stats.modifiedLines }}</div>
            <div class="text-gray-600 dark:text-gray-400">修改行数</div>
          </div>
          <div class="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
            <div class="text-2xl font-bold text-blue-600">{{ stats.unchangedLines }}</div>
            <div class="text-gray-600 dark:text-gray-400">未变化行数</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { DiffService } from './services/diff.service'
import type { CompareMode, CompareGranularity, DiffLine } from './types'

// 响应式数据
const originalText = ref('')
const modifiedText = ref('')
const compareMode = ref<CompareMode>('side-by-side')
const compareGranularity = ref<CompareGranularity>('line')
const isComparing = ref(false)

// 计算属性
const hasResult = computed(() => {
  return originalText.value.length > 0 || modifiedText.value.length > 0
})

const sideBySidePairs = computed(() => {
  if (!hasResult.value) return []
  return DiffService.generateSideBySide(originalText.value, modifiedText.value)
})

const inlineLines = computed(() => {
  if (!hasResult.value) return []
  return DiffService.generateInline(originalText.value, modifiedText.value)
})

const stats = computed(() => {
  if (!hasResult.value) return null
  return DiffService.calculateStats(originalText.value, modifiedText.value)
})

// 获取行的CSS类
const getLineClass = (type: string) => {
  switch (type) {
    case 'added':
      return 'diff-added'
    case 'removed':
      return 'diff-removed'
    case 'modified':
      return 'diff-modified'
    default:
      return ''
  }
}

// 防抖函数
let debounceTimer: number | null = null
const debouncedCompare = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  debounceTimer = window.setTimeout(() => {
    compareNow()
  }, 500)
}

// 执行对比
const compareNow = async () => {
  isComparing.value = true
  try {
    // 模拟异步操作，避免UI阻塞
    await new Promise(resolve => setTimeout(resolve, 10))
    // 对比逻辑在computed属性中自动执行
  } finally {
    isComparing.value = false
  }
}

// 清空所有文本
const clearAll = () => {
  originalText.value = ''
  modifiedText.value = ''
}

// 复制结果
const copyResult = async () => {
  try {
    let result = ''
    if (compareMode.value === 'side-by-side') {
      result = generateSideBySideText()
    } else {
      result = generateInlineText()
    }
    await navigator.clipboard.writeText(result)
    alert('结果已复制到剪贴板')
  } catch (err) {
    console.error('复制失败:', err)
    alert('复制失败，请手动选择复制')
  }
}

// 生成并排模式文本
const generateSideBySideText = () => {
  const pairs = sideBySidePairs.value
  let result = '文本差异对比报告 - 并排模式\n'
  result += '='.repeat(80) + '\n\n'

  for (const pair of pairs) {
    if (pair.original && pair.modified) {
      if (pair.original.type === 'unchanged') {
        result += `  ${String(pair.original.lineNumber).padStart(3)} | ${pair.original.content}\n`
        result += `  ${String(pair.modified.lineNumber).padStart(3)} | ${pair.modified.content}\n`
      } else if (pair.original.type === 'modified') {
        result += `- ${String(pair.original.lineNumber).padStart(3)} | ${pair.original.content}\n`
        result += `+ ${String(pair.modified.lineNumber).padStart(3)} | ${pair.modified.content}\n`
      }
    } else if (pair.original) {
      result += `- ${String(pair.original.lineNumber).padStart(3)} | ${pair.original.content}\n`
    } else if (pair.modified) {
      result += `+ ${String(pair.modified.lineNumber).padStart(3)} | ${pair.modified.content}\n`
    }
    result += '\n'
  }

  return result
}

// 生成行内模式文本
const generateInlineText = () => {
  const lines = inlineLines.value
  let result = '文本差异对比报告 - 行内模式\n'
  result += '='.repeat(80) + '\n\n'

  for (const line of lines) {
    const prefix = line.type === 'added' ? '+ ' : line.type === 'removed' ? '- ' : '  '
    result += `${prefix}${String(line.lineNumber).padStart(3)} | ${line.content}\n`
  }

  return result
}

// 监听模式变化，重新对比
watch([compareMode, compareGranularity], () => {
  if (hasResult.value) {
    compareNow()
  }
})
</script>

<style scoped>
.btn-primary {
  @apply px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed;
}

.card {
  @apply bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm;
}

.diff-added {
  @apply bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 px-1 rounded;
}

.diff-removed {
  @apply bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 px-1 rounded line-through;
}

.diff-modified {
  @apply bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 px-1 rounded;
}

.diff-added::before {
  content: '+ ';
  font-weight: bold;
}

.diff-removed::before {
  content: '- ';
  font-weight: bold;
}
</style>
