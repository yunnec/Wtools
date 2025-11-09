/**
 * EventBus 单元测试
 * 测试事件总线的各种功能
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { eventBus } from '../../../src/core/event'

describe('EventBus 事件总线', () => {
  beforeEach(() => {
    // 每个测试前清空所有监听器
    eventBus.removeAllListeners()
  })

  afterEach(() => {
    eventBus.removeAllListeners()
  })

  describe('on() 方法', () => {
    it('应该可以注册事件监听器', () => {
      const handler = vi.fn()
      eventBus.on('test-event', handler)

      eventBus.emit('test-event', { data: 'test' })

      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith({ data: 'test' })
    })

    it('应该可以注册多个监听器到同一个事件', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()

      eventBus.on('test-event', handler1)
      eventBus.on('test-event', handler2)

      eventBus.emit('test-event', { data: 'test' })

      expect(handler1).toHaveBeenCalledTimes(1)
      expect(handler2).toHaveBeenCalledTimes(1)
    })

    it('不同事件的监听器应该互不影响', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()

      eventBus.on('event1', handler1)
      eventBus.on('event2', handler2)

      eventBus.emit('event1', { data: 'test1' })
      eventBus.emit('event2', { data: 'test2' })

      expect(handler1).toHaveBeenCalledTimes(1)
      expect(handler1).toHaveBeenCalledWith({ data: 'test1' })
      expect(handler2).toHaveBeenCalledTimes(1)
      expect(handler2).toHaveBeenCalledWith({ data: 'test2' })
    })
  })

  describe('once() 方法', () => {
    it('应该只触发一次监听器', () => {
      const handler = vi.fn()
      eventBus.once('test-event', handler)

      eventBus.emit('test-event', { data: 'test1' })
      eventBus.emit('test-event', { data: 'test2' })

      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith({ data: 'test1' })
    })

    it('一次性监听器应该在触发后自动移除', () => {
      const handler = vi.fn()
      eventBus.once('test-event', handler)

      eventBus.emit('test-event', { data: 'test' })
      expect(handler).toHaveBeenCalledTimes(1)

      eventBus.emit('test-event', { data: 'test' })
      expect(handler).toHaveBeenCalledTimes(1) // 仍然是1次
    })
  })

  describe('emit() 方法', () => {
    it('应该正确传递数据给监听器', () => {
      const handler = vi.fn()
      eventBus.on('test-event', handler)

      const testData = {
        id: 1,
        name: '测试',
        nested: { value: 'nested' }
      }

      eventBus.emit('test-event', testData)

      expect(handler).toHaveBeenCalledWith(testData)
    })

    it('应该支持无数据的事件', () => {
      const handler = vi.fn()
      eventBus.on('test-event', handler)

      eventBus.emit('test-event')

      expect(handler).toHaveBeenCalledWith(undefined)
    })

    it('应该支持复杂数据类型', () => {
      const handler = vi.fn()
      eventBus.on('test-event', handler)

      const complexData = {
        string: 'test',
        number: 123,
        boolean: true,
        array: [1, 2, 3],
        object: { key: 'value' },
        null: null,
        undefined: undefined
      }

      eventBus.emit('test-event', complexData)

      expect(handler).toHaveBeenCalledWith(complexData)
    })
  })

  describe('off() 方法', () => {
    it('应该可以移除指定的事件监听器', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()

      eventBus.on('test-event', handler1)
      eventBus.on('test-event', handler2)
      eventBus.off('test-event', handler1)

      eventBus.emit('test-event', { data: 'test' })

      expect(handler1).not.toHaveBeenCalled()
      expect(handler2).toHaveBeenCalledTimes(1)
    })

    it('应该可以移除所有指定事件的监听器', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()

      eventBus.on('test-event', handler1)
      eventBus.on('test-event', handler2)
      eventBus.off('test-event')

      eventBus.emit('test-event', { data: 'test' })

      expect(handler1).not.toHaveBeenCalled()
      expect(handler2).not.toHaveBeenCalled()
    })
  })

  describe('removeAllListeners() 方法', () => {
    it('应该可以清空所有事件的监听器', () => {
      eventBus.on('event1', vi.fn())
      eventBus.on('event2', vi.fn())
      eventBus.on('event3', vi.fn())

      eventBus.removeAllListeners()

      // 验证所有监听器都被清空
      const handler = vi.fn()
      eventBus.on('event1', handler)
      eventBus.emit('event1')

      expect(handler).toHaveBeenCalled()
    })

    it('应该可以清空指定事件的监听器', () => {
      eventBus.on('event1', vi.fn())
      eventBus.on('event2', vi.fn())
      eventBus.on('event3', vi.fn())

      eventBus.removeAllListeners('event2')

      // 验证event2的监听器被清空，但其他事件的监听器还在
      const handler1 = vi.fn()
      const handler3 = vi.fn()

      eventBus.on('event1', handler1)
      eventBus.on('event3', handler3)

      eventBus.emit('event1')
      eventBus.emit('event2')
      eventBus.emit('event3')

      expect(handler1).toHaveBeenCalledTimes(1)
      expect(handler3).toHaveBeenCalledTimes(1)
    })
  })

  describe('边界情况', () => {
    it('在空Map中应该不会报错', () => {
      const handler = vi.fn()
      // 没有注册任何监听器

      expect(() => {
        eventBus.emit('nonexistent-event', { data: 'test' })
      }).not.toThrow()
    })

    it('对不存在的监听器执行off不应该报错', () => {
      const handler = vi.fn()
      eventBus.on('test-event', handler)

      expect(() => {
        eventBus.off('test-event', vi.fn())
      }).not.toThrow()
    })

    it('重复的监听器应该都能收到事件', () => {
      const handler = vi.fn()
      eventBus.on('test-event', handler)
      eventBus.on('test-event', handler)

      eventBus.emit('test-event', { data: 'test' })

      expect(handler).toHaveBeenCalledTimes(2)
    })

    it('在同一事件上混合使用on和once', () => {
      const onHandler = vi.fn()
      const onceHandler = vi.fn()

      eventBus.on('test-event', onHandler)
      eventBus.once('test-event', onceHandler)

      eventBus.emit('test-event', { data: 'test1' })
      eventBus.emit('test-event', { data: 'test2' })

      expect(onHandler).toHaveBeenCalledTimes(2)
      expect(onceHandler).toHaveBeenCalledTimes(1)
    })
  })

  describe('性能测试', () => {
    it('应该能处理大量监听器', () => {
      const handlers = Array.from({ length: 100 }, () => vi.fn())
      const eventName = 'test-event'

      handlers.forEach(handler => {
        eventBus.on(eventName, handler)
      })

      eventBus.emit(eventName, { data: 'test' })

      handlers.forEach(handler => {
        expect(handler).toHaveBeenCalledTimes(1)
      })
    })

    it('应该能处理频繁的emit调用', () => {
      const handler = vi.fn()
      eventBus.on('test-event', handler)

      const emitCount = 1000
      for (let i = 0; i < emitCount; i++) {
        eventBus.emit('test-event', { index: i })
      }

      expect(handler).toHaveBeenCalledTimes(emitCount)
    })
  })
})
