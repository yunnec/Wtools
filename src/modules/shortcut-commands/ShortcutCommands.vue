<template>
  <div class="shortcut-commands p-6">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">ADB 快捷指令</h2>
      <p class="text-gray-600 dark:text-gray-400">
        点击按钮快速执行ADB命令，无需记忆复杂命令
      </p>
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
          v-for="category in categories"
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 响应式数据
const searchQuery = ref('')
const selectedCategory = ref('全部')
const isExecuting = ref(false)
const executingCommand = ref('')
const showResult = ref(false)
const resultMessage = ref('')
const resultSuccess = ref(false)
const isTauri = ref(false)

// 分类列表
const categories = ['全部', '应用管理', '服务管理', '设备信息', '文件操作', '日志调试', '网络调试', '系统管理']

// ADB命令数据
const commandGroups = ref([
  {
    category: '应用管理',
    icon: '📱',
    commands: [
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
    ]
  },
  {
    category: '服务管理',
    icon: '⚙️',
    commands: [
      {
        name: '启动服务',
        description: '启动指定服务并传递参数',
        command: 'adb shell am startservice -n com.tinnove.wecarspeech/com.tinnove.vrlogic.server.ExtraService --es nluStr "语音交互等多轮对话系统"'
      }
    ]
  },
  {
    category: '设备信息',
    icon: 'ℹ️',
    commands: [
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
    ]
  },
  {
    category: '文件操作',
    icon: '📁',
    commands: [
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
    ]
  },
  {
    category: '日志调试',
    icon: '📝',
    commands: [
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
    ]
  },
  {
    category: '网络调试',
    icon: '🌐',
    commands: [
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
    ]
  },
  {
    category: '系统管理',
    icon: '🔧',
    commands: [
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
])

// 过滤后的命令
const filteredCommands = computed(() => {
  let filtered = commandGroups.value

  // 按分类过滤
  if (selectedCategory.value !== '全部') {
    filtered = filtered.filter(group => group.category === selectedCategory.value)
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

// 组件挂载

// 组件挂载
onMounted(() => {
  // 检查是否在 Tauri 环境中
  // 在 Tauri 2.0 中，可以通过检查 window.__TAURI__ 来判断
  if (typeof window !== 'undefined' && window.__TAURI__) {
    isTauri.value = true
    console.log('ADB快捷指令模块已加载 (Tauri模式)')
  } else {
    // 在 Web 开发模式
    isTauri.value = false
    console.log('ADB快捷指令模块已加载 (Web演示模式)')
  }
})
</script>
