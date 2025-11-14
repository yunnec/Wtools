import { configService } from '@/core/config'
import { eventBus } from '@/core/event'
import type { CustomCommand, CustomCommandForm } from '@/types/adb-commands'

/**
 * 自定义命令服务 - 管理自定义ADB命令的CRUD操作
 */
class CustomCommandServiceImpl {
  private storageKey = 'adb-custom-commands'
  private orderKey = 'adb-category-order'

  /**
   * 获取所有自定义命令
   */
  getAll(): CustomCommand[] {
    const commands = configService.get<CustomCommand[]>(this.storageKey)
    return commands || []
  }

  /**
   * 根据ID获取自定义命令
   */
  getById(id: string): CustomCommand | undefined {
    const commands = this.getAll()
    return commands.find(cmd => cmd.id === id)
  }

  /**
   * 按分类获取自定义命令
   */
  getByCategory(category: string): CustomCommand[] {
    const commands = this.getAll()
    return commands.filter(cmd => cmd.category === category)
  }

  /**
   * 创建新的自定义命令
   */
  create(formData: CustomCommandForm): CustomCommand {
    const commands = this.getAll()
    const now = new Date().toISOString()

    const newCommand: CustomCommand = {
      id: this.generateId(),
      name: formData.name,
      description: formData.description,
      command: formData.command,
      category: formData.category,
      icon: formData.icon,
      createdAt: now,
      updatedAt: now
    }

    commands.push(newCommand)
    this.saveAll(commands)

    return newCommand
  }

  /**
   * 更新自定义命令
   */
  update(id: string, formData: CustomCommandForm): CustomCommand | null {
    const commands = this.getAll()
    const index = commands.findIndex(cmd => cmd.id === id)

    if (index === -1) {
      return null
    }

    const updated: CustomCommand = {
      ...commands[index],
      name: formData.name,
      description: formData.description,
      command: formData.command,
      category: formData.category,
      icon: formData.icon,
      updatedAt: new Date().toISOString()
    }

    commands[index] = updated
    this.saveAll(commands)

    return updated
  }

  /**
   * 删除自定义命令
   */
  delete(id: string): boolean {
    const commands = this.getAll()
    const index = commands.findIndex(cmd => cmd.id === id)

    if (index === -1) {
      return false
    }

    commands.splice(index, 1)
    this.saveAll(commands)

    return true
  }

  /**
   * 批量删除自定义命令
   */
  deleteMultiple(ids: string[]): number {
    const commands = this.getAll()
    const originalLength = commands.length

    const filteredCommands = commands.filter(cmd => !ids.includes(cmd.id))
    const deletedCount = originalLength - filteredCommands.length

    this.saveAll(filteredCommands)

    return deletedCount
  }

  /**
   * 插入或更新自定义命令（存在则更新，不存在则创建）
   */
  upsert(command: CustomCommand): CustomCommand {
    const commands = this.getAll()
    const index = commands.findIndex(cmd => cmd.id === command.id)

    if (index !== -1) {
      // 更新现有命令
      const updated: CustomCommand = {
        ...commands[index],
        name: command.name,
        description: command.description,
        command: command.command,
        category: command.category,
        icon: command.icon,
        presetId: command.presetId,
        updatedAt: new Date().toISOString()
      }
      commands[index] = updated
      this.saveAll(commands)
      return updated
    } else {
      // 创建新命令
      const now = new Date().toISOString()
      const newCommand: CustomCommand = {
        ...command,
        createdAt: command.createdAt || now,
        updatedAt: now
      }
      commands.push(newCommand)
      this.saveAll(commands)
      return newCommand
    }
  }

  /**
   * 清空所有自定义命令
   */
  clear(): void {
    this.saveAll([])
  }

  /**
   * 保存所有命令到配置
   */
  private saveAll(commands: CustomCommand[]): void {
    configService.set(this.storageKey, commands)
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 8)
    return `custom-${timestamp}-${random}`
  }

  /**
   * 获取预定义的分类列表
   */
  getCategories(): Array<{ name: string; icon: string }> {
    return [
      { name: '应用管理', icon: '📱' },
      { name: '服务管理', icon: '⚙️' },
      { name: '设备信息', icon: 'ℹ️' },
      { name: '文件操作', icon: '📁' },
      { name: '日志调试', icon: '📝' },
      { name: '网络调试', icon: '🌐' },
      { name: '系统管理', icon: '🔧' },
      { name: '自定义', icon: '✨' }
    ]
  }

  /**
   * 获取分类顺序
   */
  getCategoryOrder(): string[] {
    const order = configService.get<string[]>(this.orderKey)
    if (order && order.length > 0) {
      return order
    }

    // 返回默认顺序
    return this.getCategories().map(cat => cat.name)
  }

  /**
   * 设置分类顺序
   */
  setCategoryOrder(categories: string[]): void {
    console.log('[CustomCommandService] setCategoryOrder 被调用:', categories)
    configService.set(this.orderKey, categories)
    // 触发分类顺序更新事件
    console.log('[CustomCommandService] 即将触发事件总线: adb:categoryOrderChanged')
    eventBus.emit('adb:categoryOrderChanged', categories)
  }

  /**
   * 获取排序后的分类列表
   */
  getSortedCategories(): Array<{ name: string; icon: string }> {
    const order = this.getCategoryOrder()
    const categoryMap = new Map(this.getCategories().map(cat => [cat.name, cat]))

    // 按排序顺序添加分类
    const sorted: Array<{ name: string; icon: string }> = []
    order.forEach(catName => {
      const cat = categoryMap.get(catName)
      if (cat) {
        sorted.push(cat)
        categoryMap.delete(catName)
      }
    })

    // 添加未排序的新分类
    categoryMap.forEach(cat => {
      sorted.push(cat)
    })

    return sorted
  }

  /**
   * 添加新分类到顺序末尾
   */
  addCategoryToOrder(category: string): void {
    const order = this.getCategoryOrder()
    if (!order.includes(category)) {
      order.push(category)
      this.setCategoryOrder(order)
    }
  }

  /**
   * 从顺序中移除分类
   */
  removeCategoryFromOrder(category: string): void {
    const order = this.getCategoryOrder()
    const filtered = order.filter(cat => cat !== category)
    this.setCategoryOrder(filtered)
  }
}

// 导出单例实例
export const customCommandService = new CustomCommandServiceImpl()
export default customCommandService
