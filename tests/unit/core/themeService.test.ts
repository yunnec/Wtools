/**
 * ThemeService 主题服务单元测试
 * 测试主题切换和状态管理功能
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { themeService } from '../../../src/core/theme'

describe('ThemeService 主题服务', () => {
  beforeEach(() => {
    // 重置为默认主题
    themeService.setTheme('light')
  })

  afterEach(() => {
    themeService.setTheme('light')
  })

  describe('theme 属性', () => {
    it('应该默认为 light 主题', () => {
      expect(themeService.theme.value).toBe('light')
    })

    it('应该能够设置 dark 主题', () => {
      themeService.setTheme('dark')
      expect(themeService.theme.value).toBe('dark')
    })

    it('应该保持主题状态', () => {
      themeService.setTheme('dark')
      expect(themeService.theme.value).toBe('dark')

      // 多次读取应该返回相同值
      expect(themeService.theme.value).toBe('dark')
    })
  })

  describe('toggleTheme() 方法', () => {
    it('应该能够从 light 切换到 dark', () => {
      expect(themeService.theme.value).toBe('light')
      themeService.toggleTheme()
      expect(themeService.theme.value).toBe('dark')
    })

    it('应该能够从 dark 切换到 light', () => {
      themeService.setTheme('dark')
      expect(themeService.theme.value).toBe('dark')
      themeService.toggleTheme()
      expect(themeService.theme.value).toBe('light')
    })

    it('连续切换应该交替改变主题', () => {
      expect(themeService.theme.value).toBe('light')
      themeService.toggleTheme()
      expect(themeService.theme.value).toBe('dark')
      themeService.toggleTheme()
      expect(themeService.theme.value).toBe('light')
      themeService.toggleTheme()
      expect(themeService.theme.value).toBe('dark')
    })
  })

  describe('setTheme() 方法', () => {
    it('应该能设置 light 主题', () => {
      themeService.setTheme('dark')
      expect(themeService.theme.value).toBe('dark')
      themeService.setTheme('light')
      expect(themeService.theme.value).toBe('light')
    })

    it('应该能设置 dark 主题', () => {
      themeService.setTheme('light')
      expect(themeService.theme.value).toBe('light')
      themeService.setTheme('dark')
      expect(themeService.theme.value).toBe('dark')
    })

    it('应该支持响应式访问', () => {
      const theme = themeService.theme
      expect(theme.value).toBe('light')

      themeService.setTheme('dark')
      expect(theme.value).toBe('dark')
    })

    it('应该只接受有效的主题值', () => {
      themeService.setTheme('light')
      expect(themeService.theme.value).toBe('light')

      themeService.setTheme('dark')
      expect(themeService.theme.value).toBe('dark')

      // 任何其他值都应该不改变当前主题
      const originalTheme = themeService.theme.value
      themeService.setTheme('invalid' as any)
      expect(themeService.theme.value).toBe(originalTheme)
    })
  })

  describe('事件系统集成', () => {
    it('主题改变时应该触发事件', () => {
      const handler = vi.fn()
      eventBus.on('theme:changed', handler)

      themeService.setTheme('dark')

      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith('dark')

      eventBus.off('theme:changed', handler)
    })

    it('多次主题改变应该触发多次事件', () => {
      const handler = vi.fn()
      eventBus.on('theme:changed', handler)

      themeService.setTheme('dark')
      themeService.setTheme('light')
      themeService.setTheme('dark')

      expect(handler).toHaveBeenCalledTimes(3)
      expect(handler).toHaveBeenCalledWith('dark')
      expect(handler).toHaveBeenCalledWith('light')

      eventBus.off('theme:changed', handler)
    })

    it('toggleTheme 应该触发事件', () => {
      const handler = vi.fn()
      eventBus.on('theme:changed', handler)

      themeService.toggleTheme()

      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith('dark')

      eventBus.off('theme:changed', handler)
    })
  })

  describe('边界情况', () => {
    it('重复设置相同主题不应该触发额外事件', () => {
      const handler = vi.fn()
      eventBus.on('theme:changed', handler)

      themeService.setTheme('light')
      expect(handler).not.toHaveBeenCalled()

      themeService.setTheme('light')
      expect(handler).not.toHaveBeenCalled()

      themeService.setTheme('dark')
      expect(handler).toHaveBeenCalledTimes(1)

      themeService.setTheme('dark')
      expect(handler).toHaveBeenCalledTimes(1) // 仍然只有1次

      eventBus.off('theme:changed', handler)
    })

    it('并发设置主题应该保持一致性', async () => {
      const promises = Array.from({ length: 10 }, () =>
        Promise.resolve().then(() => themeService.setTheme(Math.random() > 0.5 ? 'dark' : 'light'))
      )

      await Promise.all(promises)

      // 主题应该是 'light' 或 'dark' 中的一个
      expect(['light', 'dark']).toContain(themeService.theme.value)
    })
  })

  describe('性能测试', () => {
    it('快速切换主题应该保持性能', () => {
      const start = performance.now()

      for (let i = 0; i < 1000; i++) {
        themeService.toggleTheme()
      }

      const end = performance.now()
      const duration = end - start

      // 1000次切换应该在合理时间内完成（< 100ms）
      expect(duration).toBeLessThan(100)
    })

    it('应该能处理大量监听器', () => {
      const handlers = Array.from({ length: 100 }, () => vi.fn())

      handlers.forEach(handler => {
        eventBus.on('theme:changed', handler)
      })

      themeService.toggleTheme()

      handlers.forEach(handler => {
        expect(handler).toHaveBeenCalledTimes(1)
        expect(handler).toHaveBeenCalledWith('dark')
      })
    })
  })

  describe('主题状态持久化', () => {
    it('应该能正确读取和保存主题设置', () => {
      // 模拟localStorage
      const originalGetItem = globalThis.localStorage?.getItem
      const originalSetItem = globalThis.localStorage?.setItem
      const storage: Record<string, string> = {}

      globalThis.localStorage = {
        getItem: (key: string) => storage[key] || null,
        setItem: (key: string, value: string) => {
          storage[key] = value
        },
        removeItem: vi.fn(),
        clear: vi.fn(),
        key: vi.fn(),
        length: 0
      } as any

      // 测试主题设置会保存到localStorage
      themeService.setTheme('dark')
      expect(storage['wutong-theme']).toBe('dark')

      // 恢复原始方法
      globalThis.localStorage.getItem = originalGetItem
      globalThis.localStorage.setItem = originalSetItem
    })
  })
})

// 导入 eventBus 用于测试
import { eventBus } from '../../../src/core/event'
