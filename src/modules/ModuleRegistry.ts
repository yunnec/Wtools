/**
 * 模块注册表 - 管理所有可用模块
 */

export interface ModuleConfig {
  id: string
  name: string
  description: string
  icon: string
  category: 'file' | 'text' | 'calc' | 'convert' | 'image' | 'other'
  version: string
  author: string
  component?: any
}

export const moduleRegistry: ModuleConfig[] = [
  {
    id: 'file-manager',
    name: '文件管理器',
    description: '浏览和管理本地文件',
    icon: '📁',
    category: 'file',
    version: '1.0.0',
    author: '梧桐工具箱团队'
  },
  {
    id: 'text-editor',
    name: '文本编辑器',
    description: '编辑和查看文本文件',
    icon: '✏️',
    category: 'text',
    version: '1.0.0',
    author: '梧桐工具箱团队'
  },
  {
    id: 'calculator',
    name: '计算器',
    description: '执行基础和高级数学计算',
    icon: '🧮',
    category: 'calc',
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
    id: 'url-tool',
    name: 'URL工具',
    description: 'URL编码/解码、参数解析',
    icon: '🔗',
    category: 'convert',
    version: '1.0.0',
    author: '梧桐工具箱团队'
  },
  {
    id: 'qrcode',
    name: '二维码生成器',
    description: '生成和解析二维码',
    icon: '📱',
    category: 'image',
    version: '1.0.0',
    author: '梧桐工具箱团队'
  },
  {
    id: 'example-plugin',
    name: '示例插件 - 记事本',
    description: '展示插件 API 使用方法的示例插件',
    icon: '📝',
    category: 'other',
    version: '1.0.0',
    author: '梧桐工具箱团队'
  },
  {
    id: 'plugin-store',
    name: '插件商店',
    description: '浏览、安装和管理插件',
    icon: '🔌',
    category: 'other',
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
