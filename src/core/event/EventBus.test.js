import { eventBus } from './EventBus'

describe('事件总线', () => {
  beforeEach(() => {
    eventBus.removeAllListeners()
  })

  test('应该能够监听和触发事件', () => {
    const handler = vi.fn()
    eventBus.on('test', handler)
    eventBus.emit('test', 'data')
    expect(handler).toHaveBeenCalledWith('data')
  })

  test('应该能够一次性监听事件', () => {
    const handler = vi.fn()
    eventBus.once('test', handler)
    eventBus.emit('test', 'data1')
    eventBus.emit('test', 'data2')
    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith('data1')
  })

  test('应该能够移除监听器', () => {
    const handler = vi.fn()
    eventBus.on('test', handler)
    eventBus.off('test', handler)
    eventBus.emit('test', 'data')
    expect(handler).not.toHaveBeenCalled()
  })

  test('应该能够移除所有监听器', () => {
    const handler1 = vi.fn()
    const handler2 = vi.fn()
    eventBus.on('test1', handler1)
    eventBus.on('test2', handler2)
    eventBus.removeAllListeners()
    eventBus.emit('test1', 'data')
    eventBus.emit('test2', 'data')
    expect(handler1).not.toHaveBeenCalled()
    expect(handler2).not.toHaveBeenCalled()
  })
})
