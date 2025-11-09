import { defineAsyncComponent } from 'vue'
import { pluginManager } from '../../core/plugin'
import type { PluginModule, PluginContext } from '../../types/plugin'

// 异步加载文本编辑器组件
const TextEditorComponent = defineAsyncComponent(() => import('./TextEditor.vue'))

// 定义文本编辑器模块
const textEditorModule: PluginModule = {
  id: 'text-editor',
  component: TextEditorComponent,
  meta: {
    id: 'text-editor',
    name: '文本编辑器',
    version: '1.0.0',
    description: '编辑和查看文本文件',
    author: '梧桐工具箱团队',
    capabilities: [
      {
        name: 'file-access',
        description: '访问文件系统',
        required: true
      },
      {
        name: 'event-listening',
        description: '监听和发送事件',
        required: true
      }
    ],
    configSchema: {
      autoSave: {
        type: 'boolean',
        default: false,
        description: '自动保存',
        required: false
      },
      fontSize: {
        type: 'number',
        default: 14,
        description: '字体大小',
        required: false
      },
      theme: {
        type: 'string',
        default: 'light',
        description: '编辑器主题',
        required: false,
        options: ['light', 'dark']
      }
    }
  },
  async initialize(context: PluginContext) {
    // 使用上下文提供的服务
    context.logger.info('文本编辑器模块初始化')

    // 监听主题变化
    context.services.eventBus.on('theme:changed', (theme) => {
      context.logger.debug(`主题已切换为: ${theme}`)
    })

    // 监听文本编辑器相关事件
    context.services.eventBus.on('text-editor:new', () => {
      context.logger.info('新建文本文件')
    })

    context.services.eventBus.on('text-editor:saved', (data) => {
      context.logger.info('文本已保存', data)
    })

    // 使用配置
    if (context.config.autoSave) {
      context.logger.info('自动保存已启用')
    }

    // 发送模块就绪事件
    context.services.eventBus.emit('module:ready', {
      id: this.id,
      meta: this.meta
    })
  },
  async destroy(context: PluginContext) {
    context.logger.info('文本编辑器模块销毁')
    // 清理资源
  },
  hooks: {
    beforeLoad(context: PluginContext) {
      context.logger.debug('准备加载文本编辑器')
    },
    afterLoad(context: PluginContext) {
      context.logger.info('文本编辑器加载完成')
    },
    beforeUnload(context: PluginContext) {
      context.logger.debug('准备卸载文本编辑器')
    },
    afterUnload(context: PluginContext) {
      context.logger.info('文本编辑器已卸载')
    },
    onError(error: Error, context: PluginContext) {
      context.logger.error('文本编辑器发生错误', error)
    }
  }
}

// 注册文本编辑器模块
pluginManager.registerModule(textEditorModule)

export default TextEditorComponent
