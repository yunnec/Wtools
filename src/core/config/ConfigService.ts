import type { AppConfig, ConfigService as IConfigService } from '../../types/config'
import { eventBus } from '../event'

// 应用版本号
const APP_VERSION = '1.0.0'

/**
 * 配置服务 - 管理应用配置，支持持久化和监听
 */
class ConfigServiceImpl implements IConfigService {
  private config: AppConfig = {
    theme: 'light',
    language: 'zh-CN',
    modules: {
      'calculator': true,
    },
    customCommands: [],
    adbCategoryOrder: [],
    appVersion: APP_VERSION
  }

  private changeCallbacks: Array<(key: string, value: any) => void> = []

  constructor() {
    this.loadFromStorage()
    this.checkAndMigrateVersion()
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
        'calculator': true,
      },
      customCommands: [],
      adbCategoryOrder: [],
      appVersion: APP_VERSION
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
        // 合并配置，保留用户数据（向后兼容）
        this.config = { ...this.config, ...parsed }
        console.log('[ConfigService] 已加载配置, 版本:', this.config.appVersion)
      } else {
        console.log('[ConfigService] 首次启动，使用默认配置')
      }
    } catch (error) {
      console.error('加载配置失败:', error)
    }
  }

  /**
   * 检查并迁移版本
   */
  private checkAndMigrateVersion(): void {
    const currentVersion = this.config.appVersion
    console.log(`[ConfigService] 当前配置版本: ${currentVersion}, 应用版本: ${APP_VERSION}`)

    if (currentVersion !== APP_VERSION) {
      console.log(`[ConfigService] 检测到版本变化 (${currentVersion} -> ${APP_VERSION})，执行数据迁移...`)

      // 在这里可以添加迁移逻辑
      // 目前我们只更新版本号，保留所有用户数据

      // 更新版本号
      this.config.appVersion = APP_VERSION
      this.saveToStorage()

      console.log('[ConfigService] 版本迁移完成，所有用户数据已保留')
    } else {
      console.log('[ConfigService] 版本匹配，无需迁移')
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

  /**
   * 更新应用版本号（用于测试版本迁移）
   */
  updateAppVersion(newVersion: string): void {
    console.log(`[ConfigService] 手动更新版本: ${this.config.appVersion} -> ${newVersion}`)
    this.config.appVersion = newVersion
    this.saveToStorage()
  }
}

// 导出单例实例
export const configService = new ConfigServiceImpl()
export default configService
