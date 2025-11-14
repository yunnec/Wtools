// ADB快捷指令模块的类型定义

export interface AdbCommand {
  name: string
  description: string
  command: string
  presetId?: string  // 预定义命令的唯一标识（基于category+name+command生成）
  isCustom?: boolean // 是否为自定义命令
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
  presetId?: string  // 预定义命令的唯一标识（可选）
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
