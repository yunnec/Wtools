/**
 * 测试工具函数
 * 为单元测试提供常用的工具和辅助函数
 */

import { mount, VueWrapper } from '@vue/test-utils'
import { Component } from 'vue'

/**
 * 创建模拟的插件上下文
 */
export function createMockContext(config: Record<string, any> = {}) {
  return {
    id: 'test-plugin',
    services: {
      eventBus: {
        on: vi.fn(),
        once: vi.fn(),
        emit: vi.fn(),
        off: vi.fn()
      },
      theme: {
        theme: 'light',
        toggleTheme: vi.fn(),
        setTheme: vi.fn()
      },
      config: {
        get: vi.fn((key: string, defaultValue?: any) => defaultValue),
        set: vi.fn(),
        getAll: vi.fn(() => ({}))
      }
    },
    config,
    logger: {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    }
  }
}

/**
 * 创建一个带模拟上下文的Vue组件包装器
 */
export function mountWithContext(
  component: Component,
  context: any = createMockContext(),
  options: any = {}
): VueWrapper {
  return mount(component, {
    global: {
      provide: {
        context
      }
    },
    ...options
  })
}

/**
 * 等待一个Tick
 */
export async function nextTick() {
  await new Promise(resolve => setTimeout(resolve, 0))
}

/**
 * 等待指定的毫秒数
 */
export function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 创建模拟事件
 */
export function createMockEvent(eventName: string, data: any = {}) {
  return {
    event: eventName,
    data,
    timestamp: Date.now()
  }
}

/**
 * 模拟DOM事件
 */
export function createDomEvent(type: string, options: any = {}) {
  return new Event(type, {
    bubbles: true,
    cancelable: true,
    ...options
  })
}

/**
 * 生成随机测试数据
 */
export function generateTestData() {
  return {
    string: Math.random().toString(36).substring(7),
    number: Math.floor(Math.random() * 1000),
    boolean: Math.random() > 0.5,
    array: Array.from({ length: 5 }, () => Math.random()),
    object: {
      key1: Math.random().toString(36).substring(7),
      key2: Math.floor(Math.random() * 1000),
      key3: { nested: Math.random().toString(36).substring(7) }
    }
  }
}

/**
 * 创建测试模块配置
 */
export function createTestModuleConfig() {
  return {
    id: 'test-module',
    name: '测试模块',
    version: '1.0.0',
    description: '这是一个测试模块',
    author: '测试团队',
    capabilities: [
      {
        name: 'test-capability',
        description: '测试能力',
        required: true
      }
    ],
    configSchema: {
      testValue: {
        type: 'string',
        default: 'default',
        description: '测试值',
        required: false
      },
      testNumber: {
        type: 'number',
        default: 42,
        description: '测试数字',
        required: false
      }
    }
  }
}

/**
 * 模拟文件系统操作
 */
export function createMockFileSystem() {
  const files = new Map<string, string>()

  return {
    writeFile: (path: string, content: string) => {
      files.set(path, content)
    },
    readFile: (path: string) => {
      return files.get(path) || ''
    },
    exists: (path: string) => {
      return files.has(path)
    },
    delete: (path: string) => {
      files.delete(path)
    },
    list: () => {
      return Array.from(files.keys())
    },
    clear: () => {
      files.clear()
    }
  }
}

/**
 * 创建模拟定时器
 */
export function createMockTimer() {
  const timeouts: Array<{ id: number; callback: Function; delay: number }> = []
  const intervals: Array<{ id: number; callback: Function; delay: number }> = []
  let currentTime = 0

  vi.useFakeTimers()

  return {
    setTimeout: vi.fn((callback: Function, delay: number) => {
      const id = timeouts.length
      timeouts.push({ id, callback, delay })
      return id
    }),
    clearTimeout: vi.fn((id: number) => {
      timeouts.splice(id, 1)
    }),
    setInterval: vi.fn((callback: Function, delay: number) => {
      const id = intervals.length
      intervals.push({ id, callback, delay })
      return id
    }),
    clearInterval: vi.fn((id: number) => {
      intervals.splice(id, 1)
    }),
    advanceTimeBy: vi.fn((ms: number) => {
      currentTime += ms
      vi.advanceTimersByTime(ms)
    }),
    runAllTimers: vi.fn(() => {
      vi.runAllTimers()
    }),
    getCurrentTime: () => currentTime
  }
}

/**
 * 模拟LocalStorage
 */
export function createMockStorage() {
  const store: Record<string, string> = {}

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key])
    }),
    getAll: () => ({ ...store }),
    get length() {
      return Object.keys(store).length
    }
  }
}
