import type { EventHandler, EventBus } from '../../types/event'

/**
 * 事件总线 - 实现模块间解耦通信
 * 支持事件监听、一次性监听、触发和移除
 */
class EventBusImpl implements EventBus {
  private handlers = new Map<string, Set<EventHandler>>()
  private onceHandlers = new Map<string, Set<EventHandler>>()

  /**
   * 监听事件
   */
  on<T>(event: string, handler: EventHandler<T>): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set())
    }
    this.handlers.get(event)!.add(handler as EventHandler)
    console.log(`[EventBus] 注册事件监听器: "${event}"`)
  }

  /**
   * 一次性监听事件（触发后自动移除）
   */
  once<T>(event: string, handler: EventHandler<T>): void {
    if (!this.onceHandlers.has(event)) {
      this.onceHandlers.set(event, new Set())
    }
    this.onceHandlers.get(event)!.add(handler as EventHandler)
  }

  /**
   * 触发事件
   */
  emit<T>(event: string, data: T): void {
    console.log(`[EventBus] 触发事件: "${event}", 监听器数量: ${this.handlers.get(event)?.size || 0}`)
    // 处理普通监听器
    const regularHandlers = this.handlers.get(event)
    if (regularHandlers) {
      regularHandlers.forEach(handler => {
        console.log(`[EventBus] 调用事件处理器: "${event}"`)
        handler(data)
      })
    } else {
      console.log(`[EventBus] 警告: 没有找到事件 "${event}" 的监听器`)
    }

    // 处理一次性监听器
    const onceHandlers = this.onceHandlers.get(event)
    if (onceHandlers) {
      onceHandlers.forEach(handler => handler(data))
      this.onceHandlers.delete(event)
    }
  }

  /**
   * 移除事件监听器
   */
  off(event: string, handler?: EventHandler): void {
    if (handler) {
      // 移除特定处理器
      this.handlers.get(event)?.delete(handler as EventHandler)
      this.onceHandlers.get(event)?.delete(handler as EventHandler)
    } else {
      // 移除所有处理器
      this.handlers.delete(event)
      this.onceHandlers.delete(event)
    }
  }

  /**
   * 移除所有监听器
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.handlers.delete(event)
      this.onceHandlers.delete(event)
    } else {
      this.handlers.clear()
      this.onceHandlers.clear()
    }
  }
}

// 导出单例实例
export const eventBus = new EventBusImpl()
export default eventBus
