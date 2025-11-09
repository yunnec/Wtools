import type { PluginTestContext, PluginModule, PluginContext } from '../../../types/plugin'
import { eventBus } from '../event'
import { themeService } from '../theme'
import { configService } from '../config'

/**
 * 插件测试框架
 * 为插件开发者提供测试工具和模拟环境
 */
class PluginTestFrameworkImpl implements PluginTestContext {
  eventBus = eventBus
  theme = themeService
  config = configService

  /**
   * 创建模拟插件模块
   */
  createMockPlugin(): PluginModule {
    return {
      id: 'mock-plugin',
      component: {},
      meta: {
        id: 'mock-plugin',
        name: '模拟插件',
        version: '1.0.0',
        description: '用于测试的模拟插件'
      },
      async initialize(context: PluginContext) {
        context.logger.info('模拟插件初始化')
      },
      async destroy(context: PluginContext) {
        context.logger.info('模拟插件销毁')
      }
    }
  }

  /**
   * 等待事件触发
   */
  async waitForEvent(event: string, timeout: number = 5000): Promise<any> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        eventBus.off(event, handler)
        reject(new Error(`等待事件 ${event} 超时`))
      }, timeout)

      const handler = (data: any) => {
        clearTimeout(timer)
        eventBus.off(event, handler)
        resolve(data)
      }

      eventBus.once(event, handler)
    })
  }

  /**
   * 创建测试插件上下文
   */
  createTestContext(id: string, config: Record<string, any> = {}): PluginContext {
    return {
      id,
      services: {
        eventBus: this.eventBus,
        theme: this.theme,
        config: this.config
      },
      config,
      logger: {
        debug: (message, ...args) => console.debug(`[Test:${id}] ${message}`, ...args),
        info: (message, ...args) => console.info(`[Test:${id}] ${message}`, ...args),
        warn: (message, ...args) => console.warn(`[Test:${id}] ${message}`, ...args),
        error: (message, ...args) => console.error(`[Test:${id}] ${message}`, ...args)
      }
    }
  }

  /**
   * 模拟插件生命周期测试
   */
  async testLifecycle(module: PluginModule): Promise<{
    success: boolean
    errors: string[]
    timings: Record<string, number>
  }> {
    const errors: string[] = []
    const timings: Record<string, number> = {}
    const context = this.createTestContext(module.id)

    try {
      // 测试 beforeLoad 钩子
      if (module.hooks?.beforeLoad) {
        const start = performance.now()
        await module.hooks.beforeLoad(context)
        timings.beforeLoad = performance.now() - start
      }

      // 测试 initialize
      const initStart = performance.now()
      await module.initialize(context)
      timings.initialize = performance.now() - initStart

      // 测试 afterLoad 钩子
      if (module.hooks?.afterLoad) {
        const afterLoadStart = performance.now()
        await module.hooks.afterLoad(context)
        timings.afterLoad = performance.now() - afterLoadStart
      }

      // 测试 destroy
      const destroyStart = performance.now()
      await module.destroy(context)
      timings.destroy = performance.now() - destroyStart

      // 测试 beforeUnload 钩子
      if (module.hooks?.beforeUnload) {
        const beforeUnloadStart = performance.now()
        await module.hooks.beforeUnload(context)
        timings.beforeUnload = performance.now() - beforeUnloadStart
      }

      // 测试 afterUnload 钩子
      if (module.hooks?.afterUnload) {
        const afterUnloadStart = performance.now()
        await module.hooks.afterUnload(context)
        timings.afterUnload = performance.now() - afterUnloadStart
      }

      return {
        success: errors.length === 0,
        errors,
        timings
      }
    } catch (error) {
      errors.push((error as Error).message)
      return {
        success: false,
        errors,
        timings
      }
    }
  }

  /**
   * 模拟错误场景
   */
  async testErrorHandling(module: PluginModule): Promise<{
    success: boolean
    errorCaught: boolean
    errorMessage: string
  }> {
    const context = this.createTestContext(module.id)
    let errorCaught = false
    let errorMessage = ''

    try {
      if (module.hooks?.onError) {
        const testError = new Error('测试错误')
        await module.hooks.onError(testError, context)
        errorCaught = true
        errorMessage = testError.message
      }
    } catch (error) {
      errorMessage = (error as Error).message
    }

    return {
      success: errorCaught,
      errorCaught,
      errorMessage
    }
  }

  /**
   * 测试配置管理
   */
  testConfigHandling(module: PluginModule): {
    success: boolean
    schemaValid: boolean
    defaultsApplied: boolean
  } {
    const schema = module.meta.configSchema

    if (!schema) {
      return {
        success: true,
        schemaValid: false,
        defaultsApplied: false
      }
    }

    let schemaValid = true
    let defaultsApplied = true

    // 验证schema结构
    for (const [key, field] of Object.entries(schema)) {
      if (!field.type || field.default === undefined) {
        schemaValid = false
      }
    }

    return {
      success: schemaValid,
      schemaValid,
      defaultsApplied
    }
  }

  /**
   * 生成测试报告
   */
  generateTestReport(
    module: PluginModule,
    lifecycleResult: any,
    errorResult: any,
    configResult: any
  ): string {
    const report = `
# 插件测试报告

## 插件信息
- **ID**: ${module.meta.id}
- **名称**: ${module.meta.name}
- **版本**: ${module.meta.version}
- **作者**: ${module.meta.author || '未知'}

## 生命周期测试
- **状态**: ${lifecycleResult.success ? '✅ 通过' : '❌ 失败'}
- **错误**: ${lifecycleResult.errors.length > 0 ? lifecycleResult.errors.join(', ') : '无'}

### 性能指标
${Object.entries(lifecycleResult.timings || {}).map(([key, value]) =>
  `- ${key}: ${value.toFixed(2)}ms`
).join('\n')}

## 错误处理测试
- **状态**: ${errorResult.success ? '✅ 通过' : '❌ 失败'}
- **错误捕获**: ${errorResult.errorCaught ? '是' : '否'}
- **错误信息**: ${errorResult.errorMessage}

## 配置测试
- **状态**: ${configResult.success ? '✅ 通过' : '❌ 失败'}
- **Schema有效**: ${configResult.schemaValid ? '是' : '否'}
- **默认值应用**: ${configResult.defaultsApplied ? '是' : '否'}

## 总体评估
${lifecycleResult.success && errorResult.success && configResult.success ? '✅ 所有测试通过' : '❌ 部分测试失败'}
`

    return report
  }
}

// 导出单例实例
export const pluginTestFramework = new PluginTestFrameworkImpl()
export default pluginTestFramework
