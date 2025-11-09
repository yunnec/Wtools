import { ref } from 'vue'
import { eventBus } from '../event'

/**
 * 主题服务 - 管理应用主题切换
 */
class ThemeServiceImpl {
  private currentTheme = ref<'light' | 'dark'>('light')

  constructor() {
    this.loadThemeFromStorage()
    this.applyTheme()
  }

  /**
   * 获取当前主题
   */
  get theme() {
    return this.currentTheme.value
  }

  /**
   * 切换主题
   */
  toggleTheme(): void {
    this.currentTheme.value = this.currentTheme.value === 'light' ? 'dark' : 'light'
    this.saveThemeToStorage()
    this.applyTheme()

    // 发送主题变更事件
    eventBus.emit('theme:changed', this.currentTheme.value)
  }

  /**
   * 设置特定主题
   */
  setTheme(theme: 'light' | 'dark'): void {
    this.currentTheme.value = theme
    this.saveThemeToStorage()
    this.applyTheme()

    eventBus.emit('theme:changed', this.currentTheme.value)
  }

  /**
   * 应用主题到DOM
   */
  private applyTheme(): void {
    const html = document.documentElement
    if (this.currentTheme.value === 'dark') {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }

  /**
   * 从本地存储加载主题
   */
  private loadThemeFromStorage(): void {
    try {
      const stored = localStorage.getItem('wutong-theme')
      if (stored === 'light' || stored === 'dark') {
        this.currentTheme.value = stored
      }
    } catch (error) {
      console.error('加载主题失败:', error)
    }
  }

  /**
   * 保存主题到本地存储
   */
  private saveThemeToStorage(): void {
    try {
      localStorage.setItem('wutong-theme', this.currentTheme.value)
    } catch (error) {
      console.error('保存主题失败:', error)
    }
  }
}

// 导出单例实例
export const themeService = new ThemeServiceImpl()
export default themeService
