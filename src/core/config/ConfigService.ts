import type { AppConfig, ConfigService as IConfigService } from '../../types/config'
import { eventBus } from '../event'

/**
 * 配置服务 - 管理应用配置，支持持久化和监听
 */
class ConfigServiceImpl implements IConfigService {
  private config: AppConfig = {
    theme: 'light',
    language: 'zh-CN',
    modules: {
      'file-manager': true,
      'text-editor': true,
      'calculator': true,
    }
  }

  private changeCallbacks: Array<(key: string, value: any) => void> = []

  constructor() {
    this.loadFromStorage()
    eventBus.on('app:themeChanged', (theme: 'light' | 'dark') => {
      this.set('theme', theme)
    })
  }

  /**
   * 获取配置值
   */
  get<T>(key: string): T | undefined {
    return this.config[key as keyof AppConfig] as T | undefined
  }

  /**
   * 设置配置值
   */
  set<T>(key: string, value: T): void {
    const oldValue = this.config[key as keyof AppConfig]
    this.config[key as keyof AppConfig] = value as any
    
    this.saveToStorage()
    this.notifyChange(key, value)
    
    eventBus.emit('config:changed', { key, oldValue, newValue: value })
  }

  /**
   * 获取全部配置
   */
  getAll(): AppConfig {
    return { ...this.config }
  }

  /**
   * 重置为默认配置
   */
  reset(): void {
    this.config = {
      theme: 'light',
      language: 'zh-CN',
      modules: {
        'file-manager': true,
        'text-editor': true,
        'calculator': true,
      }
    }
    this.saveToStorage()
    this.notifyChange('config', this.config)
    eventBus.emit('config:reset', this.config)
  }

  /**
   * 监听配置变化
   */
  onChange(callback: (key: string, value: any) => void): void {
    this.changeCallbacks.push(callback)
  }

  /**
   * 从本地存储加载配置
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('wutong-config')
      if (stored) {
        const parsed = JSON.parse(stored)
        this.config = { ...this.config, ...parsed }
      }
    } catch (error) {
      console.error('加载配置失败:', error)
    }
  }

  /**
   * 保存配置到本地存储
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem('wutong-config', JSON.stringify(this.config))
    } catch (error) {
      console.error('保存配置失败:', error)
    }
  }

  /**
   * 通知配置变化
   */
  private notifyChange(key: string, value: any): void {
    this.changeCallbacks.forEach(callback => callback(key, value))
  }
}

// 导出单例实例
export const configService = new ConfigServiceImpl()
export default configService
