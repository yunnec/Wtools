// ADB快捷指令模块的类型定义

export interface AdbCommand {
  name: string
  description: string
  command: string
}

export interface CommandGroup {
  category: string
  icon: string
  commands: AdbCommand[]
}

export interface CustomCommand {
  id: string
  name: string
  description: string
  command: string
  category: string
  icon: string
  createdAt: string
  updatedAt: string
}

export interface CustomCommandForm {
  name: string
  description: string
  command: string
  category: string
  icon: string
}

export interface CategoryOrder {
  categories: string[]
}
