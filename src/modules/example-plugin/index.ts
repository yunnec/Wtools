import { defineAsyncComponent } from 'vue'
import { pluginManager } from '../../core/plugin'
import type { PluginModule, PluginContext } from '../../types/plugin'

// 异步加载记事本组件
const NotePadComponent = defineAsyncComponent(() => import('./NotePad.vue'))

/**
 * 示例插件：简易记事本
 *
 * 本插件展示如何使用梧桐工具箱的插件 API：
 * - 上下文服务访问
 * - 配置管理
 * - 日志记录
 * - 生命周期钩子
 * - 事件监听与发送
 * - 错误处理
 */
const examplePluginModule: PluginModule = {
  id: 'example-plugin',
  component: NotePadComponent,
  meta: {
    id: 'example-plugin',
    name: '示例插件 - 简易记事本',
    version: '1.0.0',
    description: '一个展示插件 API 使用方法的示例插件',
    author: '梧桐工具箱团队',
    capabilities: [
      {
        name: 'data-persistence',
        description: '数据持久化',
        required: false
      },
      {
        name: 'event-listening',
        description: '监听和发送事件',
        required: true
      },
      {
        name: 'config-management',
        description: '配置管理',
        required: false
      }
    ],
    configSchema: {
      autoSave: {
        type: 'boolean',
        default: false,
        description: '自动保存笔记',
        required: false
      },
      fontSize: {
        type: 'number',
        default: 14,
        description: '编辑器字体大小',
        required: false
      },
      theme: {
        type: 'string',
        default: 'light',
        description: '编辑器主题',
        required: false,
        options: ['light', 'dark', 'auto']
      },
      maxNotes: {
        type: 'number',
        default: 100,
        description: '最大笔记数量',
        required: false
      }
    }
  },
  async initialize(context: PluginContext) {
    // 使用日志记录器
    context.logger.info('示例插件初始化中...')

    // 访问配置
    context.logger.debug('当前配置', context.config)

    // 验证必需配置
    if (context.config.maxNotes && context.config.maxNotes < 1) {
      throw new Error('最大笔记数必须大于 0')
    }

    // 监听事件
    setupEventListeners(context)

    // 发送就绪事件
    context.services.eventBus.emit('example-plugin:ready', {
      timestamp: Date.now(),
      config: context.config
    })

    context.logger.info('示例插件初始化完成')
  },
  async destroy(context: PluginContext) {
    context.logger.info('示例插件销毁中...')

    // 清理资源
    // 例如：清除定时器、关闭连接等

    context.logger.info('示例插件已销毁')
  },
  hooks: {
    /**
     * 插件加载前执行
     * 可以进行预检查、资源预分配等
     */
    beforeLoad(context: PluginContext) {
      context.logger.debug('准备加载示例插件')

      // 检查依赖
      if (context.config.maxNotes && context.config.maxNotes > 1000) {
        context.logger.warn('最大笔记数设置较高，可能影响性能')
      }
    },

    /**
     * 插件加载后执行
     * 可以进行初始化后的设置
     */
    afterLoad(context: PluginContext) {
      context.logger.info('示例插件加载完成')

      // 注册键盘快捷键
      context.services.eventBus.emit('shortcut:register', {
        id: 'example-plugin-toggle',
        keys: 'ctrl+shift+e',
        description: '切换示例插件'
      })
    },

    /**
     * 插件卸载前执行
     * 保存状态、清理资源
     */
    beforeUnload(context: PluginContext) {
      context.logger.debug('准备卸载示例插件')

      // 保存当前状态
      context.services.eventBus.emit('example-plugin:before-unload', {
        timestamp: Date.now()
      })
    },

    /**
     * 插件卸载后执行
     * 最终清理
     */
    afterUnload(context: PluginContext) {
      context.logger.info('示例插件已卸载')

      // 注销快捷键
      context.services.eventBus.emit('shortcut:unregister', {
        id: 'example-plugin-toggle'
      })
    },

    /**
     * 错误处理钩子
     * 记录错误、尝试恢复或优雅降级
     */
    onError(error: Error, context: PluginContext) {
      context.logger.error('示例插件发生错误', {
        message: error.message,
        stack: error.stack,
        timestamp: Date.now()
      })

      // 可以发送错误事件用于监控
      context.services.eventBus.emit('plugin:error', {
        pluginId: context.id,
        error: error.message,
        recoverable: true // 标记错误是否可恢复
      })
    }
  }
}

/**
 * 设置事件监听器
 */
function setupEventListeners(context: PluginContext) {
  // 监听主题变化
  context.services.eventBus.on('theme:changed', (theme: string) => {
    context.logger.debug('主题切换', theme)
  })

  // 监听应用事件
  context.services.eventBus.on('app:ready', () => {
    context.logger.info('收到应用就绪事件')
  })

  // 监听模块事件
  context.services.eventBus.on('module:opened', (data: { id: string }) => {
    context.logger.debug('模块已打开', data)
  })

  context.services.eventBus.on('module:closed', (data: { id: string }) => {
    context.logger.debug('模块已关闭', data)
  })

  // 监听插件相关事件
  context.services.eventBus.on('plugin:loaded', (data: { id: string; meta: any }) => {
    if (data.id !== context.id) {
      context.logger.debug('其他插件已加载', data.id)
    }
  })

  context.services.eventBus.on('plugin:unloaded', (data: { id: string }) => {
    if (data.id !== context.id) {
      context.logger.debug('其他插件已卸载', data.id)
    }
  })

  // 监听来自其他插件的自定义事件
  context.services.eventBus.on('note:created', (data: { timestamp: number }) => {
    context.logger.info('其他插件创建了新笔记', data)
  })

  context.services.eventBus.on('note:saved', (data: { index: number; title: string }) => {
    context.logger.debug('笔记已保存', data)
  })
}

// 注册插件
pluginManager.registerModule(examplePluginModule)

export default NotePadComponent
