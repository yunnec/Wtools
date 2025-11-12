/**
 * 语义模块状态管理服务
 * 负责在模块切换时保存和恢复各语义模块的状态数据
 */

export interface SemanticRequestState {
  queryText: string
  result: string
  error: string
  responseTime: number
  history: Array<{
    query: string
    result: string
    timestamp: number
    duration: number
  }>
  selectedAppId: string
}

export interface XunfeiSemanticRequestState {
  queryText: string
  currentQuery: string
  result: any
  loading: boolean
  error: string
  success: string
  history: Array<{
    query: string
    response: string
    status: 'success' | 'error' | 'timeout'
    duration: number
    timestamp: number
  }>
  selectedConvertAppId: string
}

export interface SemanticCompareState {
  queryText: string
  xunfeiResult: any
  xunfeiError: string
  xunfeiTime: number
  selfResult: string
  selfError: string
  selfTime: number
  loadingXunfei: boolean
  loadingSelf: boolean
}

export interface SemanticModuleState {
  'semantic-request': SemanticRequestState
  'xunfei-semantic-request': XunfeiSemanticRequestState
  'semantic-compare': SemanticCompareState
}

const STORAGE_PREFIX = 'wutong-semantic-state-'

/**
 * 获取存储键名
 */
const getStorageKey = (moduleId: string): string => {
  return `${STORAGE_PREFIX}${moduleId}`
}

/**
 * 语义模块状态管理服务
 */
export class SemanticModuleStateService {
  /**
   * 保存模块状态
   */
  static saveState<T extends keyof SemanticModuleState>(
    moduleId: T,
    state: SemanticModuleState[T]
  ): void {
    try {
      const storageKey = getStorageKey(moduleId)
      const stateData = {
        ...state,
        // 确保时间戳是最新的
        lastSaved: Date.now()
      }
      localStorage.setItem(storageKey, JSON.stringify(stateData))
      console.log(`[语义状态服务] 已保存 ${moduleId} 模块状态`)
    } catch (error) {
      console.error(`[语义状态服务] 保存 ${moduleId} 模块状态失败:`, error)
    }
  }

  /**
   * 获取模块状态
   */
  static getState<T extends keyof SemanticModuleState>(
    moduleId: T
  ): SemanticModuleState[T] | null {
    try {
      const storageKey = getStorageKey(moduleId)
      const storedData = localStorage.getItem(storageKey)

      if (!storedData) {
        console.log(`[语义状态服务] ${moduleId} 模块无保存的状态`)
        return null
      }

      const stateData = JSON.parse(storedData)
      console.log(`[语义状态服务] 已恢复 ${moduleId} 模块状态`)
      return stateData
    } catch (error) {
      console.error(`[语义状态服务] 恢复 ${moduleId} 模块状态失败:`, error)
      return null
    }
  }

  /**
   * 清除模块状态
   */
  static clearState(moduleId: keyof SemanticModuleState): void {
    try {
      const storageKey = getStorageKey(moduleId)
      localStorage.removeItem(storageKey)
      console.log(`[语义状态服务] 已清除 ${moduleId} 模块状态`)
    } catch (error) {
      console.error(`[语义状态服务] 清除 ${moduleId} 模块状态失败:`, error)
    }
  }

  /**
   * 清除所有语义模块状态
   */
  static clearAll(): void {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(STORAGE_PREFIX))
        .forEach(key => {
          localStorage.removeItem(key)
        })
      console.log('[语义状态服务] 已清除所有语义模块状态')
    } catch (error) {
      console.error('[语义状态服务] 清除所有语义模块状态失败:', error)
    }
  }

  /**
   * 获取所有已保存的模块ID列表
   */
  static getSavedModuleIds(): string[] {
    try {
      return Object.keys(localStorage)
        .filter(key => key.startsWith(STORAGE_PREFIX))
        .map(key => key.replace(STORAGE_PREFIX, ''))
    } catch (error) {
      console.error('[语义状态服务] 获取已保存模块列表失败:', error)
      return []
    }
  }

  /**
   * 检查模块是否有已保存的状态
   */
  static hasState(moduleId: keyof SemanticModuleState): boolean {
    try {
      const storageKey = getStorageKey(moduleId)
      return localStorage.getItem(storageKey) !== null
    } catch (error) {
      console.error(`[语义状态服务] 检查 ${moduleId} 模块状态失败:`, error)
      return false
    }
  }
}

export default SemanticModuleStateService
