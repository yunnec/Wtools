# 梧桐工具箱插件开发指南

## 目录
1. [概述](#概述)
2. [快速开始](#快速开始)
3. [插件结构](#插件结构)
4. [插件 API](#插件-api)
5. [生命周期管理](#生命周期管理)
6. [配置管理](#配置管理)
7. [事件系统](#事件系统)
8. [服务访问](#服务访问)
9. [错误处理](#错误处理)
10. [测试指南](#测试指南)
11. [最佳实践](#最佳实践)
12. [常见问题](#常见问题)

## 概述

梧桐工具箱采用微内核+插件架构，支持模块化扩展。本指南将帮助您开发高质量的插件。

### 核心特性
- **模块化设计**：每个插件独立开发、测试和部署
- **生命周期管理**：完整的加载、初始化、销毁流程
- **上下文隔离**：每个插件拥有独立的执行上下文
- **配置管理**：支持配置 schema 和默认值
- **事件驱动**：通过事件总线进行模块间通信
- **类型安全**：完整的 TypeScript 类型定义

## 快速开始

### 创建插件项目
```bash
# 在 src/modules 目录下创建新插件
mkdir src/modules/my-plugin
cd src/modules/my-plugin
```

### 基础插件结构
```typescript
import { defineAsyncComponent } from 'vue'
import { pluginManager } from '../../core/plugin'
import type { PluginModule, PluginContext } from '../../types/plugin'

// 1. 创建 Vue 组件
const MyPluginComponent = defineAsyncComponent(() => import('./MyPlugin.vue'))

// 2. 定义插件模块
const myPluginModule: PluginModule = {
  id: 'my-plugin',
  component: MyPluginComponent,
  meta: {
    id: 'my-plugin',
    name: '我的插件',
    version: '1.0.0',
    description: '插件描述',
    author: '作者名称'
  },
  async initialize(context: PluginContext) {
    context.logger.info('插件初始化')
    // 插件初始化逻辑
  },
  async destroy(context: PluginContext) {
    context.logger.info('插件销毁')
    // 清理资源
  }
}

// 3. 注册插件
pluginManager.registerModule(myPluginModule)

export default MyPluginComponent
```

## 插件结构

### 必需字段
- `id`: 插件唯一标识符
- `component`: Vue 组件
- `meta`: 插件元数据
  - `id`: 插件 ID
  - `name`: 插件名称
  - `version`: 版本号
  - `description`: 描述
  - `author`: 作者（可选）
- `initialize(context)`: 初始化方法
- `destroy(context)`: 销毁方法

### 可选字段
- `meta.capabilities`: 插件能力声明
- `meta.configSchema`: 配置 schema
- `hooks`: 生命周期钩子

## 插件 API

### PluginContext

每个插件都会获得一个 `PluginContext` 对象，包含：

```typescript
interface PluginContext {
  id: string                    // 插件 ID
  services: {                   // 可用服务
    eventBus: EventBus
    theme: ThemeService
    config: ConfigService
  }
  config: Record<string, any>   // 插件配置
  logger: PluginLogger          // 日志记录器
}
```

### 日志记录器

```typescript
context.logger.debug('调试信息')
context.logger.info('普通信息')
context.logger.warn('警告信息')
context.logger.error('错误信息')
```

## 生命周期管理

### 生命周期阶段

```
加载阶段
  ├─ beforeLoad (钩子)
  ├─ initialize (必需)
  └─ afterLoad (钩子)

卸载阶段
  ├─ beforeUnload (钩子)
  ├─ destroy (必需)
  └─ afterUnload (钩子)
```

### 生命周期钩子

```typescript
const myPluginModule: PluginModule = {
  // ... 其他字段

  hooks: {
    beforeLoad(context: PluginContext) {
      // 插件加载前执行
      context.logger.debug('准备加载插件')
    },

    afterLoad(context: PluginContext) {
      // 插件加载后执行
      context.logger.info('插件加载完成')
    },

    beforeUnload(context: PluginContext) {
      // 插件卸载前执行
      context.logger.debug('准备卸载插件')
    },

    afterUnload(context: PluginContext) {
      // 插件卸载后执行
      context.logger.info('插件已卸载')
    },

    onError(error: Error, context: PluginContext) {
      // 错误处理
      context.logger.error('插件发生错误', error)
    }
  }
}
```

### 最佳实践

1. **初始化阶段**
   - 监听必要的事件
   - 初始化资源
   - 注册事件处理器

2. **销毁阶段**
   - 移除事件监听器
   - 清理定时器
   - 释放资源

## 配置管理

### 定义配置 Schema

```typescript
const myPluginModule: PluginModule = {
  // ... 其他字段

  meta: {
    // ... 其他元数据

    configSchema: {
      autoSave: {
        type: 'boolean',
        default: false,
        description: '自动保存',
        required: false
      },
      apiKey: {
        type: 'string',
        default: '',
        description: 'API 密钥',
        required: true
      },
      maxItems: {
        type: 'number',
        default: 100,
        description: '最大项目数',
        required: false
      },
      theme: {
        type: 'string',
        default: 'light',
        description: '主题',
        required: false,
        options: ['light', 'dark']
      }
    }
  },

  async initialize(context: PluginContext) {
    // 访问配置
    if (context.config.autoSave) {
      context.logger.info('自动保存已启用')
    }

    const apiKey = context.config.apiKey
    if (!apiKey) {
      throw new Error('缺少 API 密钥')
    }
  }
}
```

### 配置类型

支持以下配置类型：
- `string`: 字符串
- `number`: 数字
- `boolean`: 布尔值
- `array`: 数组
- `object`: 对象

### 配置字段属性

- `type`: 字段类型
- `default`: 默认值
- `description`: 描述
- `required`: 是否必需
- `options`: 可选值（仅用于 string 类型）

## 事件系统

### 发送事件

```typescript
// 在插件中发送事件
context.services.eventBus.emit('my-plugin:action', {
  data: 'some data'
})
```

### 监听事件

```typescript
async initialize(context: PluginContext) {
  // 监听单个事件
  context.services.eventBus.on('app:ready', (data) => {
    context.logger.info('应用已就绪', data)
  })

  // 监听一次性事件
  context.services.eventBus.once('module:opened', (data) => {
    context.logger.info('模块已打开', data)
  })
}

async destroy(context: PluginContext) {
  // 移除事件监听器
  context.services.eventBus.off('app:ready')
}
```

### 常用事件

- `app:ready`: 应用启动完成
- `theme:changed`: 主题切换
- `module:opened`: 模块打开
- `module:closed`: 模块关闭
- `plugin:loaded`: 插件加载
- `plugin:unloaded`: 插件卸载

## 服务访问

### 主题服务

```typescript
// 获取当前主题
const isDark = context.services.theme.theme === 'dark'

// 切换主题
context.services.theme.toggleTheme()

// 监听主题变化
context.services.theme.on('change', (theme) => {
  context.logger.debug('主题已切换为:', theme)
})
```

### 配置服务

```typescript
// 获取配置值
const value = context.services.config.get('key', 'defaultValue')

// 设置配置值
context.services.config.set('key', 'value')

// 获取所有配置
const allConfig = context.services.config.getAll()
```

## 错误处理

### 钩子错误处理

```typescript
hooks: {
  onError(error: Error, context: PluginContext) {
    // 记录错误
    context.logger.error('插件错误', error)

    // 可以发送错误事件
    context.services.eventBus.emit('plugin:error', {
      pluginId: context.id,
      error: error.message
    })
  }
}
```

### 初始化错误处理

```typescript
async initialize(context: PluginContext) {
  try {
    // 插件初始化逻辑
    await someAsyncOperation()
  } catch (error) {
    // 记录错误
    context.logger.error('初始化失败', error)

    // 重新抛出错误，触发 onError 钩子
    throw error
  }
}
```

## 测试指南

### 使用测试框架

```typescript
import { pluginTestFramework } from '../../core/plugin/PluginTestFramework'

// 创建测试插件
const testPlugin = pluginTestFramework.createMockPlugin()

// 测试生命周期
const lifecycleResult = await pluginTestFramework.testLifecycle(testPlugin)

// 测试错误处理
const errorResult = await pluginTestFramework.testErrorHandling(testPlugin)

// 测试配置处理
const configResult = pluginTestFramework.testConfigHandling(testPlugin)

// 生成测试报告
const report = pluginTestFramework.generateTestReport(
  testPlugin,
  lifecycleResult,
  errorResult,
  configResult
)

console.log(report)
```

### 单元测试示例

```typescript
import { describe, it, expect } from 'vitest'
import { pluginTestFramework } from '../../core/plugin/PluginTestFramework'
import myPlugin from './index'

describe('我的插件', () => {
  it('应该正确初始化', async () => {
    const context = pluginTestFramework.createTestContext('test-plugin')
    await myPlugin.initialize(context)
    expect(context.config).toBeDefined()
  })

  it('应该正确销毁', async () => {
    const context = pluginTestFramework.createTestContext('test-plugin')
    await myPlugin.destroy(context)
    // 验证清理逻辑
  })
})
```

## 最佳实践

### 1. 命名约定
- 插件 ID：使用短横线分隔（如 `my-awesome-plugin`）
- 事件名：使用冒号分隔命名空间（如 `plugin:action`）
- 配置键：使用小驼峰命名（如 `autoSave`）

### 2. 资源管理
```typescript
async initialize(context: PluginContext) {
  // 创建资源
  const timer = setInterval(() => {
    // 定时任务
  }, 1000)

  // 保存引用以便清理
  context.resources = { timer }
}

async destroy(context: PluginContext) {
  // 清理资源
  if (context.resources?.timer) {
    clearInterval(context.resources.timer)
  }
}
```

### 3. 错误恢复
```typescript
async initialize(context: PluginContext) {
  try {
    await riskyOperation()
  } catch (error) {
    context.logger.error('操作失败，使用默认方案', error)
    // 使用默认方案继续
  }
}
```

### 4. 性能优化
- 延迟加载非必需资源
- 使用防抖处理频繁事件
- 及时清理定时器和事件监听器

### 5. 日志记录
```typescript
// 好的实践
context.logger.info('用户执行了操作', { userId: 123 })

// 避免
context.logger.info('执行了操作')  // 信息不足
```

### 6. 配置验证
```typescript
async initialize(context: PluginContext) {
  const schema = this.meta.configSchema
  for (const [key, field] of Object.entries(schema)) {
    if (field.required && !context.config[key]) {
      throw new Error(`缺少必需配置: ${key}`)
    }
  }
}
```

## 常见问题

### Q: 如何处理插件依赖？
A: 在 `meta.dependencies` 中声明依赖的插件 ID，系统会在加载时检查依赖关系。

### Q: 插件之间如何通信？
A: 通过事件总线发送和监听自定义事件，确保事件名使用命名空间前缀。

### Q: 如何访问全局配置？
A: 使用 `context.services.config`，不要直接修改全局配置。

### Q: 插件加载失败怎么办？
A: 检查 `onError` 钩子中的错误日志，确保所有必需字段都已正确设置。

### Q: 如何调试插件？
A: 使用 `context.logger` 记录调试信息，或在浏览器开发者工具中查看日志。

## 示例插件

参考以下示例插件了解完整实现：
- `src/modules/text-editor` - 文本编辑器
- `src/modules/calculator` - 计算器
- `src/modules/json-tool` - JSON 工具

## 更多资源

- [API 参考文档](../api/plugin.md)
- [插件测试框架](./plugin-testing.md)
- [配置管理](./plugin-config.md)
