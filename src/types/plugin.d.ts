export interface PluginMeta {
  id: string
  name: string
  version: string
  description: string
  author?: string
  dependencies?: string[]
  capabilities?: PluginCapability[]
  configSchema?: PluginConfigSchema
}

export interface PluginCapability {
  name: string
  description: string
  required?: boolean
}

export interface PluginConfigSchema {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object'
    default: any
    description?: string
    required?: boolean
    options?: any[]
  }
}

export interface PluginContext {
  id: string
  services: {
    eventBus: import('./event').EventBus
    theme: import('./theme').ThemeService
    config: import('./config').ConfigService
  }
  config: Record<string, any>
  logger: PluginLogger
}

export interface PluginLogger {
  debug(message: string, ...args: any[]): void
  info(message: string, ...args: any[]): void
  warn(message: string, ...args: any[]): void
  error(message: string, ...args: any[]): void
}

export interface PluginHooks {
  beforeLoad?(context: PluginContext): Promise<void> | void
  afterLoad?(context: PluginContext): Promise<void> | void
  beforeUnload?(context: PluginContext): Promise<void> | void
  afterUnload?(context: PluginContext): Promise<void> | void
  onError?(error: Error, context: PluginContext): Promise<void> | void
}

export interface PluginModule {
  id: string
  component: any
  meta: PluginMeta
  initialize(context: PluginContext): Promise<void>
  destroy(context: PluginContext): Promise<void>
  hooks?: PluginHooks
}

export interface Plugin {
  meta: PluginMeta
  context: PluginContext
  install(context: PluginContext): Promise<void>
  initialize(context: PluginContext): Promise<void>
  destroy(context: PluginContext): Promise<void>
  getModule(): PluginModule
  getConfig(): Record<string, any>
  setConfig(config: Record<string, any>): void
}

export interface PluginManager {
  loadPlugin(id: string, config?: Record<string, any>): Promise<Plugin>
  unloadPlugin(id: string): Promise<void>
  listPlugins(): Plugin[]
  registerModule(module: PluginModule): void
  getModule(id: string): PluginModule | undefined
  getPluginContext(id: string): PluginContext | undefined
  validatePlugin(module: PluginModule): Promise<{ valid: boolean; errors: string[] }>
}

export interface PluginTestContext {
  eventBus: import('./event').EventBus
  theme: import('./theme').ThemeService
  config: import('./config').ConfigService
  createMockPlugin(): PluginModule
  waitForEvent(event: string, timeout?: number): Promise<any>
}
