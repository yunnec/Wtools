/**
 * 讯飞语义请求 - API服务
 * 高层API封装，集成认证和WebSocket服务
 */

import { XunfeiAuthService, type XunfeiConfig } from './xunfei-auth.service'
import {
  XunfeiWebSocketService,
  type WebSocketConnectionState,
  type WebSocketMessage
} from './xunfei-websocket.service'
import { XunfeiConvertService, type ConvertServiceConfig } from './xunfei-convert.service'

export interface HistoryRecord {
  timestamp: number
  query: string
  response: string
  duration: number
  status: 'success' | 'error' | 'timeout'
  message?: string
}

export interface QueryResult {
  query: string
  response: any
  duration: number
  status: 'success' | 'error' | 'timeout'
  message?: string
}

/**
 * 讯飞语义请求API服务
 */
export class XunfeiApiService {
  private authService: XunfeiAuthService
  private wsService: XunfeiWebSocketService
  private convertService: XunfeiConvertService | null = null
  private historyKey = 'xunfei-semantic-history'
  private maxHistoryItems = 30

  constructor(config: XunfeiConfig) {
    this.authService = new XunfeiAuthService(config)
    this.wsService = new XunfeiWebSocketService()
  }

  /**
   * 初始化转换服务
   */
  initConvertService(convertConfig: ConvertServiceConfig): void {
    this.convertService = new XunfeiConvertService(convertConfig)
  }

  /**
   * 发送语义查询
   */
  async sendQuery(
    query: string,
    appId: string,
    onMessage?: (message: WebSocketMessage) => void,
    onStateChange?: (state: WebSocketConnectionState) => void,
    timeoutMs = 10000
  ): Promise<QueryResult> {
    console.log('[ApiService.sendQuery] 开始发送查询, query:', query)
    console.log('[ApiService.sendQuery] 当前连接状态:', this.wsService.getState())

    if (!query || query.trim().length === 0) {
      console.error('[ApiService.sendQuery] 错误: 查询内容为空')
      throw new Error('查询内容不能为空')
    }

    const startTime = Date.now()
    let timeoutId: number | null = null

    // 设置超时处理
    const timeoutPromise = new Promise<QueryResult>((_, reject) => {
      timeoutId = window.setTimeout(() => {
        console.error('[ApiService.sendQuery] 请求超时')
        reject(new Error('请求超时'))
      }, timeoutMs)
    })

    try {
      // 检查是否已经连接，如果没有则建立连接
      if (!this.wsService.isConnected()) {
        console.log('[ApiService.sendQuery] WebSocket未连接，建立新连接...')
        const authParams = await this.authService.buildAuthParams(query)
        console.log('[ApiService.sendQuery] 认证参数构建完成, 开始连接...')
        await this.wsService.connect(authParams, appId)
        console.log('[ApiService.sendQuery] 连接建立完成')
      } else {
        console.log('[ApiService.sendQuery] WebSocket已连接，直接发送查询')
      }

      // 设置WebSocket回调
      console.log('[ApiService.sendQuery] 设置WebSocket回调...')
      this.wsService.setCallbacks({
        onMessage: (message: WebSocketMessage) => {
          console.log('[ApiService.sendQuery] 收到消息:', message)
          onMessage?.(message)
        },
        onStateChange: (state: WebSocketConnectionState) => {
          console.log('[ApiService.sendQuery] 状态变更:', state)
          onStateChange?.(state)
        }
      })

      // 发送查询
      console.log('[ApiService.sendQuery] 准备发送查询到WebSocket...')
      this.wsService.sendQuery(query)
      console.log('[ApiService.sendQuery] WebSocket.sendQuery调用完成')

      // 等待响应
      console.log('[ApiService.sendQuery] 开始等待响应...')
      const result = await this.waitForResponse(query, startTime, timeoutMs)
      console.log('[ApiService.sendQuery] 等待响应完成, result:', result)

      // 取消超时
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      // 保存历史记录
      console.log('[ApiService.sendQuery] 保存历史记录...')
      this.saveToHistory({
        timestamp: Date.now(),
        query,
        response: JSON.stringify(result.response),
        duration: Date.now() - startTime,
        status: result.status,
        message: result.message
      })

      console.log('[ApiService.sendQuery] 发送查询完成, 返回结果')
      return {
        query,
        response: result.response,
        duration: Date.now() - startTime,
        status: result.status,
        message: result.message
      }
    } catch (error) {
      const duration = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      console.error('[ApiService.sendQuery] 发生错误:', errorMessage)

      // 保存错误历史
      this.saveToHistory({
        timestamp: Date.now(),
        query,
        response: '',
        duration,
        status: 'error',
        message: errorMessage
      })

      // 注意：不再自动断开连接，保持连接以便连续查询
      console.log('[ApiService.sendQuery] 注意: 不自动断开连接，保持状态')
      // this.wsService.disconnect()

      console.log('[ApiService.sendQuery] 抛出错误:', errorMessage)
      throw error
    }
  }

  /**
   * 等待响应
   */
  private waitForResponse(
    query: string,
    startTime: number,
    timeoutMs: number
  ): Promise<{ response: any; status: 'success' | 'error' | 'timeout'; message?: string }> {
    return new Promise((resolve, reject) => {
      const messages: any[] = []
      let timeoutId = window.setTimeout(() => {
        reject(new Error('等待响应超时'))
      }, timeoutMs)

      // 保存原有的回调
      const originalCallbacks = this.wsService.getCallbacks()

      const messageHandler = (message: WebSocketMessage) => {
        console.log('[waitForResponse] 收到消息:', message)
        console.log('[waitForResponse] messages数组当前长度:', messages.length)

        try {
          // 提取 data.content 字段的原始值（用户只关心这个）
          let displayContent = ''
          if (message.data && typeof message.data === 'object') {
            // 如果 data 有 content 字段，直接提取其字符串值
            if ('content' in message.data) {
              displayContent = message.data.content as string
              console.log('[waitForResponse] 提取的content原始字符串:', displayContent)
            }
            // 如果 data 中有其他内容，转换为字符串
            else {
              displayContent = JSON.stringify(message.data)
            }
          } else {
            displayContent = JSON.stringify(message.data)
          }

          // 保存简化后的消息
          const simplifiedMessage = {
            content: displayContent,
            timestamp: Date.now(),
            original: message // 保留原始消息供参考
          }
          messages.push(simplifiedMessage)
          console.log('[waitForResponse] 消息已保存到数组, 当前长度:', messages.length)
          console.log('[waitForResponse] 最终显示内容:', displayContent)

          // 先保存消息，再判断是否完成
          // 延迟1.5秒后如果没收到新消息就返回（避免无限等待）
          clearTimeout(timeoutId)
          timeoutId = window.setTimeout(async () => {
            console.log('[waitForResponse] 等待超时，处理已收集的消息')

            // 如果配置了转换服务，调用转换接口
            console.log('[waitForResponse] 检查转换服务:', !!this.convertService, '消息数量:', messages.length)
            if (this.convertService && messages.length > 0) {
              try {
                const lastMessage = messages[messages.length - 1]
                if (lastMessage.content) {
                  console.log('[waitForResponse] 开始调用转换接口, content长度:', lastMessage.content.length)
                  console.log('[waitForResponse] content前100字符:', lastMessage.content.substring(0, 100))
                  const convertResult = await this.convertService.convert(lastMessage.content)

                  if (convertResult.success) {
                    console.log('[waitForResponse] 转换成功，结果:', convertResult.data)
                    this.wsService.setCallbacks(originalCallbacks)
                    resolve({
                      response: {
                        semantic: messages, // WebSocket原始响应
                        convert: convertResult.data // 转换后的最终结果
                      },
                      status: 'success'
                    })
                    return
                  } else {
                    console.error('[waitForResponse] 转换失败:', convertResult.error)
                  }
                }
              } catch (convertError) {
                console.error('[waitForResponse] 转换异常:', convertError)
              }
            }

            // 如果没有转换服务或转换失败，返回原始消息
            console.log('[waitForResponse] 返回原始消息')
            this.wsService.setCallbacks(originalCallbacks)
            resolve({
              response: messages,
              status: 'success'
            })
          }, 1500)

        } catch (error) {
          console.error('[waitForResponse] 处理消息时出错:', error, message)
          // 继续等待其他消息
        }
      }

      this.wsService.setCallbacks({
        ...originalCallbacks,
        onMessage: (message) => {
          // 先调用原有的回调（用于实时更新UI）
          originalCallbacks.onMessage?.(message)
          // 再调用 waitForResponse 的处理（用于收集结果）
          messageHandler(message)
        },
        onError: (error) => {
          clearTimeout(timeoutId)
          // 恢复原有的回调
          this.wsService.setCallbacks(originalCallbacks)
          reject(new Error('WebSocket错误: ' + (error as any)?.message || '未知错误'))
        },
        onClose: async (event) => {
          clearTimeout(timeoutId)
          // 不恢复回调，让连接状态保持disconnected

          // 如果没有收到结果，抛出错误
          if (messages.length === 0) {
            reject(new Error('连接已关闭，未收到响应'))
          } else {
            // 如果有部分结果，尝试调用转换服务
            try {
              if (this.convertService) {
                const lastMessage = messages[messages.length - 1]
                if (lastMessage.content) {
                  console.log('[waitForResponse] onClose事件触发，开始转换')
                  const convertResult = await this.convertService.convert(lastMessage.content)

                  if (convertResult.success) {
                    console.log('[waitForResponse] onClose转换成功')
                    resolve({
                      response: {
                        semantic: messages,
                        convert: convertResult.data
                      },
                      status: 'success'
                    })
                    return
                  }
                }
              }
            } catch (convertError) {
              console.error('[waitForResponse] onClose转换异常:', convertError)
            }

            // 转换失败或未配置转换服务，返回原始消息
            resolve({
              response: messages,
              status: 'success'
            })
          }
        }
      })
    })
  }

  /**
   * 连接到WebSocket（不发送查询）
   */
  async connect(
    appId: string,
    onStateChange?: (state: WebSocketConnectionState) => void
  ): Promise<void> {
    const authParams = await this.authService.buildAuthParams('')
    // 先设置回调，再建立连接
    this.wsService.setCallbacks({ onStateChange })
    await this.wsService.connect(authParams, appId)
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    this.wsService.disconnect()
  }

  /**
   * 检查连接状态
   */
  isConnected(): boolean {
    return this.wsService.isConnected()
  }

  /**
   * 获取连接状态
   */
  getConnectionState(): WebSocketConnectionState {
    return this.wsService.getState()
  }

  /**
   * 获取连接状态描述
   */
  getConnectionStateDescription(): string {
    return this.wsService.getStateDescription()
  }

  /**
   * 保存历史记录
   */
  private saveToHistory(record: HistoryRecord): void {
    try {
      const history = this.getHistory()
      history.unshift(record)

      // 限制历史记录数量
      if (history.length > this.maxHistoryItems) {
        history.splice(this.maxHistoryItems)
      }

      localStorage.setItem(this.historyKey, JSON.stringify(history))
    } catch (error) {
      console.error('保存历史记录失败:', error)
    }
  }

  /**
   * 获取历史记录
   */
  getHistory(): HistoryRecord[] {
    try {
      const historyJson = localStorage.getItem(this.historyKey)
      if (historyJson) {
        return JSON.parse(historyJson)
      }
    } catch (error) {
      console.error('读取历史记录失败:', error)
    }
    return []
  }

  /**
   * 清空历史记录
   */
  clearHistory(): void {
    try {
      localStorage.removeItem(this.historyKey)
    } catch (error) {
      console.error('清空历史记录失败:', error)
    }
  }

  /**
   * 删除单条历史记录
   */
  deleteHistoryItem(index: number): void {
    try {
      const history = this.getHistory()
      if (index >= 0 && index < history.length) {
        history.splice(index, 1)
        localStorage.setItem(this.historyKey, JSON.stringify(history))
      }
    } catch (error) {
      console.error('删除历史记录失败:', error)
    }
  }

  /**
   * 获取认证服务
   */
  getAuthService(): XunfeiAuthService {
    return this.authService
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<XunfeiConfig>): void {
    this.authService.updateConfig(config)
  }

  /**
   * 获取重连次数
   */
  getReconnectAttempts(): number {
    return this.wsService.getReconnectAttempts()
  }

  /**
   * 重置重连次数
   */
  resetReconnectAttempts(): void {
    this.wsService.resetReconnectAttempts()
  }
}
