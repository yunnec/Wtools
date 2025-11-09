export interface EventHandler<T = any> {
  (data: T): void;
}

export interface EventBus {
  on<T>(event: string, handler: EventHandler<T>): void;
  once<T>(event: string, handler: EventHandler<T>): void;
  emit<T>(event: string, data: T): void;
  off(event: string, handler?: EventHandler): void;
  removeAllListeners(event?: string): void;
}
