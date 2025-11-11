import { describe, it, expect, beforeEach, vi } from 'vitest'
import { customCommandService } from '@/modules/shortcut-commands/services/CustomCommandService'
import { configService } from '@/modules/shortcut-commands/../../core/config'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
  length: 0,
  key: vi.fn()
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('CustomCommandService 分类排序功能', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    customCommandService.clear()
  })

  describe('getCategoryOrder', () => {
    it('应该返回默认分类顺序', () => {
      const order = customCommandService.getCategoryOrder()

      expect(order).toEqual([
        '应用管理',
        '服务管理',
        '设备信息',
        '文件操作',
        '日志调试',
        '网络调试',
        '系统管理',
        '自定义'
      ])
    })

    it('应该返回保存的分类顺序', () => {
      const customOrder = ['设备信息', '应用管理', '文件操作']
      localStorageMock.getItem.mockReturnValue(JSON.stringify(customOrder))

      const order = customCommandService.getCategoryOrder()

      expect(order).toEqual(customOrder)
    })
  })

  describe('setCategoryOrder', () => {
    it('应该保存分类顺序', () => {
      const newOrder = ['设备信息', '系统管理', '应用管理']

      customCommandService.setCategoryOrder(newOrder)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'adb-category-order',
        JSON.stringify(newOrder)
      )
    })
  })

  describe('getSortedCategories', () => {
    it('应该按默认顺序返回分类', () => {
      const categories = customCommandService.getSortedCategories()

      expect(categories[0]).toEqual({ name: '应用管理', icon: '📱' })
      expect(categories[1]).toEqual({ name: '服务管理', icon: '⚙️' })
      expect(categories[2]).toEqual({ name: '设备信息', icon: 'ℹ️' })
    })

    it('应该按自定义顺序返回分类', () => {
      const customOrder = ['设备信息', '系统管理', '应用管理']
      customCommandService.setCategoryOrder(customOrder)

      const categories = customCommandService.getSortedCategories()

      expect(categories[0]).toEqual({ name: '设备信息', icon: 'ℹ️' })
      expect(categories[1]).toEqual({ name: '系统管理', icon: '🔧' })
      expect(categories[2]).toEqual({ name: '应用管理', icon: '📱' })
    })

    it('应该将新分类添加到末尾', () => {
      const customOrder = ['应用管理', '服务管理']
      customCommandService.setCategoryOrder(customOrder)

      const categories = customCommandService.getSortedCategories()

      expect(categories.length).toBeGreaterThan(customOrder.length)
      expect(categories.slice(0, customOrder.length)).toEqual([
        { name: '应用管理', icon: '📱' },
        { name: '服务管理', icon: '⚙️' }
      ])
    })
  })

  describe('addCategoryToOrder', () => {
    it('应该添加新分类到顺序末尾', () => {
      const initialOrder = customCommandService.getCategoryOrder()
      const newCategory = '我的分类'

      customCommandService.addCategoryToOrder(newCategory)

      const newOrder = customCommandService.getCategoryOrder()
      expect(newOrder).toHaveLength(initialOrder.length + 1)
      expect(newOrder[newOrder.length - 1]).toBe(newCategory)
    })

    it('不应该添加已存在的分类', () => {
      const newCategory = '应用管理'

      customCommandService.addCategoryToOrder(newCategory)
      customCommandService.addCategoryToOrder(newCategory)

      const order = customCommandService.getCategoryOrder()
      const count = order.filter(cat => cat === newCategory).length
      expect(count).toBe(1)
    })
  })

  describe('removeCategoryFromOrder', () => {
    it('应该从顺序中移除分类', () => {
      const categoryToRemove = '应用管理'
      const initialOrder = customCommandService.getCategoryOrder()

      customCommandService.removeCategoryFromOrder(categoryToRemove)

      const newOrder = customCommandService.getCategoryOrder()
      expect(newOrder).toHaveLength(initialOrder.length - 1)
      expect(newOrder).not.toContain(categoryToRemove)
    })

    it('不应该影响其他分类', () => {
      const categoryToRemove = '服务管理'

      customCommandService.removeCategoryFromOrder(categoryToRemove)

      const newOrder = customCommandService.getCategoryOrder()
      expect(newOrder).toContain('应用管理')
      expect(newOrder).toContain('设备信息')
      expect(newOrder).toContain('文件操作')
    })
  })

  describe('完整的排序流程', () => {
    it('应该支持完整的排序生命周期', () => {
      // 1. 获取默认顺序
      let order = customCommandService.getCategoryOrder()
      expect(order[0]).toBe('应用管理')

      // 2. 调整顺序
      const newOrder = ['设备信息', '系统管理', '应用管理', ...order.slice(3)]
      customCommandService.setCategoryOrder(newOrder)

      // 3. 验证新顺序
      order = customCommandService.getCategoryOrder()
      expect(order[0]).toBe('设备信息')
      expect(order[1]).toBe('系统管理')
      expect(order[2]).toBe('应用管理')

      // 4. 验证排序后的分类
      const categories = customCommandService.getSortedCategories()
      expect(categories[0].name).toBe('设备信息')
      expect(categories[1].name).toBe('系统管理')
      expect(categories[2].name).toBe('应用管理')

      // 5. 添加新分类
      customCommandService.addCategoryToOrder('新分类')
      order = customCommandService.getCategoryOrder()
      expect(order[order.length - 1]).toBe('新分类')

      // 6. 移除分类
      customCommandService.removeCategoryFromOrder('新分类')
      order = customCommandService.getCategoryOrder()
      expect(order).not.toContain('新分类')
    })
  })

  describe('持久化测试', () => {
    it('应该持久化分类顺序', () => {
      const newOrder = ['设备信息', '应用管理', '文件操作']
      customCommandService.setCategoryOrder(newOrder)

      // 重新创建服务实例（模拟刷新）
      // 注意：这里直接使用新的服务实例会创建新的单例
      // 所以我们只是验证setItem被调用
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'adb-category-order',
        JSON.stringify(newOrder)
      )
    })

    it('应该在刷新后保持分类顺序', () => {
      const customOrder = ['系统管理', '设备信息', '应用管理']
      localStorageMock.getItem.mockReturnValue(JSON.stringify(customOrder))

      const order = customCommandService.getCategoryOrder()
      expect(order).toEqual(customOrder)
    })
  })
})
