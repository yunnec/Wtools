import type {
  Plugin,
  PluginManager,
  PluginModule,
  PluginMeta,
  PluginContext,
  PluginLogger
} from '../../../types/plugin'
import { eventBus } from '../event'
import { themeService } from '../theme'
import { configService } from '../config'

/**
 * 插件管理器 - 管理插件的加载、卸载和生命周期
 * 支持插件上下文、生命周期钩子和配置管理
 */
class PluginManagerImpl implements PluginManager {
  private plugins = new Map<string, Plugin>()
  private modules = new Map<string, PluginModule>()
  private moduleRegistry = new Map<string, () => Promise<PluginModule>>()
  private contexts = new Map<string, PluginContext>()
  private pluginConfigs = new Map<string, Record<string, any>>()

  constructor() {
    eventBus.on('plugin:load', async (data: { id: string; config?: Record<string, any> }) => {
      try {
        await this.loadPlugin(data.id, data.config)
      } catch (error) {
        console.error(`加载插件失败: ${data.id}`, error)
        eventBus.emit('plugin:error', { id: data.id, error })
      }
    })

    eventBus.on('plugin:unload', async (id: string) => {
      try {
        await this.unloadPlugin(id)
      } catch (error) {
        console.error(`卸载插件失败: ${id}`, error)
        eventBus.emit('plugin:error', { id, error })
      }
    })
  }

  /**
   * 创建插件上下文
   */
  private createContext(id: string, config: Record<string, any>): PluginContext {
    const logger: PluginLogger = {
      debug: (message, ...args) => console.debug(`[Plugin:${id}] ${message}`, ...args),
      info: (message, ...args) => console.info(`[Plugin:${id}] ${message}`, ...args),
      warn: (message, ...args) => console.warn(`[Plugin:${id}] ${message}`, ...args),
      error: (message, ...args) => console.error(`[Plugin:${id}] ${message}`, ...args)
    }

    return {
      id,
      services: {
        eventBus,
        theme: themeService,
        config: configService
      },
      config,
      logger
    }
  }

  /**
   * 验证插件模块
   */
  async validatePlugin(module: PluginModule): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = []

    // 检查必需字段
    if (!module.id) {
      errors.push('缺少插件ID')
    }
    if (!module.meta) {
      errors.push('缺少插件元数据')
    } else {
      if (!module.meta.id) errors.push('缺少插件元数据ID')
      if (!module.meta.name) errors.push('缺少插件名称')
      if (!module.meta.version) errors.push('缺少插件版本')
      if (!module.meta.description) errors.push('缺少插件描述')
    }
    if (!module.component) {
      errors.push('缺少插件组件')
    }
    if (typeof module.initialize !== 'function') {
      errors.push('缺少initialize方法')
    }
    if (typeof module.destroy !== 'function') {
      errors.push('缺少destroy方法')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * 加载插件
   */
  async loadPlugin(id: string, config: Record<string, any> = {}): Promise<Plugin> {
    if (this.plugins.has(id)) {
      console.warn(`插件已加载: ${id}`)
      return this.plugins.get(id)!
    }

    // 检查模块注册
    if (!this.moduleRegistry.has(id)) {
      throw new Error(`未找到插件模块: ${id}`)
    }

    // 动态加载模块
    const moduleLoader = this.moduleRegistry.get(id)!
    const module = await moduleLoader()

    // 验证插件
    const validation = await this.validatePlugin(module)
    if (!validation.valid) {
      throw new Error(`插件验证失败: ${validation.errors.join(', ')}`)
    }

    // 合并默认配置
    const defaultConfig = this.extractDefaultConfig(module)
    const mergedConfig = { ...defaultConfig, ...config }
    this.pluginConfigs.set(id, mergedConfig)

    // 创建上下文
    const context = this.createContext(id, mergedConfig)
    this.contexts.set(id, context)

    // 创建插件实例
    const plugin: Plugin = {
      meta: module.meta,
      context,
      install: async (ctx: PluginContext) => {
        ctx.logger.info(`安装插件: ${module.meta.name}`)
      },
      initialize: async (ctx: PluginContext) => {
        try {
          // 执行beforeLoad钩子
          if (module.hooks?.beforeLoad) {
            await module.hooks.beforeLoad(ctx)
          }

          await module.initialize(ctx)
          this.modules.set(id, module)
          this.plugins.set(id, plugin)

          // 执行afterLoad钩子
          if (module.hooks?.afterLoad) {
            await module.hooks.afterLoad(ctx)
          }

          eventBus.emit('plugin:loaded', { id, meta: module.meta, config: mergedConfig })
          ctx.logger.info(`插件已加载: ${module.meta.name}`)
        } catch (error) {
          // 执行错误钩子
          if (module.hooks?.onError) {
            await module.hooks.onError(error as Error, ctx)
          }
          throw error
        }
      },
      destroy: async (ctx: PluginContext) => {
        try {
          // 执行beforeUnload钩子
          if (module.hooks?.beforeUnload) {
            await module.hooks.beforeUnload(ctx)
          }

          await module.destroy(ctx)
          this.modules.delete(id)
          this.plugins.delete(id)
          this.contexts.delete(id)
          this.pluginConfigs.delete(id)

          // 执行afterUnload钩子
          if (module.hooks?.afterUnload) {
            await module.hooks.afterUnload(ctx)
          }

          eventBus.emit('plugin:unloaded', { id })
          ctx.logger.info(`插件已卸载: ${module.meta.name}`)
        } catch (error) {
          // 执行错误钩子
          if (module.hooks?.onError) {
            await module.hooks.onError(error as Error, ctx)
          }
          throw error
        }
      },
      getModule: () => module,
      getConfig: () => {
        return this.pluginConfigs.get(id) || {}
      },
      setConfig: (newConfig: Record<string, any>) => {
        const current = this.pluginConfigs.get(id) || {}
        const merged = { ...current, ...newConfig }
        this.pluginConfigs.set(id, merged)
        if (this.contexts.has(id)) {
          this.contexts.get(id)!.config = merged
        }
      }
    }

    await plugin.initialize(context)
    return plugin
  }

  /**
   * 卸载插件
   */
  async unloadPlugin(id: string): Promise<void> {
    const plugin = this.plugins.get(id)
    if (!plugin) {
      console.warn(`插件未加载: ${id}`)
      return
    }

    await plugin.destroy(plugin.context)
  }

  /**
   * 列出所有已加载的插件
   */
  listPlugins(): Plugin[] {
    return Array.from(this.plugins.values())
  }

  /**
   * 注册模块
   */
  registerModule(module: PluginModule): void {
    this.moduleRegistry.set(module.id, async () => module)
  }

  /**
   * 获取模块
   */
  getModule(id: string): PluginModule | undefined {
    return this.modules.get(id)
  }

  /**
   * 获取插件上下文
   */
  getPluginContext(id: string): PluginContext | undefined {
    return this.contexts.get(id)
  }

  /**
   * 注册动态模块加载器
   */
  registerModuleLoader(id: string, loader: () => Promise<PluginModule>): void {
    this.moduleRegistry.set(id, loader)
  }

  /**
   * 提取默认配置
   */
  private extractDefaultConfig(module: PluginModule): Record<string, any> {
    const config: Record<string, any> = {}
    const schema = module.meta.configSchema

    if (schema) {
      Object.entries(schema).forEach(([key, field]) => {
        config[key] = field.default
      })
    }

    return config
  }
}

// 导出单例实例
export const pluginManager = new PluginManagerImpl()
export default pluginManager
