/**
 * 讯飞语义请求 - WebSocket服务
 * 处理WebSocket连接、消息收发、状态管理
 */

import type { XunfeiAuthParams } from './xunfei-auth.service'

export enum WebSocketConnectionState {
  Disconnected = 'disconnected',
  Connecting = 'connecting',
  Connected = 'connected',
  Reconnecting = 'reconnecting',
  Error = 'error'
}

export interface WebSocketMessage {
  action?: string
  data?: {
    sub?: string
    content?: string
    [key: string]: any
  }
  [key: string]: any
}

export interface WebSocketCallback {
  onOpen?: () => void
  onMessage?: (message: WebSocketMessage) => void
  onError?: (error: Event) => void
  onClose?: (event: CloseEvent) => void
  onStateChange?: (state: WebSocketConnectionState) => void
}

/**
 * WebSocket服务类
 */
export class XunfeiWebSocketService {
  private ws: WebSocket | null = null
  private state: WebSocketConnectionState = WebSocketConnectionState.Disconnected
  private callbacks: WebSocketCallback = {}
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000 // 1秒
  private heartbeatInterval: number | null = null
  private heartbeatIntervalMs = 30000 // 30秒
  private currentQuery = ''

  /**
   * 设置回调函数
   */
  setCallbacks(callbacks: WebSocketCallback): void {
    this.callbacks = { ...this.callbacks, ...callbacks }
  }

  /**
   * 获取当前的回调函数
   */
  getCallbacks(): WebSocketCallback {
    return { ...this.callbacks }
  }

  /**
   * 获取当前连接状态
   */
  getState(): WebSocketConnectionState {
    return this.state
  }

  /**
   * 获取连接状态描述
   */
  getStateDescription(): string {
    const descriptions = {
      [WebSocketConnectionState.Disconnected]: '未连接',
      [WebSocketConnectionState.Connecting]: '连接中',
      [WebSocketConnectionState.Connected]: '已连接',
      [WebSocketConnectionState.Reconnecting]: '重连中',
      [WebSocketConnectionState.Error]: '连接错误'
    }
    return descriptions[this.state] || '未知状态'
  }

  /**
   * 建立WebSocket连接
   */
  async connect(authParams: XunfeiAuthParams, appId: string): Promise<void> {
    if (this.ws && this.state === WebSocketConnectionState.Connected) {
      console.log('WebSocket已连接')
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      this.setState(WebSocketConnectionState.Connecting)

      try {
        // 构建WebSocket URL
        const wsUrl = `ws://wsapi.xfyun.cn/v1/aiui?appid=${appId}&checksum=${authParams.checksum}&curtime=${authParams.curtime}&param=${authParams.param}&signtype=sha256`

        console.log('建立WebSocket连接:', wsUrl)

        this.ws = new WebSocket(wsUrl)

        // 设置超时
        const timeoutId = setTimeout(() => {
          console.error('WebSocket连接超时')
          this.setState(WebSocketConnectionState.Error)
          this.ws?.close()
          reject(new Error('连接超时'))
        }, 10000)

        this.ws.onopen = (event: Event) => {
          console.log('WebSocket连接已建立', event)
          clearTimeout(timeoutId)
          this.setState(WebSocketConnectionState.Connected)
          this.reconnectAttempts = 0
          this.startHeartbeat()
          this.callbacks.onOpen?.()
          resolve()
        }

        this.ws.onmessage = (event: MessageEvent) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data)
            console.log('收到WebSocket消息:', message)
            this.callbacks.onMessage?.(message)
          } catch (error) {
            console.error('解析WebSocket消息失败:', error, event.data)
          }
        }

        this.ws.onerror = (error: Event) => {
          console.error('WebSocket错误:', error)
          clearTimeout(timeoutId)
          this.setState(WebSocketConnectionState.Error)
          this.callbacks.onError?.(error)
          reject(new Error('WebSocket连接错误'))
        }

        this.ws.onclose = (event: CloseEvent) => {
          console.log('[WebSocket.onclose] WebSocket连接已关闭')
          console.log('[WebSocket.onclose] code:', event.code, 'reason:', event.reason)
          console.log('[WebSocket.onclose] wasClean:', event.wasClean)
          console.log('[WebSocket.onclose] reconnectAttempts:', this.reconnectAttempts)
          console.log('[WebSocket.onclose] maxReconnectAttempts:', this.maxReconnectAttempts)
          console.log('[WebSocket.onclose] 当前状态:', this.state)
          console.log('[WebSocket.onclose] 触发重连检查...')

          clearTimeout(timeoutId)
          this.setState(WebSocketConnectionState.Disconnected)
          this.stopHeartbeat()
          this.callbacks.onClose?.(event)

          // 注意：不再此处自动重连，改为由sendQuery方法在需要时重新建立连接
          // 避免认证参数过期和竞态条件问题
          console.log('[WebSocket.onclose] WebSocket连接已关闭, 等待下次查询时自动重连')
          console.log('[WebSocket.onclose] code:', event.code, 'reason:', event.reason)
        }
      } catch (error) {
        console.error('WebSocket连接失败:', error)
        this.setState(WebSocketConnectionState.Error)
        reject(error)
      }
    })
  }

  /**
   * 尝试重连
   */
  private async attemptReconnect(authParams: XunfeiAuthParams, appId: string): void {
    this.reconnectAttempts++
    this.setState(WebSocketConnectionState.Reconnecting)

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
    console.log(`尝试第${this.reconnectAttempts}次重连，延迟${delay}ms`)

    await new Promise(resolve => setTimeout(resolve, delay))

    if (this.reconnectAttempts <= this.maxReconnectAttempts) {
      try {
        await this.connect(authParams, appId)
      } catch (error) {
        console.error('重连失败:', error)
      }
    } else {
      console.error('达到最大重连次数，停止重连')
    }
  }

  /**
   * 断开WebSocket连接
   */
  disconnect(): void {
    this.stopHeartbeat()

    if (this.ws) {
      this.ws.close(1000, '主动关闭')
      this.ws = null
    }

    this.setState(WebSocketConnectionState.Disconnected)
  }

  /**
   * 发送语义查询
   */
  sendQuery(query: string): void {
    console.log('[WebSocket.sendQuery] 开始发送查询:', query)
    console.log('[WebSocket.sendQuery] this.ws存在:', !!this.ws)
    console.log('[WebSocket.sendQuery] state:', this.state)
    console.log('[WebSocket.sendQuery] readyState:', this.ws?.readyState)

    if (!this.ws) {
      console.error('[WebSocket.sendQuery] 错误: this.ws不存在')
      throw new Error('WebSocket实例不存在')
    }

    if (this.state !== WebSocketConnectionState.Connected) {
      console.error('[WebSocket.sendQuery] 错误: 当前状态不是connected, state:', this.state)
      throw new Error('WebSocket未连接, state: ' + this.state)
    }

    this.currentQuery = query
    console.log('[WebSocket.sendQuery] 保存当前查询:', query)

    // 发送查询消息
    const queryMessage = JSON.stringify({
      intent: {
        text: query
      }
    })

    const endMessage = '--end--'

    console.log('[WebSocket.sendQuery] 发送查询消息:', queryMessage)
    console.log('[WebSocket.sendQuery] 发送结束标识:', endMessage)

    this.ws.send(queryMessage)
    this.ws.send(endMessage)

    console.log('[WebSocket.sendQuery] 消息发送完成')
  }

  /**
   * 检查连接状态
   */
  isConnected(): boolean {
    return this.state === WebSocketConnectionState.Connected && this.ws?.readyState === WebSocket.OPEN
  }

  /**
   * 启动心跳保活
   */
  private startHeartbeat(): void {
    this.stopHeartbeat()

    this.heartbeatInterval = window.setInterval(() => {
      if (this.isConnected()) {
        // 发送心跳包（空消息或ping）
        this.ws?.send('ping')
      }
    }, this.heartbeatIntervalMs)
  }

  /**
   * 停止心跳保活
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  /**
   * 设置连接状态
   */
  private setState(newState: WebSocketConnectionState): void {
    if (this.state !== newState) {
      const oldState = this.state
      this.state = newState
      console.log(`WebSocket状态变更: ${oldState} -> ${newState}`)
      this.callbacks.onStateChange?.(newState)
    }
  }

  /**
   * 获取重连次数
   */
  getReconnectAttempts(): number {
    return this.reconnectAttempts
  }

  /**
   * 重置重连次数
   */
  resetReconnectAttempts(): void {
    this.reconnectAttempts = 0
  }

  /**
   * 获取当前查询文本
   */
  getCurrentQuery(): string {
    return this.currentQuery
  }
}
