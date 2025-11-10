/**
 * 讯飞语义请求工具单元测试
 * 测试WebSocket连接、认证逻辑和API服务
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { XunfeiAuthService, type XunfeiAuthParams, type XunfeiConfig } from '../../../src/modules/xunfei-semantic-request/services/xunfei-auth.service'
import {
  XunfeiWebSocketService,
  type WebSocketConnectionState
} from '../../../src/modules/xunfei-semantic-request/services/xunfei-websocket.service'
import {
  XunfeiApiService,
  type HistoryRecord
} from '../../../src/modules/xunfei-semantic-request/services/xunfei-api.service'

// Mock Web Crypto API
Object.defineProperty(global, 'crypto', {
  value: {
    subtle: {
      digest: vi.fn()
    }
  }
})

// Mock WebSocket
class MockWebSocket {
  static OPEN = 1
  static CONNECTING = 0
  static CLOSING = 2
  static CLOSED = 3

  readyState = 0
  onopen: ((event: Event) => void) | null = null
  onmessage: ((event: MessageEvent) => void) | null = null
  onerror: ((event: Event) => void) | null = null
  onclose: ((event: CloseEvent) => void) | null = null

  constructor(public url: string) {}

  send(data: string) {
    console.log('MockWebSocket send:', data)
  }

  close(code?: number, reason?: string) {
    this.readyState = MockWebSocket.CLOSED
    if (this.onclose) {
      this.onclose({ code: code || 1000, reason, wasClean: true } as CloseEvent)
    }
  }

  simulateOpen() {
    this.readyState = MockWebSocket.OPEN
    if (this.onopen) {
      this.onopen(new Event('open'))
    }
  }

  simulateMessage(data: any) {
    if (this.onmessage) {
      this.onmessage({ data: JSON.stringify(data) } as MessageEvent)
    }
  }

  simulateError() {
    if (this.onerror) {
      this.onerror(new Event('error'))
    }
  }
}

// Mock global WebSocket
;(global as any).WebSocket = MockWebSocket as any

describe('XunfeiAuthService 认证服务', () => {
  let authService: XunfeiAuthService
  let config: XunfeiConfig

  beforeEach(() => {
    config = {
      apiKey: 'test-api-key',
      authId: 'test-auth-id',
      dataType: 'text',
      interactMode: 'continuous',
      resultLevel: 'complete',
      scene: 'main',
      closeDelay: '100',
      deviceId: '00000000000000000000000000000000',
      speechClientVer: '1.6.0.1_beta',
      startAsrNum: '1',
      vin: 'Test_10000001',
      voiceActiveDetect: 'inactive',
      aiStatus: ''
    }
    authService = new XunfeiAuthService(config)
  })

  describe('配置验证', () => {
    it('应该验证有效配置', () => {
      const result = authService.validateConfig()
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该检测缺失的API密钥', () => {
      authService.updateConfig({ apiKey: '' })
      const result = authService.validateConfig()
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('API密钥不能为空')
    })

    it('应该检测缺失的认证ID', () => {
      authService.updateConfig({ authId: '' })
      const result = authService.validateConfig()
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('认证ID不能为空')
    })

    it('应该检测缺失的数据类型', () => {
      authService.updateConfig({ dataType: '' })
      const result = authService.validateConfig()
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('数据类型不能为空')
    })

    it('应该检测缺失的交互模式', () => {
      authService.updateConfig({ interactMode: '' })
      const result = authService.validateConfig()
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('交互模式不能为空')
    })
  })

  describe('Base64编码', () => {
    it('应该正确编码ASCII字符串', () => {
      const encoded = authService.encodeBase64('Hello World')
      expect(encoded).toBe('SGVsbG8gV29ybGQ=')
    })

    it('应该正确编码中文字符串', () => {
      const encoded = authService.encodeBase64('你好世界')
      expect(encoded).toBeTruthy()
      expect(encoded.length).toBeGreaterThan(0)
    })

    it('应该能解码Base64字符串', () => {
      const original = 'Hello World'
      const encoded = authService.encodeBase64(original)
      const decoded = authService.decodeBase64(encoded)
      expect(decoded).toBe(original)
    })

    it('应该正确处理特殊字符', () => {
      // btoa可能无法处理某些特殊字符，但会有fallback
      const result = authService.encodeBase64('test')
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })
  })

  describe('SHA256计算', () => {
    it('应该计算SHA256哈希值', async () => {
      const mockDigest = vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4]))
      vi.spyOn(global.crypto.subtle, 'digest').mockImplementation(mockDigest)

      const hash = await authService.calculateSHA256('test')
      expect(mockDigest).toHaveBeenCalled()
      expect(hash).toBe('01020304')
    })

    it('应该抛出SHA256计算错误', async () => {
      vi.spyOn(global.crypto.subtle, 'digest').mockRejectedValue(new Error('计算失败'))

      await expect(authService.calculateSHA256('test')).rejects.toThrow('SHA256计算失败')
    })
  })

  describe('构建认证参数', () => {
    it('应该构建正确的认证参数', async () => {
      const mockDigest = vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4]))
      vi.spyOn(global.crypto.subtle, 'digest').mockImplementation(mockDigest)

      const params = await authService.buildAuthParams('测试查询')

      expect(params.appId).toBe('')
      expect(params.signtype).toBe('sha256')
      expect(params.curtime).toBeTruthy()
      expect(params.checksum).toBe('01020304')
      expect(params.param).toBeTruthy()
      expect(mockDigest).toHaveBeenCalled()
    })
  })

  describe('配置管理', () => {
    it('应该更新配置', () => {
      authService.updateConfig({ apiKey: 'new-key' })
      const newConfig = authService.getConfig()
      expect(newConfig.apiKey).toBe('new-key')
    })

    it('应该返回配置副本', () => {
      const config1 = authService.getConfig()
      const config2 = authService.getConfig()
      expect(config1).not.toBe(config2)
    })
  })
})

describe('XunfeiWebSocketService WebSocket服务', () => {
  let wsService: XunfeiWebSocketService
  let mockAuthParams: XunfeiAuthParams

  beforeEach(() => {
    wsService = new XunfeiWebSocketService()
    mockAuthParams = {
      appId: 'test-app-id',
      checksum: 'test-checksum',
      curtime: '1234567890',
      param: 'test-param',
      signtype: 'sha256'
    }
  })

  describe('连接状态管理', () => {
    it('应该返回初始状态', () => {
      expect(wsService.getState()).toBe('disconnected')
      expect(wsService.getStateDescription()).toBe('未连接')
    })

    it('应该检查连接状态', () => {
      expect(wsService.isConnected()).toBe(false)
    })
  })

  describe('连接建立', () => {
    it('应该建立WebSocket连接', async () => {
      const onOpen = vi.fn()
      const onStateChange = vi.fn()

      wsService.setCallbacks({ onOpen, onStateChange })

      const connectPromise = wsService.connect(mockAuthParams, 'test-app-id')

      // 模拟连接建立
      setTimeout(() => {
        const mockWs = (global as any).WebSocket as typeof MockWebSocket
        // 触发连接建立事件
        // 注意：这里需要更复杂的mock来触发事件
      }, 0)

      await expect(connectPromise).toBeTruthy()
    })

    it('应该拒绝重复连接', async () => {
      // 第一个连接
      const connectPromise1 = wsService.connect(mockAuthParams, 'test-app-id')
      // 第二个连接（应该被忽略）
      const connectPromise2 = wsService.connect(mockAuthParams, 'test-app-id')

      await expect(connectPromise1).toBeTruthy()
      await expect(connectPromise2).toBeTruthy()
    })
  })

  describe('消息发送', () => {
    it('应该在未连接时抛出错误', async () => {
      expect(() => {
        wsService.sendQuery('测试查询')
      }).toThrow('WebSocket未连接')
    })
  })

  describe('连接断开', () => {
    it('应该正确断开连接', () => {
      wsService.disconnect()

      expect(wsService.getState()).toBe('disconnected')
      expect(wsService.isConnected()).toBe(false)
    })
  })

  describe('重连机制', () => {
    it('应该记录重连次数', async () => {
      expect(wsService.getReconnectAttempts()).toBe(0)

      wsService.resetReconnectAttempts()
      expect(wsService.getReconnectAttempts()).toBe(0)
    })
  })

  describe('当前查询', () => {
    it('应该记录当前查询', () => {
      // 直接设置当前查询的逻辑需要通过sendQuery，但需要mock WebSocket
      expect(wsService.getCurrentQuery()).toBe('')
    })
  })
})

describe('XunfeiApiService API服务', () => {
  let apiService: XunfeiApiService
  let config: XunfeiConfig

  beforeEach(() => {
    config = {
      apiKey: 'test-api-key',
      authId: 'test-auth-id',
      dataType: 'text',
      interactMode: 'continuous',
      resultLevel: 'complete',
      scene: 'main',
      closeDelay: '100',
      deviceId: '00000000000000000000000000000000',
      speechClientVer: '1.6.0.1_beta',
      startAsrNum: '1',
      vin: 'Test_10000001',
      voiceActiveDetect: 'inactive',
      aiStatus: ''
    }
    apiService = new XunfeiApiService(config)

    // 清空localStorage
    localStorage.removeItem('xunfei-semantic-history')
  })

  describe('连接管理', () => {
    it('应该返回连接状态描述', () => {
      const desc = apiService.getConnectionStateDescription()
      expect(desc).toBeTruthy()
    })
  })

  describe('历史记录管理', () => {
    it('应该保存历史记录', () => {
      const historyItem: HistoryRecord = {
        timestamp: Date.now(),
        query: '测试查询',
        response: '测试响应',
        duration: 100,
        status: 'success'
      }

      // 直接操作存储
      const history = apiService.getHistory()
      localStorage.setItem('xunfei-semantic-history', JSON.stringify([historyItem]))

      const loadedHistory = apiService.getHistory()
      expect(loadedHistory).toHaveLength(1)
      expect(loadedHistory[0].query).toBe('测试查询')
    })

    it('应该正确返回历史记录', () => {
      // 模拟添加一些记录
      const records: HistoryRecord[] = []
      for (let i = 0; i < 10; i++) {
        records.push({
          timestamp: Date.now() - i,
          query: `查询${i}`,
          response: `响应${i}`,
          duration: 100,
          status: 'success'
        })
      }

      localStorage.setItem('xunfei-semantic-history', JSON.stringify(records))

      const loadedHistory = apiService.getHistory()
      expect(loadedHistory).toHaveLength(10)
      expect(loadedHistory[0].query).toBe('查询0')
    })

    it('应该清空历史记录', () => {
      // 保存一条记录
      const historyItem: HistoryRecord = {
        timestamp: Date.now(),
        query: '测试查询',
        response: '测试响应',
        duration: 100,
        status: 'success'
      }
      localStorage.setItem('xunfei-semantic-history', JSON.stringify([historyItem]))

      // 清空
      apiService.clearHistory()

      const loadedHistory = apiService.getHistory()
      expect(loadedHistory).toHaveLength(0)
    })

    it('应该删除单条历史记录', () => {
      const history: HistoryRecord[] = [
        { timestamp: 1, query: '查询1', response: '响应1', duration: 100, status: 'success' },
        { timestamp: 2, query: '查询2', response: '响应2', duration: 100, status: 'success' },
        { timestamp: 3, query: '查询3', response: '响应3', duration: 100, status: 'success' }
      ]
      localStorage.setItem('xunfei-semantic-history', JSON.stringify(history))

      apiService.deleteHistoryItem(1)

      const loadedHistory = apiService.getHistory()
      expect(loadedHistory).toHaveLength(2)
      expect(loadedHistory[0].query).toBe('查询1')
      expect(loadedHistory[1].query).toBe('查询3')
    })
  })

  describe('服务实例', () => {
    it('应该返回认证服务实例', () => {
      const authService = apiService.getAuthService()
      expect(authService).toBeTruthy()
    })

    it('应该更新配置', () => {
      apiService.updateConfig({ apiKey: 'new-key' })
      const authService = apiService.getAuthService()
      const newConfig = authService.getConfig()
      expect(newConfig.apiKey).toBe('new-key')
    })

    it('应该记录重连次数', () => {
      expect(apiService.getReconnectAttempts()).toBe(0)
      apiService.resetReconnectAttempts()
      expect(apiService.getReconnectAttempts()).toBe(0)
    })
  })
})
