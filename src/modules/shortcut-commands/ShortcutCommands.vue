<template>
  <div class="shortcut-commands p-6">
    <div class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">ADB 快捷指令</h2>
          <p class="text-gray-600 dark:text-gray-400">
            点击按钮快速执行ADB命令，无需记忆复杂命令
          </p>
        </div>
        <button
          @click="showCustomManager = true"
          class="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          管理自定义命令
          <span v-if="customCommandCount > 0" class="ml-2 px-2 py-0.5 bg-purple-700 text-white text-xs rounded-full">
            {{ customCommandCount }}
          </span>
        </button>
      </div>
    </div>

    <!-- 开发模式提示 -->
    <div v-if="!isTauri" class="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
      <div class="flex items-start">
        <svg class="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
        </svg>
        <div>
          <h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-200">开发模式提示</h3>
          <p class="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
            您当前在Web开发模式，ADB命令执行功能需要在Tauri桌面应用中使用。
            请运行 <code class="px-1 py-0.5 bg-yellow-100 dark:bg-yellow-800 rounded text-xs">npm run tauri dev</code> 启动完整的桌面应用。
          </p>
        </div>
      </div>
    </div>

    <!-- 搜索框 -->
    <div class="mb-6">
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索命令..."
          class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <svg
          class="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    </div>

    <!-- 命令分类标签 -->
    <div class="mb-6">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="category in allCategories"
          :key="category"
          @click="selectedCategory = category"
          :class="selectedCategory === category
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {{ category }}
        </button>
      </div>
    </div>

    <!-- 命令列表 -->
    <div class="space-y-4">
      <div
        v-for="group in filteredCommands"
        :key="group.category"
        class="card"
      >
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
          <span class="text-2xl mr-2">{{ group.icon }}</span>
          {{ group.category }}
        </h3>
        <div class="space-y-3">
          <div
            v-for="cmd in group.commands"
            :key="cmd.name"
            class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <div class="flex items-start justify-between mb-2">
              <div class="flex-1">
                <div class="font-medium text-gray-900 dark:text-gray-100">{{ cmd.name }}</div>
                <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ cmd.description }}</div>
              </div>
              <button
                  @click="editCommand(cmd, group.category)"
                  class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  ✏️ 编辑
                </button>
                <button
                  @click="executeCommand(cmd.command)"
                :disabled="isExecuting || !isTauri"
                class="ml-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <svg
                  v-if="isExecuting && executingCommand === cmd.name"
                  class="animate-spin h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                <span v-else>▶</span>
                {{ isTauri ? '执行' : '演示' }}
              </button>
            </div>
            <code class="block p-2 bg-gray-900 dark:bg-gray-900 text-green-400 rounded text-sm font-mono overflow-x-auto">
              {{ cmd.command }}
            </code>
          </div>
        </div>
      </div>
    </div>

    <!-- 执行结果模态框 -->
    <div
      v-if="showResult"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click.self="showResult = false"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-auto">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">执行结果</h3>
          <button
            @click="showResult = false"
            class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div
          :class="resultSuccess
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'"
          class="p-4 rounded-lg border"
        >
          <pre class="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono">{{ resultMessage }}</pre>
        </div>
        <div class="mt-4 flex justify-end">
          <button
            @click="showResult = false"
            class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            关闭
          </button>
        </div>
      </div>
    </div>

    <!-- 自定义命令管理模态框 -->
    <CustomCommandManager
      v-if="showCustomManager"
      :visible="showCustomManager"
      @close="showCustomManager = false"
      @update="refreshCategoryOrder"
    />
  </div>
  <!-- 编辑命令模态框 -->
  <div v-if="showEditModal && editingCommand" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl">
      <div class="p-6 border-b">
        <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">编辑命令</h3>
      </div>
      <div class="p-6">
        <form @submit.prevent="saveEdit(editingForm)" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">名称</label>
            <input v-model="editingForm.name" type="text" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">描述</label>
            <input v-model="editingForm.description" type="text" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">命令</label>
            <textarea v-model="editingForm.command" rows="3" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-mono"></textarea>
          </div>
          <div class="flex gap-3 pt-4">
            <button type="submit" class="flex-1 bg-blue-500 text-white py-2 rounded-lg">保存</button>
            <button type="button" @click="closeEditModal" class="flex-1 bg-gray-500 text-white py-2 rounded-lg">取消</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { customCommandService } from './services/CustomCommandService'
import type { AdbCommand, CustomCommand, CustomCommandForm } from '@/types/adb-commands'
import { toastService } from '@/core/services/ToastService'

// 编辑功能相关变量
const showEditModal = ref(false)
const editingCommand = ref<AdbCommand | null>(null)
const isEditingPreset = ref(false)
const editingPresetId = ref<string | null>(null)
const editingForm = ref<CustomCommandForm>({ name: '', description: '', command: '', category: '', icon: '' })

const generatePresetId = (category: string, name: string, command: string): string => {
  const str = `${category}-${name}-${command}`
  // 使用 encodeURIComponent + btoa 处理 Unicode 字符（中文字符）
  const encoded = btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
    String.fromCharCode(parseInt(p1, 16))))
  return 'preset-' + encoded.replace(/=/g, '').substring(0, 16)
}
import CustomCommandManager from './components/CustomCommandManager.vue'
import { customCommandService } from './services/CustomCommandService'
import { eventBus } from '@/core/event'
import type { CustomCommand } from '@/types/adb-commands'

// 响应式数据
const searchQuery = ref('')
const selectedCategory = ref('全部')
const isExecuting = ref(false)
const executingCommand = ref('')
const showResult = ref(false)
const resultMessage = ref('')
const resultSuccess = ref(false)
const isTauri = ref(false)
const showCustomManager = ref(false)
const customCommands = ref<CustomCommand[]>([])

// 分类版本号（用于强制计算属性重新渲染）
const categoryVersion = ref(0)

// 分类列表
const categories = ['全部', '应用管理', '服务管理', '设备信息', '文件操作', '日志调试', '网络调试', '系统管理']

// 获取所有分类（包括自定义命令的分类）
const allCategories = computed(() => {
  console.log('[ShortcutCommands] allCategories 计算属性重新计算, version:', categoryVersion.value)
  // 获取排序后的预设分类
  const sortedCategories = customCommandService.getSortedCategories()

  // 获取自定义命令的分类
  const customCategories = [...new Set(customCommands.value.map(cmd => cmd.category))]

  // 只添加不与预设分类重复的分类
  const newCategories = customCategories.filter(cat => !sortedCategories.some(c => c.name === cat))

  // 返回完整分类列表（包括"全部"）
  return ['全部', ...sortedCategories.map(c => c.name), ...newCategories]
})

// 自定义命令数量
const customCommandCount = computed(() => customCommands.value.length)

// ADB命令数据 - 按排序后的分类创建分组
const commandGroups = computed(() => {
  // 依赖 categoryVersion 以强制重新计算
  console.log('[ShortcutCommands] commandGroups 计算属性重新计算, version:', categoryVersion.value)

  // 预设的分类定义
  const categoryMap = {
    '应用管理': '📱',
    '服务管理': '⚙️',
    '设备信息': 'ℹ️',
    '文件操作': '📁',
    '日志调试': '📝',
    '网络调试': '🌐',
    '系统管理': '🔧'
  }

  // 获取分类顺序
  const categoryOrder = customCommandService.getCategoryOrder()

  // 按顺序创建分组
  return categoryOrder.map(category => ({
    category,
    icon: categoryMap[category] || '✨',
    commands: getCommandsForCategory(category)
  }))
})

// 获取特定分类的预设命令
const getCommandsForCategory = (category: string) => {
  const commands: Record<string, any[]> = {
    '应用管理': [
      {
        name: '启动应用',
        description: '启动指定的应用',
        command: 'adb shell am start -n com.tinnove.wecarspeech/.app.MainActivity'
      },
      {
        name: '强制停止应用',
        description: '强制停止指定应用',
        command: 'adb shell am force-stop com.tinnove.wecarspeech'
      },
      {
        name: '重启应用',
        description: '先停止再启动应用',
        command: 'adb shell am start -S com.tinnove.wecarspeech/.app.MainActivity'
      },
      {
        name: '安装应用',
        description: '安装APK文件(-r覆盖 -d允许降级)',
        command: 'adb install -r -d -f -t Tspeech.apk'
      },
      {
        name: '卸载应用',
        description: '卸载指定应用',
        command: 'adb uninstall com.tinnove.wecarspeech'
      },
      {
        name: '查看应用版本',
        description: '获取应用版本信息',
        command: 'adb shell dumpsys package com.tinnove.wecarspeech | findstr version'
      }
    ],
    '服务管理': [
      {
        name: '启动服务',
        description: '启动指定服务并传递参数',
        command: 'adb shell am startservice -n com.tinnove.wecarspeech/com.tinnove.vrlogic.server.ExtraService --es nluStr "语音交互等多轮对话系统"'
      }
    ],
    '设备信息': [
      {
        name: '列出设备',
        description: '查看所有连接的设备',
        command: 'adb devices'
      },
      {
        name: '查看设备型号',
        description: '获取设备型号信息',
        command: 'adb shell getprop ro.product.model'
      },
      {
        name: '查看Android版本',
        description: '获取Android系统版本',
        command: 'adb shell getprop ro.build.version.release'
      },
      {
        name: '查看系统信息',
        description: '获取完整的系统属性信息',
        command: 'adb shell getprop'
      }
    ],
    '文件操作': [
      {
        name: '推送文件到设备',
        description: '将本地文件推送到设备',
        command: 'adb push <本地路径> <设备路径>'
      },
      {
        name: '从设备拉取文件',
        description: '从设备下载文件到本地',
        command: 'adb pull <设备路径> <本地路径>'
      },
      {
        name: '查看设备文件',
        description: '列出设备上的文件',
        command: 'adb shell ls /sdcard/'
      },
      {
        name: '创建目录',
        description: '在设备上创建目录',
        command: 'adb shell mkdir /sdcard/test'
      }
    ],
    '日志调试': [
      {
        name: '查看实时日志',
        description: '显示设备的实时日志',
        command: 'adb logcat'
      },
      {
        name: '清除日志',
        description: '清除设备上的日志缓存',
        command: 'adb logcat -c'
      },
      {
        name: '过滤日志标签',
        description: '只显示特定标签的日志',
        command: 'adb logcat -s TAG_NAME'
      },
      {
        name: '保存日志到文件',
        description: '将日志保存到本地文件',
        command: 'adb logcat > logcat.txt'
      },
      {
        name: '打开日志测试页',
        description: '启动应用内的日志测试页面',
        command: 'adb shell am start -n com.tinnove.wecarspeech/com.tinnove.vrclient.test.LogTestActivity'
      }
    ],
    '网络调试': [
      {
        name: '启用TCP/IP模式',
        description: '在指定端口启用TCP/IP调试',
        command: 'adb tcpip 5555'
      },
      {
        name: 'WiFi连接设备',
        description: '通过WiFi连接到设备',
        command: 'adb connect <设备IP>'
      },
      {
        name: '断开WiFi连接',
        description: '断开WiFi连接',
        command: 'adb disconnect <设备IP>'
      },
      {
        name: '端口转发',
        description: '将设备端口转发到本地',
        command: 'adb forward tcp:8080 tcp:8080'
      }
    ],
    '系统管理': [
      {
        name: '查看进程',
        description: '显示设备上运行的进程',
        command: 'adb shell top'
      },
      {
        name: '查看磁盘使用',
        description: '显示磁盘空间使用情况',
        command: 'adb shell df'
      },
      {
        name: '查看内存信息',
        description: '显示系统内存详细信息',
        command: 'adb shell cat /proc/meminfo'
      },
      {
        name: '查看应用内存',
        description: '显示指定应用的内存使用',
        command: 'adb shell dumpsys meminfo <包名>'
      },
      {
        name: '截屏',
        description: '截取当前屏幕并保存',
        command: 'adb shell screencap /sdcard/screen.png'
      },
      {
        name: '录屏',
        description: '录制屏幕操作',
        command: 'adb shell screenrecord /sdcard/demo.mp4'
      },
      {
        name: '连续操作：重启应用',
        description: '停止并重启应用',
        command: 'adb shell am force-stop com.tinnove.wecarspeech; adb shell am start -S com.tinnove.wecarspeech/.app.MainActivity'
      }
    ]
  }

  return commands[category] || []
}


// 过滤后的命令
const filteredCommands = computed(() => {
  // 克隆预设命令分组
  const allGroups = commandGroups.value.map(group => ({
    ...group,
    commands: [...group.commands]
  }))

  // 将自定义命令合并到对应的分类分组中
  customCommands.value.forEach(cmd => {
    const existingGroup = allGroups.find(g => g.category === cmd.category)
    if (existingGroup) {
      // 查找是否有相同的预设命令需要替换
      const presetIndex = existingGroup.commands.findIndex((c, idx) => {
        // 通过 presetId 匹配，或者通过名称+描述+命令匹配
        const cmdId = cmd.presetId
        const presetId = generatePresetId(cmd.category, c.name, c.command)
        return (cmdId && c.presetId === cmdId) ||
               (!c.isCustom && c.name === cmd.name && c.description === cmd.description && c.command === cmd.command)
      })

      if (presetIndex !== -1) {
        // 替换现有的预设命令
        existingGroup.commands[presetIndex] = {
          name: cmd.name,
          description: cmd.description,
          command: cmd.command,
          isCustom: true,
          presetId: cmd.presetId
        }
      } else {
        // 添加新命令
        existingGroup.commands.push({
          name: cmd.name,
          description: cmd.description,
          command: cmd.command,
          isCustom: true,
          presetId: cmd.presetId
        })
      }
    } else {
      // 创建新的分类分组
      allGroups.push({
        category: cmd.category,
        icon: cmd.icon || '✨',
        commands: [{
          name: cmd.name,
          description: cmd.description,
          command: cmd.command,
          isCustom: true,
          presetId: cmd.presetId
        }]
      })
    }
  })

  // 按分类过滤
  let filtered = allGroups
  if (selectedCategory.value !== '全部') {
    filtered = allGroups.filter(group => group.category === selectedCategory.value)
  }

  // 按搜索词过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.map(group => ({
      ...group,
      commands: group.commands.filter(cmd =>
        cmd.name.toLowerCase().includes(query) ||
        cmd.description.toLowerCase().includes(query) ||
        cmd.command.toLowerCase().includes(query)
      )
    })).filter(group => group.commands.length > 0)
  }

  return filtered
})

// 执行命令
const executeCommand = async (command) => {
  if (isExecuting.value) return

  // 在开发模式下，显示演示提示
  if (!isTauri.value) {
    resultMessage.value = `演示模式：命令将在这里执行\n\n${command}\n\n在Tauri桌面应用中，此命令将通过Rust后端执行并返回结果。`
    resultSuccess.value = true
    showResult.value = true
    return
  }

  try {
    isExecuting.value = true
    executingCommand.value = command
    showResult.value = false

    // 动态导入 Tauri API
    const { invoke } = await import('@tauri-apps/api/core')
    
    // 调用Tauri后端命令
    const result = await invoke('execute_command', { command })

    resultMessage.value = result
    resultSuccess.value = true
    showResult.value = true
  } catch (error) {
    resultMessage.value = `执行错误: ${error}`
    resultSuccess.value = false
    showResult.value = true
  } finally {
    isExecuting.value = false
    executingCommand.value = ''
  }
}

// 加载自定义命令
const loadCustomCommands = () => {
  customCommands.value = customCommandService.getAll()
}

// 编辑命令
const editCommand = (cmd, category) => {
  console.log('[ShortcutCommands] 编辑命令:', cmd.name)
  editingCommand.value = cmd
  isEditingPreset.value = !cmd.isCustom
  editingPresetId.value = cmd.presetId || (isEditingPreset.value ? generatePresetId(category, cmd.name, cmd.command) : null)
  editingForm.value = {
    name: cmd.name,
    description: cmd.description,
    command: cmd.command,
    category: category,
    icon: '📱'
  }
  showEditModal.value = true
}

// 关闭编辑模态框
const closeEditModal = () => {
  showEditModal.value = false
  editingCommand.value = null
  isEditingPreset.value = false
  editingPresetId.value = null
  editingForm.value = { name: '', description: '', command: '', category: '', icon: '' }
}

// 保存编辑
const saveEdit = (form) => {
  try {
    console.log('[ShortcutCommands] 保存编辑:', form.name)

    const now = new Date().toISOString()
    const customCmd = {
      id: editingPresetId.value || `custom-${Date.now()}`,
      name: form.name,
      description: form.description,
      command: form.command,
      category: form.category,
      icon: form.icon || '📱',
      presetId: editingPresetId.value || null,
      createdAt: editingCommand.value?.createdAt || now,
      updatedAt: now
    }

    // 使用自定义命令服务保存
    customCommandService.upsert(customCmd)
    console.log('[ShortcutCommands] 命令保存成功')

    // 显示成功提示
    toastService.success('命令保存成功')

    // 关闭模态框并刷新
    closeEditModal()
    loadCustomCommands()

    // 触发分类顺序刷新
    eventBus.emit('adb:categoryOrderChanged')
  } catch (error) {
    console.error('[ShortcutCommands] 保存失败:', error)
    toastService.error('保存失败: ' + error.message)
  }
}

// 刷新分类排序（当排序更改时调用）
const refreshCategoryOrder = () => {
  console.log('[ShortcutCommands] refreshCategoryOrder 被调用')
  // 强制重新计算分类
  // 通过重新触发 allCategories 的计算属性
  selectedCategory.value = '全部'
  loadCustomCommands()
  console.log('[ShortcutCommands] refreshCategoryOrder 完成')
}

// 监听分类顺序变化事件
const handleCategoryOrderChange = () => {
  console.log('[ShortcutCommands] handleCategoryOrderChange 收到事件!')
  refreshCategoryOrder()
}

// 组件挂载
onMounted(() => {
  // 检查是否在 Tauri 环境中
  if (typeof window !== 'undefined' && window.__TAURI__) {
    isTauri.value = true
    console.log('ADB快捷指令模块已加载 (Tauri模式)')
  } else {
    // 在 Web 开发模式
    isTauri.value = false
    console.log('ADB快捷指令模块已加载 (Web演示模式)')
  }

  // 加载自定义命令
  loadCustomCommands()

  // 监听分类顺序变化事件
  console.log('[ShortcutCommands] 正在注册事件监听器: adb:categoryOrderChanged')
  eventBus.on('adb:categoryOrderChanged', handleCategoryOrderChange)
  console.log('[ShortcutCommands] 事件监听器注册完成')

  // 监听配置变化事件（强制重新渲染）
  console.log('[ShortcutCommands] 正在注册事件监听器: config:changed')
  eventBus.on('config:changed', (data) => {
    console.log('[ShortcutCommands] 收到配置变化事件:', data)
    if (data.key === 'adb-category-order') {
      console.log('[ShortcutCommands] 分类顺序已变化，递增版本号并强制刷新')
      categoryVersion.value++
      console.log('[ShortcutCommands] categoryVersion 变为:', categoryVersion.value)
      loadCustomCommands()
    } else if (data.key === 'adb-custom-commands') {
      console.log('[ShortcutCommands] 自定义命令已变化，刷新数据')
      loadCustomCommands()
    }
  })
})
watch(showEditModal, (val) => {
  if (val && editingCommand.value) {
    editingForm.value = {
      name: editingCommand.value.name,
      description: editingCommand.value.description,
      command: editingCommand.value.command,
      category: '',
      icon: '📱'
    }
  }
})

// 组件卸载
onUnmounted(() => {
  // 移除事件监听器
  eventBus.off('adb:categoryOrderChanged', handleCategoryOrderChange)
})
</script>
