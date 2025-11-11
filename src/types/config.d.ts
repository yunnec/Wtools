import type { CustomCommand } from './adb-commands'

export interface AppConfig {
  theme: 'light' | 'dark'
  language: string
  modules: Record<string, boolean>
  customCommands: CustomCommand[]
  adbCategoryOrder: string[]
  appVersion: string
}

export interface ConfigService {
  get<T>(key: string): T | undefined
  set<T>(key: string, value: T): void
  getAll(): AppConfig
  reset(): void
  onChange(callback: (key: string, value: any) => void): void
  updateAppVersion(newVersion: string): void
}
