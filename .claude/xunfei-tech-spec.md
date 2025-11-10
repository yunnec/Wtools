# 讯飞语义请求模块技术实现方案

## 项目概述

基于项目现有的自研语义请求模块（src/modules/semantic-request/），为讯飞WebSocket语义请求API创建新的功能模块。

## 技术架构

### 整体架构图

```
┌─────────────────────────────────────────────────────────┐
│                 XunfeiSemanticRequest.vue               │
│                 （主界面组件）                            │
└────────────┬──────────────────────┬─────────────────────┘
             │                      │
    ┌────────▼────────┐    ┌───────▼────────┐
    │  XunfeiWebSocket │    │ XunfeiAuth     │
    │  （连接管理）     │    │ （认证服务）    │
    └────────┬────────┘    └───────┬───────┘
             │                    │
    ┌────────▼───────────────────▼───────┐
    │        XunfeiApiService            │
    │        （API封装层）                │
    └────────────────┬───────────────────┘
                     │
          ┌───────────▼───────────┐
          │   讯飞WebSocket API   │
          │   ws://wsapi.xfyun... │
          └───────────────────────┘
```

### 目录结构

```
src/modules/xunfei-semantic/
├── index.ts                      # 模块导出
├── XunfeiSemanticRequest.vue     # 主界面组件
├── services/
│   ├── XunfeiWebSocket.ts        # WebSocket管理类
│   ├── XunfeiAuth.ts             # 认证服务
│   └── XunfeiApiService.ts       # API封装层
└── types/
    └── xunfei.ts                 # 类型定义
```

## 核心实现

### 1. 类型定义 (types/xunfei.ts)

```typescript
/**
 * 讯飞API配置接口
 */
export interface XunfeiConfig {
  appId: string
  apiKey: string
  wsUrl: string
  aiuiParams: AIUIParams
  userParams: UserParams
}

/**
 * AIUI参数配置
 */
export interface AIUIParams {
  auth_id: string
  data_type: string
  interact_mode: string
  version?: string
  tts?: {
    voice_name?: string
    speed?: number
    volume?: number
  }
}

/**
 * 用户参数配置
 */
export interface UserParams {
  deviceId: string
  wtAppId: string
  [key: string]: any
}

/**
 * 连接状态枚举
 */
export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error'
}

/**
 * 消息数据类型
 */
export interface XunfeiMessage {
  type: 'intent' | 'tts' | 'tpp' | 'other'
  action?: string
  data?: any
  text?: string
  isEnd?: boolean
}

/**
 * 发送消息结构
 */
export interface SendMessage {
  intent: {
    text: string
  }
}

/**
 * 响应消息结构
 */
export interface ResponseMessage {
  action: string
  data: {
    sub: string
    intent?: {
      text?: string
      [key: string]: any
    }
    [key: string]: any
  }
}
```

### 2. 认证服务 (services/XunfeiAuth.ts)

```typescript
import type { XunfeiConfig } from '../types/xunfei'

export class XunfeiAuth {
  private config: XunfeiConfig

  constructor(config: XunfeiConfig) {
    this.config = config
  }

  /**
   * 计算SHA256校验码
   * 公式: checksum = SHA256(APIKEY + curtime + paramBase64)
   */
  async calculateChecksum(): Promise<string> {
    const curtime = Math.floor(Date.now() / 1000).toString()
    const paramBase64 = this.getParamBase64()

    const message = this.config.apiKey + curtime + paramBase64

    // 使用Web Crypto API
    const encoder = new TextEncoder()
    const data = encoder.encode(message)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))

    return hashArray
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  /**
   * 获取认证头
   */
  async getAuthHeaders(): Promise<Record<string, string>> {
    const checksum = await this.calculateChecksum()
    const curtime = Math.floor(Date.now() / 1000).toString()
    const signtype = 'sha256'
    const paramBase64 = this.getParamBase64()

    return {
      'appId': this.config.appId,
      'checksum': checksum,
      'curtime': curtime,
      'param': paramBase64,
      'signtype': signtype
    }
  }

  /**
   * 获取Base64编码的参数
   */
  private getParamBase64(): string {
    const params = {
      ...this.config.aiuiParams,
      ...this.config.userParams
    }

    return btoa(JSON.stringify(params))
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<XunfeiConfig>): void {
    this.config = { ...this.config, ...config }
  }
}
```

### 3. WebSocket管理类 (services/XunfeiWebSocket.ts)

```typescript
import type { ConnectionStatus, XunfeiMessage } from '../types/xunfei'
import { XunfeiAuth } from './XunfeiAuth'

export class XunfeiWebSocket {
  private ws: WebSocket | null = null
  private config: any
  private auth: XunfeiAuth
  private status: ConnectionStatus = ConnectionStatus.DISCONNECTED
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectInterval = 3000
  private messageHandlers: Set<(message: XunfeiMessage) => void> = new Set()
  private statusHandlers: Set<(status: ConnectionStatus) => void> = new Set()
  private heartbeatInterval: number | null = null

  constructor(config: any, auth: XunfeiAuth) {
    this.config = config
    this.auth = auth
  }

  /**
   * 建立连接
   */
  async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return
    }

    this.updateStatus(ConnectionStatus.CONNECTING)

    try {
      const authHeaders = await this.auth.getAuthHeaders()

      // 构建带认证参数的URL
      const url = new URL(this.config.wsUrl)
      Object.entries(authHeaders).forEach(([key, value]) => {
        url.searchParams.set(key, value)
      })

      this.ws = new WebSocket(url.toString())

      this.ws.onopen = () => {
        console.log('WebSocket连接已建立')
        this.updateStatus(ConnectionStatus.CONNECTED)
        this.reconnectAttempts = 0
        this.startHeartbeat()
      }

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data)
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket错误:', error)
        this.updateStatus(ConnectionStatus.ERROR)
      }

      this.ws.onclose = () => {
        console.log('WebSocket连接已关闭')
        this.updateStatus(ConnectionStatus.DISCONNECTED)
        this.stopHeartbeat()
        this.handleReconnect()
      }
    } catch (error) {
      console.error('连接失败:', error)
      this.updateStatus(ConnectionStatus.ERROR)
      throw error
    }
  }

  /**
   * 发送消息
   */
  sendText(text: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket未连接')
    }

    const message = {
      intent: {
        text: text
      }
    }

    const messageStr = JSON.stringify(message)
    this.ws.send(messageStr)
    this.ws.send('--end--')
  }

  /**
   * 处理接收的消息
   */
  private handleMessage(data: any): void {
    try {
      const message = JSON.parse(data)

      const xunfeiMessage: XunfeiMessage = {
        type: this.getMessageType(message),
        action: message.action,
        data: message.data,
        text: message.data?.intent?.text,
        isEnd: false
      }

      // 检查是否结束标记
      if (data === '--end--') {
        xunfeiMessage.isEnd = true
        this.notifyMessageHandlers({
          type: 'other',
          isEnd: true
        })
        return
      }

      this.notifyMessageHandlers(xunfeiMessage)
    } catch (error) {
      console.error('解析消息失败:', error)
    }
  }

  /**
   * 获取消息类型
   */
  private getMessageType(message: any): XunfeiMessage['type'] {
    if (message.action === 'result') {
      if (message.data?.sub === 'tpp') {
        return 'tpp'
      }
      return 'intent'
    }
    return 'other'
  }

  /**
   * 开始心跳
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = window.setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }))
      }
    }, 30000) // 30秒心跳
  }

  /**
   * 停止心跳
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  /**
   * 处理重连
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      this.updateStatus(ConnectionStatus.RECONNECTING)

      setTimeout(() => {
        console.log(`尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
        this.connect()
      }, this.reconnectInterval)
    }
  }

  /**
   * 关闭连接
   */
  disconnect(): void {
    this.stopHeartbeat()
    this.maxReconnectAttempts = 0 // 避免重连
    this.ws?.close()
  }

  /**
   * 订阅消息
   */
  onMessage(handler: (message: XunfeiMessage) => void): void {
    this.messageHandlers.add(handler)
  }

  /**
   * 取消订阅消息
   */
  offMessage(handler: (message: XunfeiMessage) => void): void {
    this.messageHandlers.delete(handler)
  }

  /**
   * 订阅状态变化
   */
  onStatusChange(handler: (status: ConnectionStatus) => void): void {
    this.statusHandlers.add(handler)
  }

  /**
   * 获取当前状态
   */
  getStatus(): ConnectionStatus {
    return this.status
  }

  /**
   * 更新状态
   */
  private updateStatus(status: ConnectionStatus): void {
    this.status = status
    this.statusHandlers.forEach(handler => handler(status))
  }

  /**
   * 通知消息处理器
   */
  private notifyMessageHandlers(message: XunfeiMessage): void {
    this.messageHandlers.forEach(handler => handler(message))
  }
}
```

### 4. API服务封装 (services/XunfeiApiService.ts)

```typescript
import { XunfeiWebSocket } from './XunfeiWebSocket'
import { XunfeiAuth } from './XunfeiAuth'
import type { XunfeiConfig, XunfeiMessage } from '../types/xunfei'

export class XunfeiApiService {
  private websocket: XunfeiWebSocket
  private auth: XunfeiAuth
  private config: XunfeiConfig

  constructor(config: XunfeiConfig) {
    this.config = config
    this.auth = new XunfeiAuth(config)
    this.websocket = new XunfeiWebSocket(config, this.auth)
  }

  /**
   * 建立连接
   */
  async connect(): Promise<void> {
    await this.websocket.connect()
  }

  /**
   * 发送查询
   */
  async query(
    text: string,
    onMessage: (message: XunfeiMessage) => void
  ): Promise<void> {
    // 注册消息监听器
    const handler = (message: XunfeiMessage) => {
      onMessage(message)
    }

    this.websocket.onMessage(handler)

    try {
      this.websocket.sendText(text)
    } catch (error) {
      this.websocket.offMessage(handler)
      throw error
    }
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    this.websocket.disconnect()
  }

  /**
   * 获取连接状态
   */
  getConnectionStatus(): any {
    return this.websocket.getStatus()
  }

  /**
   * 监听连接状态
   */
  onConnectionStatusChange(handler: (status: any) => void): void {
    this.websocket.onStatusChange(handler)
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<XunfeiConfig>): void {
    this.config = { ...this.config, ...config }
    this.auth.updateConfig(config)
  }
}
```

## 与自研模块的对比

| 特性 | 自研语义请求 | 讯飞语义请求 | 说明 |
|------|-------------|-------------|------|
| 协议 | HTTP POST | WebSocket | 长连接vs短连接 |
| 认证 | appId | SHA256签名 | 更复杂的认证机制 |
| 响应 | 一次性返回 | 流式推送 | 实时数据流 |
| 配置 | 10个应用ID | appId + apiKey | 额外需要密钥 |
| 状态 | 加载/完成 | 连接/断开/重连 | 复杂的状态管理 |
| 错误 | HTTP错误 | 连接错误 | 不同的错误处理 |
| 数据 | JSON格式 | JSON+结束标记 | 需要过滤解析 |

## 关键风险与应对

### 1. WebSocket连接风险
- **风险**: 网络波动、服务器断开
- **应对**: 自动重连、指数退避、状态监控

### 2. 认证失败风险
- **风险**: 时间戳不同步、APIKey错误
- **应对**: 时间校准、错误提示、配置校验

### 3. 数据解析风险
- **风险**: 消息格式变化、编码问题
- **应对**: 健壮的解析逻辑、错误边界

### 4. 安全风险
- **风险**: APIKey泄露、中间人攻击
- **应对**: 敏感信息提示、wss协议、密钥脱敏

## 实施计划

### 阶段1: 基础架构（1-2天）
- [ ] 创建目录结构
- [ ] 实现类型定义
- [ ] 实现认证服务
- [ ] 实现WebSocket管理类
- [ ] 实现API服务封装

### 阶段2: 界面开发（2-3天）
- [ ] 创建主界面组件
- [ ] 实现连接管理UI
- [ ] 实现流式结果显示
- [ ] 实现历史记录功能

### 阶段3: 测试优化（1-2天）
- [ ] 单元测试
- [ ] 集成测试
- [ ] 性能优化
- [ ] 兼容性测试

## 总结

讯飞语义请求模块与自研语义请求在技术架构上有根本差异：
- 从HTTP短连接升级到WebSocket长连接
- 从简单认证升级到SHA256签名
- 从一次性响应升级到流式推送
- 从状态管理升级到连接管理

通过模块化的设计，将复杂逻辑封装在服务层，界面层保持与现有模块的一致性，确保用户体验的连贯性。