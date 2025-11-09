/**
 * PluginManager 插件管理器单元测试
 * 测试插件的加载、卸载和生命周期管理
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { pluginManager } from '../../../src/core/plugin'
import type { PluginModule, PluginContext } from '../../../src/types/plugin'
import { createMockContext } from '../../../src/test/test-utils'

describe('PluginManager 插件管理器', () => {
  beforeEach(() => {
    // 清空插件管理器状态
    pluginManager.listPlugins().forEach(plugin => {
      pluginManager.unloadPlugin(plugin.meta.id)
    })
  })

  afterEach(() => {
    // 清理所有插件
    pluginManager.listPlugins().forEach(plugin => {
      pluginManager.unloadPlugin(plugin.meta.id)
    })
  })

  describe('registerModule() 方法', () => {
    it('应该能够注册插件模块', () => {
      const mockModule: PluginModule = {
        id: 'test-plugin',
        component: {},
        meta: {
          id: 'test-plugin',
          name: '测试插件',
          version: '1.0.0',
          description: '测试插件描述'
        },
        async initialize(context: PluginContext) {
          context.logger.info('插件初始化')
        },
        async destroy(context: PluginContext) {
          context.logger.info('插件销毁')
        }
      }

      pluginManager.registerModule(mockModule)

      const loadedModule = pluginManager.getModule('test-plugin')
      expect(loadedModule).toBe(mockModule)
    })

    it('应该能够注册多个插件模块', () => {
      const modules: PluginModule[] = [
        {
          id: 'plugin1',
          component: {},
          meta: { id: 'plugin1', name: '插件1', version: '1.0.0', description: '描述1' },
          async initialize(context: PluginContext) {},
          async destroy(context: PluginContext) {}
        },
        {
          id: 'plugin2',
          component: {},
          meta: { id: 'plugin2', name: '插件2', version: '1.0.0', description: '描述2' },
          async initialize(context: PluginContext) {},
          async destroy(context: PluginContext) {}
        }
      ]

      modules.forEach(module => pluginManager.registerModule(module))

      expect(pluginManager.getModule('plugin1')).toBe(modules[0])
      expect(pluginManager.getModule('plugin2')).toBe(modules[1])
    })
  })

  describe('loadPlugin() 方法', () => {
    it('应该能够加载已注册的插件', async () => {
      const mockModule: PluginModule = {
        id: 'test-plugin',
        component: {},
        meta: {
          id: 'test-plugin',
          name: '测试插件',
          version: '1.0.0',
          description: '测试插件描述'
        },
        async initialize(context: PluginContext) {
          context.logger.info('插件初始化')
        },
        async destroy(context: PluginContext) {
          context.logger.info('插件销毁')
        }
      }

      pluginManager.registerModule(mockModule)

      const plugin = await pluginManager.loadPlugin('test-plugin')

      expect(plugin.meta.id).toBe('test-plugin')
      expect(plugin.meta.name).toBe('测试插件')
    })

    it('应该能够传递配置给插件', async () => {
      const mockModule: PluginModule = {
        id: 'test-plugin',
        component: {},
        meta: {
          id: 'test-plugin',
          name: '测试插件',
          version: '1.0.0',
          description: '测试插件描述',
          configSchema: {
            testValue: {
              type: 'string',
              default: 'default',
              description: '测试值',
              required: false
            }
          }
        },
        async initialize(context: PluginContext) {
          expect(context.config.testValue).toBe('custom-value')
        },
        async destroy(context: PluginContext) {}
      }

      pluginManager.registerModule(mockModule)

      const config = { testValue: 'custom-value' }
      const plugin = await pluginManager.loadPlugin('test-plugin', config)

      expect(plugin.getConfig().testValue).toBe('custom-value')
    })

    it('不应该重复加载已加载的插件', async () => {
      const mockModule: PluginModule = {
        id: 'test-plugin',
        component: {},
        meta: {
          id: 'test-plugin',
          name: '测试插件',
          version: '1.0.0',
          description: '测试插件描述'
        },
        async initialize(context: PluginContext) {
          context.logger.info('插件初始化')
        },
        async destroy(context: PluginContext) {
          context.logger.info('插件销毁')
        }
      }

      pluginManager.registerModule(mockModule)

      const plugin1 = await pluginManager.loadPlugin('test-plugin')
      const plugin2 = await pluginManager.loadPlugin('test-plugin')

      expect(plugin1).toBe(plugin2) // 应该是同一个实例
    })

    it('应该抛出错误当尝试加载未注册的插件', async () => {
      await expect(pluginManager.loadPlugin('non-existent-plugin'))
        .rejects
        .toThrow('未找到插件模块')
    })
  })

  describe('unloadPlugin() 方法', () => {
    it('应该能够卸载已加载的插件', async () => {
      const mockModule: PluginModule = {
        id: 'test-plugin',
        component: {},
        meta: {
          id: 'test-plugin',
          name: '测试插件',
          version: '1.0.0',
          description: '测试插件描述'
        },
        async initialize(context: PluginContext) {
          context.logger.info('插件初始化')
        },
        async destroy(context: PluginContext) {
          context.logger.info('插件销毁')
        }
      }

      pluginManager.registerModule(mockModule)
      await pluginManager.loadPlugin('test-plugin')

      expect(pluginManager.listPlugins()).toHaveLength(1)

      await pluginManager.unloadPlugin('test-plugin')

      expect(pluginManager.listPlugins()).toHaveLength(0)
    })

    it('卸载不存在的插件不应该报错', async () => {
      await expect(pluginManager.unloadPlugin('non-existent-plugin'))
        .resolves
        .not.toThrow()
    })
  })

  describe('listPlugins() 方法', () => {
    it('应该返回空数组当没有插件加载', () => {
      const plugins = pluginManager.listPlugins()
      expect(plugins).toEqual([])
    })

    it('应该返回所有已加载的插件', async () => {
      const modules: PluginModule[] = [
        {
          id: 'plugin1',
          component: {},
          meta: { id: 'plugin1', name: '插件1', version: '1.0.0', description: '描述1' },
          async initialize(context: PluginContext) {},
          async destroy(context: PluginContext) {}
        },
        {
          id: 'plugin2',
          component: {},
          meta: { id: 'plugin2', name: '插件2', version: '1.0.0', description: '描述2' },
          async initialize(context: PluginContext) {},
          async destroy(context: PluginContext) {}
        }
      ]

      modules.forEach(module => pluginManager.registerModule(module))

      await pluginManager.loadPlugin('plugin1')
      await pluginManager.loadPlugin('plugin2')

      const plugins = pluginManager.listPlugins()
      expect(plugins).toHaveLength(2)
      expect(plugins.map(p => p.meta.id)).toContain('plugin1')
      expect(plugins.map(p => p.meta.id)).toContain('plugin2')
    })
  })

  describe('getModule() 方法', () => {
    it('应该返回已注册的模块', () => {
      const mockModule: PluginModule = {
        id: 'test-plugin',
        component: {},
        meta: {
          id: 'test-plugin',
          name: '测试插件',
          version: '1.0.0',
          description: '测试插件描述'
        },
        async initialize(context: PluginContext) {},
        async destroy(context: PluginContext) {}
      }

      pluginManager.registerModule(mockModule)

      const module = pluginManager.getModule('test-plugin')
      expect(module).toBe(mockModule)
    })

    it('应该返回undefined当模块不存在', () => {
      const module = pluginManager.getModule('non-existent-module')
      expect(module).toBeUndefined()
    })
  })

  describe('getPluginContext() 方法', () => {
    it('应该返回已加载插件的上下文', async () => {
      const mockModule: PluginModule = {
        id: 'test-plugin',
        component: {},
        meta: {
          id: 'test-plugin',
          name: '测试插件',
          version: '1.0.0',
          description: '测试插件描述'
        },
        async initialize(context: PluginContext) {
          expect(context.id).toBe('test-plugin')
          expect(context.services).toBeDefined()
          expect(context.config).toBeDefined()
          expect(context.logger).toBeDefined()
        },
        async destroy(context: PluginContext) {}
      }

      pluginManager.registerModule(mockModule)
      await pluginManager.loadPlugin('test-plugin')

      const context = pluginManager.getPluginContext('test-plugin')
      expect(context).toBeDefined()
      expect(context?.id).toBe('test-plugin')
    })
  })

  describe('validatePlugin() 方法', () => {
    it('应该验证有效的插件模块', async () => {
      const mockModule: PluginModule = {
        id: 'test-plugin',
        component: {},
        meta: {
          id: 'test-plugin',
          name: '测试插件',
          version: '1.0.0',
          description: '测试插件描述'
        },
        async initialize(context: PluginContext) {},
        async destroy(context: PluginContext) {}
      }

      const result = await pluginManager.validatePlugin(mockModule)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该验证无效的插件模块', async () => {
      const invalidModule: any = {
        id: '',
        component: null,
        meta: {
          id: '',
          name: '',
          version: '',
          description: ''
        },
        initialize: 'not a function',
        destroy: null
      }

      const result = await pluginManager.validatePlugin(invalidModule)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors).toContain('缺少插件ID')
      expect(result.errors).toContain('缺少插件元数据ID')
      expect(result.errors).toContain('缺少插件名称')
      expect(result.errors).toContain('缺少插件版本')
      expect(result.errors).toContain('缺少插件描述')
    })
  })

  describe('生命周期钩子', () => {
    it('应该执行beforeLoad钩子', async () => {
      const beforeLoadHook = vi.fn()
      const mockModule: PluginModule = {
        id: 'test-plugin',
        component: {},
        meta: {
          id: 'test-plugin',
          name: '测试插件',
          version: '1.0.0',
          description: '测试插件描述'
        },
        async initialize(context: PluginContext) {},
        async destroy(context: PluginContext) {},
        hooks: {
          beforeLoad: beforeLoadHook
        }
      }

      pluginManager.registerModule(mockModule)
      await pluginManager.loadPlugin('test-plugin')

      expect(beforeLoadHook).toHaveBeenCalledTimes(1)
    })

    it('应该执行afterLoad钩子', async () => {
      const afterLoadHook = vi.fn()
      const mockModule: PluginModule = {
        id: 'test-plugin',
        component: {},
        meta: {
          id: 'test-plugin',
          name: '测试插件',
          version: '1.0.0',
          description: '测试插件描述'
        },
        async initialize(context: PluginContext) {},
        async destroy(context: PluginContext) {},
        hooks: {
          afterLoad: afterLoadHook
        }
      }

      pluginManager.registerModule(mockModule)
      await pluginManager.loadPlugin('test-plugin')

      expect(afterLoadHook).toHaveBeenCalledTimes(1)
    })

    it('应该执行onError钩子', async () => {
      const onErrorHook = vi.fn()
      const mockModule: PluginModule = {
        id: 'test-plugin',
        component: {},
        meta: {
          id: 'test-plugin',
          name: '测试插件',
          version: '1.0.0',
          description: '测试插件描述'
        },
        async initialize(context: PluginContext) {
          throw new Error('测试错误')
        },
        async destroy(context: PluginContext) {},
        hooks: {
          onError: onErrorHook
        }
      }

      pluginManager.registerModule(mockModule)

      await expect(pluginManager.loadPlugin('test-plugin'))
        .rejects
        .toThrow('测试错误')

      expect(onErrorHook).toHaveBeenCalledTimes(1)
    })
  })

  describe('配置管理', () => {
    it('应该合并默认配置和传入的配置', async () => {
      const mockModule: PluginModule = {
        id: 'test-plugin',
        component: {},
        meta: {
          id: 'test-plugin',
          name: '测试插件',
          version: '1.0.0',
          description: '测试插件描述',
          configSchema: {
            defaultValue: {
              type: 'string',
              default: 'default',
              description: '默认值',
              required: false
            },
            customValue: {
              type: 'string',
              default: 'default-custom',
              description: '自定义值',
              required: false
            }
          }
        },
        async initialize(context: PluginContext) {
          expect(context.config.defaultValue).toBe('default')
          expect(context.config.customValue).toBe('overridden')
        },
        async destroy(context: PluginContext) {}
      }

      pluginManager.registerModule(mockModule)
      const plugin = await pluginManager.loadPlugin('test-plugin', {
        customValue: 'overridden'
      })

      expect(plugin.getConfig().defaultValue).toBe('default')
      expect(plugin.getConfig().customValue).toBe('overridden')
    })

    it('应该支持运行时更新配置', async () => {
      const mockModule: PluginModule = {
        id: 'test-plugin',
        component: {},
        meta: {
          id: 'test-plugin',
          name: '测试插件',
          version: '1.0.0',
          description: '测试插件描述',
          configSchema: {
            value: {
              type: 'string',
              default: 'initial',
              description: '测试值',
              required: false
            }
          }
        },
        async initialize(context: PluginContext) {},
        async destroy(context: PluginContext) {}
      }

      pluginManager.registerModule(mockModule)
      const plugin = await pluginManager.loadPlugin('test-plugin')

      expect(plugin.getConfig().value).toBe('initial')

      plugin.setConfig({ value: 'updated' })
      expect(plugin.getConfig().value).toBe('updated')
    })
  })
})
