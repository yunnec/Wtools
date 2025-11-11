/**
 * 模块注册表 - 管理所有可用模块
 */

export interface ModuleConfig {
  id: string
  name: string
  description: string
  icon: string
  category: 'file' | 'text' | 'calc' | 'convert' | 'image' | 'other' | 'tool'
  version: string
  author: string
  component?: any
}

export const moduleRegistry: ModuleConfig[] = [
  {
    id: 'shortcut-commands',
    name: 'ADB快捷指令',
    description: '一键执行ADB命令，无需记忆复杂指令',
    icon: '⚡',
    category: 'tool',
    version: '1.0.0',
    author: '梧桐工具箱团队'
  },
  {
    id: 'semantic-compare',
    name: '语义对比',
    description: '对比讯飞和自研语义请求的结果',
    icon: '⚖️',
    category: 'other',
    version: '1.0.0',
    author: '梧桐工具箱团队'
  },
  {
    id: 'xunfei-semantic-request',
    name: '讯飞语义请求',
    description: '发送文本获取讯飞语义理解结果',
    icon: '🗣️',
    category: 'other',
    version: '1.0.0',
    author: '梧桐工具箱团队'
  },
  {
    id: 'semantic-request',
    name: '自研语义请求',
    description: '发送文本获取语义请求结果',
    icon: '🧠',
    category: 'other',
    version: '1.0.0',
    author: '梧桐工具箱团队'
  },
  {
    id: 'color-picker',
    name: '颜色选择器',
    description: '选择颜色、生成调色板、格式转换',
    icon: '🎨',
    category: 'image',
    version: '1.0.0',
    author: '梧桐工具箱团队'
  },
  {
    id: 'json-tool',
    name: 'JSON工具',
    description: '格式化、验证、压缩JSON数据',
    icon: '📋',
    category: 'text',
    version: '1.0.0',
    author: '梧桐工具箱团队'
  },
  {
    id: 'base64-tool',
    name: 'Base64工具',
    description: 'Base64编码和解码',
    icon: '🔐',
    category: 'convert',
    version: '1.0.0',
    author: '梧桐工具箱团队'
  },
  {
    id: 'log-decompress',
    name: '236日志解压',
    description: '自动解密并解压车机日志文件',
    icon: '📦',
    category: 'file',
    version: '1.0.0',
    author: '梧桐工具箱团队'
  }
]

export const getModulesByCategory = (category?: string) => {
  if (!category) return moduleRegistry
  return moduleRegistry.filter(m => m.category === category)
}

export const getModuleById = (id: string) => {
  return moduleRegistry.find(m => m.id === id)
}
