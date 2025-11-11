import { describe, it, expect, beforeEach, vi } from 'vitest'
import { customCommandService } from '@/modules/shortcut-commands/services/CustomCommandService'
import { configService } from '@/modules/shortcut-commands/../../core/config'
import type { CustomCommand, CustomCommandForm } from '@/types/adb-commands'

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

describe('CustomCommandService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    customCommandService.clear()
  })

  describe('create', () => {
    it('应该创建新的自定义命令', () => {
      const formData: CustomCommandForm = {
        name: '测试命令',
        description: '这是一个测试命令',
        command: 'adb shell test',
        category: '系统管理',
        icon: '🔧'
      }

      const result = customCommandService.create(formData)

      expect(result).toMatchObject({
        name: formData.name,
        description: formData.description,
        command: formData.command,
        category: formData.category,
        icon: formData.icon
      })
      expect(result.id).toBeDefined()
      expect(result.createdAt).toBeDefined()
      expect(result.updatedAt).toBeDefined()
    })

    it('应该为每个命令生成唯一ID', () => {
      const formData1: CustomCommandForm = {
        name: '命令1',
        description: '描述1',
        command: 'adb test1',
        category: '系统管理',
        icon: '🔧'
      }

      const formData2: CustomCommandForm = {
        name: '命令2',
        description: '描述2',
        command: 'adb test2',
        category: '系统管理',
        icon: '🔧'
      }

      const result1 = customCommandService.create(formData1)
      const result2 = customCommandService.create(formData2)

      expect(result1.id).not.toBe(result2.id)
    })
  })

  describe('getAll', () => {
    it('应该返回空数组当没有自定义命令时', () => {
      const result = customCommandService.getAll()
      expect(result).toEqual([])
    })

    it('应该返回所有自定义命令', () => {
      const formData: CustomCommandForm = {
        name: '测试命令',
        description: '测试描述',
        command: 'adb test',
        category: '系统管理',
        icon: '🔧'
      }

      customCommandService.create(formData)
      const result = customCommandService.getAll()

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('测试命令')
    })
  })

  describe('getById', () => {
    it('应该通过ID找到命令', () => {
      const formData: CustomCommandForm = {
        name: '测试命令',
        description: '测试描述',
        command: 'adb test',
        category: '系统管理',
        icon: '🔧'
      }

      const created = customCommandService.create(formData)
      const result = customCommandService.getById(created.id)

      expect(result).toBeDefined()
      expect(result?.id).toBe(created.id)
    })

    it('应该返回undefined当ID不存在时', () => {
      const result = customCommandService.getById('non-existent-id')
      expect(result).toBeUndefined()
    })
  })

  describe('update', () => {
    it('应该更新现有命令', () => {
      const formData: CustomCommandForm = {
        name: '原始名称',
        description: '原始描述',
        command: 'adb original',
        category: '系统管理',
        icon: '🔧'
      }

      const created = customCommandService.create(formData)

      const updateData: CustomCommandForm = {
        name: '更新名称',
        description: '更新描述',
        command: 'adb updated',
        category: '应用管理',
        icon: '📱'
      }

      const result = customCommandService.update(created.id, updateData)

      expect(result).toBeDefined()
      expect(result?.name).toBe('更新名称')
      expect(result?.description).toBe('更新描述')
      expect(result?.command).toBe('adb updated')
      expect(result?.category).toBe('应用管理')
      expect(result?.icon).toBe('📱')
    })

    it('应该更新updatedAt字段', () => {
      const formData: CustomCommandForm = {
        name: '测试命令',
        description: '测试描述',
        command: 'adb test',
        category: '系统管理',
        icon: '🔧'
      }

      const created = customCommandService.create(formData)
      const originalUpdatedAt = created.updatedAt

      // 等待一小段时间
      return new Promise(resolve => setTimeout(resolve, 10)).then(() => {
        const updateData: CustomCommandForm = {
          name: '更新名称',
          description: '更新描述',
          command: 'adb updated',
          category: '系统管理',
          icon: '🔧'
        }

        const result = customCommandService.update(created.id, updateData)
        expect(result?.updatedAt).not.toBe(originalUpdatedAt)
      })
    })

    it('应该返回null当更新不存在的命令时', () => {
      const updateData: CustomCommandForm = {
        name: '测试',
        description: '测试',
        command: 'adb test',
        category: '系统管理',
        icon: '🔧'
      }

      const result = customCommandService.update('non-existent-id', updateData)
      expect(result).toBeNull()
    })
  })

  describe('delete', () => {
    it('应该删除现有命令', () => {
      const formData: CustomCommandForm = {
        name: '测试命令',
        description: '测试描述',
        command: 'adb test',
        category: '系统管理',
        icon: '🔧'
      }

      const created = customCommandService.create(formData)
      const result = customCommandService.delete(created.id)

      expect(result).toBe(true)
      expect(customCommandService.getById(created.id)).toBeUndefined()
    })

    it('应该返回false当删除不存在的命令时', () => {
      const result = customCommandService.delete('non-existent-id')
      expect(result).toBe(false)
    })
  })

  describe('deleteMultiple', () => {
    it('应该批量删除命令', () => {
      const formData1: CustomCommandForm = {
        name: '命令1',
        description: '描述1',
        command: 'adb test1',
        category: '系统管理',
        icon: '🔧'
      }

      const formData2: CustomCommandForm = {
        name: '命令2',
        description: '描述2',
        command: 'adb test2',
        category: '系统管理',
        icon: '🔧'
      }

      const formData3: CustomCommandForm = {
        name: '命令3',
        description: '描述3',
        command: 'adb test3',
        category: '系统管理',
        icon: '🔧'
      }

      const created1 = customCommandService.create(formData1)
      const created2 = customCommandService.create(formData2)
      const created3 = customCommandService.create(formData3)

      const deletedCount = customCommandService.deleteMultiple([created1.id, created2.id])

      expect(deletedCount).toBe(2)
      expect(customCommandService.getAll()).toHaveLength(1)
      expect(customCommandService.getById(created1.id)).toBeUndefined()
      expect(customCommandService.getById(created2.id)).toBeUndefined()
      expect(customCommandService.getById(created3.id)).toBeDefined()
    })
  })

  describe('clear', () => {
    it('应该清空所有自定义命令', () => {
      const formData: CustomCommandForm = {
        name: '测试命令',
        description: '测试描述',
        command: 'adb test',
        category: '系统管理',
        icon: '🔧'
      }

      customCommandService.create(formData)
      customCommandService.create(formData)

      expect(customCommandService.getAll()).toHaveLength(2)

      customCommandService.clear()

      expect(customCommandService.getAll()).toHaveLength(0)
    })
  })

  describe('getByCategory', () => {
    it('应该按分类返回命令', () => {
      const formData1: CustomCommandForm = {
        name: '命令1',
        description: '描述1',
        command: 'adb test1',
        category: '系统管理',
        icon: '🔧'
      }

      const formData2: CustomCommandForm = {
        name: '命令2',
        description: '描述2',
        command: 'adb test2',
        category: '应用管理',
        icon: '📱'
      }

      customCommandService.create(formData1)
      customCommandService.create(formData2)

      const systemCommands = customCommandService.getByCategory('系统管理')
      const appCommands = customCommandService.getByCategory('应用管理')

      expect(systemCommands).toHaveLength(1)
      expect(systemCommands[0].category).toBe('系统管理')

      expect(appCommands).toHaveLength(1)
      expect(appCommands[0].category).toBe('应用管理')
    })
  })

  describe('getCategories', () => {
    it('应该返回预定义的分类列表', () => {
      const categories = customCommandService.getCategories()

      expect(categories).toEqual(expect.arrayContaining([
        { name: '应用管理', icon: '📱' },
        { name: '服务管理', icon: '⚙️' },
        { name: '设备信息', icon: 'ℹ️' },
        { name: '文件操作', icon: '📁' },
        { name: '日志调试', icon: '📝' },
        { name: '网络调试', icon: '🌐' },
        { name: '系统管理', icon: '🔧' },
        { name: '自定义', icon: '✨' }
      ]))
    })
  })
})
