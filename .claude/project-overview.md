# 梧桐工具箱 - 项目概览

## 📊 项目基本信息

- **项目名称**: 梧桐工具箱 (wutong-toolbox)
- **版本**: v1.0.0
- **类型**: 桌面工具箱 (Tauri + Vue3)
- **开发语言**: TypeScript + Rust
- **包管理器**: npm

## 🏗️ 技术架构

### 前端技术栈
- **框架**: Vue 3.5.24 (组合式API)
- **语言**: TypeScript 5.9.3
- **构建工具**: Vite 7.2.2
- **样式**: Tailwind CSS 3.4.18
- **测试**: Vitest 4.0.8 + Playwright 1.56.1

### 桌面应用
- **框架**: Tauri 2.0 (Rust后端 + Web前端)
- **支持平台**: Windows/macOS/Linux
- **包名**: com.wangyu.wutong-toolbox

### 架构模式
- **微内核+插件架构**: 高度可扩展
- **事件驱动通信**: EventBus实现解耦
- **模块化设计**: 每个工具独立模块
- **响应式状态管理**: Vue 3 Composition API

## 🎯 核心系统

### 1. 事件总线 (EventBus)
- **位置**: `src/core/event/EventBus.ts`
- **功能**: 模块间解耦通信
- **特性**:
  - 支持事件监听 (`on`)
  - 支持一次性监听 (`once`)
  - 支持事件触发 (`emit`)
  - 支持移除监听器 (`off`)

### 2. 配置管理 (ConfigService)
- **位置**: `src/core/config/ConfigService.ts`
- **功能**: 管理应用配置，支持持久化
- **特性**:
  - 本地存储持久化
  - 配置变化监听
  - 类型安全访问
  - 自动同步事件

### 3. 主题服务 (ThemeService)
- **位置**: `src/core/theme/ThemeService.ts`
- **功能**: 亮/暗主题切换
- **特性**:
  - 自动加载保存的主题
  - DOM类名自动切换
  - 主题变更事件通知
  - 本地存储持久化

### 4. 模块注册表 (ModuleRegistry)
- **位置**: `src/modules/ModuleRegistry.ts`
- **功能**: 管理所有可用工具模块
- **特性**:
  - 模块元数据管理
  - 分类筛选
  - ID查找
  - 懒加载支持

## 🛠️ 现有模块 (6个)

### 1. ADB快捷指令
- **路径**: `src/modules/shortcut-commands/`
- **功能**: 一键执行ADB命令
- **特点**:
  - 支持8个分类（应用管理、服务管理等）
  - 搜索功能
  - 分类过滤
  - Web演示模式 + Tauri执行模式
  - 中文注释完整

### 2. 讯飞语义请求
- **路径**: `src/modules/xunfei-semantic-request/`
- **功能**: 讯飞语义理解API调用
- **特点**:
  - WebSocket连接
  - 自动重连机制
  - 认证服务
  - 数据转换服务
  - Rust后端支持

### 3. 自研语义请求
- **路径**: `src/modules/semantic-request/`
- **功能**: 自研语义理解系统
- **特点**: 作为讯飞API的备选方案

### 4. 颜色选择器
- **路径**: `src/modules/color-picker/`
- **功能**: 颜色选择、调色板生成
- **特点**: 图像处理工具

### 5. JSON工具
- **路径**: `src/modules/json-tool/`
- **功能**: JSON格式化、验证、压缩
- **特点**: 文本处理工具

### 6. Base64工具
- **路径**: `src/modules/base64-tool/`
- **功能**: Base64编码和解码
- **特点**: 编码转换工具

## 📁 项目结构

```
wutong-toolbox/
├── src/                          # 前端源码
│   ├── App.vue                   # 主应用入口
│   ├── main.js                   # 入口脚本
│   ├── index.html                # HTML模板
│   ├── styles.css                # 全局样式
│   │
│   ├── core/                     # 核心系统
│   │   ├── event/
│   │   │   ├── EventBus.ts       # 事件总线实现
│   │   │   └── index.ts          # 导出
│   │   ├── config/
│   │   │   ├── ConfigService.ts  # 配置服务
│   │   │   └── index.ts
│   │   └── theme/
│   │       ├── ThemeService.ts   # 主题服务
│   │       └── index.ts
│   │
│   ├── modules/                  # 工具模块
│   │   ├── ModuleRegistry.ts     # 模块注册表
│   │   ├── shortcut-commands/    # ADB快捷指令
│   │   ├── xunfei-semantic-request/  # 讯飞语义
│   │   ├── semantic-request/     # 自研语义
│   │   ├── color-picker/         # 颜色选择器
│   │   ├── json-tool/            # JSON工具
│   │   └── base64-tool/          # Base64工具
│   │
│   ├── components/               # 公共组件
│   │   └── ui/
│   │       └── ThemeToggle.vue   # 主题切换按钮
│   │
│   ├── types/                    # 类型定义
│   │   ├── config.d.ts           # 配置类型
│   │   ├── event.d.ts            # 事件类型
│   │   └── plugin.d.ts           # 插件类型
│   │
│   └── test/                     # 测试工具
│       └── test-utils.ts
│
├── src-tauri/                    # Tauri配置
│   ├── src/
│   │   ├── lib.rs                # Rust后端实现
│   │   └── main.rs               # 入口
│   ├── tauri.conf.json           # Tauri配置
│   ├── Cargo.toml                # Rust依赖
│   └── icons/                    # 应用图标
│
├── docs/                         # 文档
│   └── PLUGIN_DEVELOPMENT.md     # 插件开发指南
│
├── tests/                        # 测试
│   ├── unit/                     # 单元测试
│   │   ├── core/                 # 核心系统测试
│   │   └── modules/              # 模块测试
│   └── e2e/                      # E2E测试
│
├── CLAUDE.md                     # 开发准则
├── README.md                     # 项目介绍
├── VERSION_HISTORY.md            # 版本历史
├── package.json                  # Node依赖
├── vite.config.js                # Vite配置
├── tailwind.config.js            # Tailwind配置
├── tsconfig.json                 # TypeScript配置
└── vitest.config.ts              # Vitest配置
```

## 📝 编码规范

### 1. 语言使用
- **强制使用简体中文**: 所有注释、文档、提交信息
- **代码标识符**: 遵循既有命名约定（英文）

### 2. 代码风格
- **TypeScript严格模式**: 类型安全
- **Vue组合式API**: 现代化开发
- **Tailwind CSS**: 原子化样式
- **中文注释**: 详细说明意图

### 3. 文件组织
- **核心系统**: `core/` 目录
- **工具模块**: `modules/` 目录
- **公共组件**: `components/` 目录
- **类型定义**: `types/` 目录

### 4. 模块结构
每个工具模块包含：
- `*.vue` - Vue组件
- `index.ts` - 模块导出
- 独立服务（如果需要）

## 🧪 测试体系

### 测试统计 (v1.0.0)
- **测试用例**: 111个
- **代码覆盖率**: 78.5%
- **单元测试**: 56个（核心系统）
- **工具测试**: 45个（Calculator, JsonTool）
- **E2E测试**: 15个场景
- **测试框架**: Vitest + Playwright

### 性能指标
- **构建时间**: 1.95秒
- **总大小**: ~134 kB (gzip: ~37 kB)
- **代码分割**: 100%
- **首屏加载**: < 800ms
- **模块切换**: < 200ms
- **性能等级**: A级

## 🚀 开发流程

### 1. 项目启动
```bash
npm install          # 安装依赖
npm run dev          # 启动开发服务器
npm run tauri dev    # 启动Tauri桌面应用
```

### 2. 构建部署
```bash
npm run build        # 构建前端
npm run tauri build  # 构建桌面应用
```

### 3. 测试
```bash
npm run test         # 运行单元测试
npm run test:ui      # UI模式测试
npm run test:run     # 一次性运行所有测试
npm run test:coverage # 代码覆盖率
npm run test:e2e     # E2E测试
```

## 🔌 插件系统

### 架构设计
- **微内核+插件**: 高度可扩展
- **生命周期管理**: 完整的加载/销毁流程
- **上下文隔离**: 每个插件独立执行
- **事件驱动**: 通过事件总线通信

### 插件开发指南
- 详细文档: `docs/PLUGIN_DEVELOPMENT.md`
- 包含API、生命周期、配置管理等
- 提供测试框架和最佳实践

## 📊 Rust后端

### 已实现功能
1. **execute_command**: 执行系统命令
   - 支持任意shell命令
   - 返回标准输出/错误
   - 状态码检查

2. **open_file_dialog**: 文件选择对话框
   - 待完善实现

### 扩展能力
- Tauri 2.0 原生支持
- 可添加更多系统调用
- 支持文件操作、网络请求等

## 🎨 UI/UX设计

### 设计特点
- **响应式设计**: 支持移动/平板/桌面
- **主题系统**: 亮色/暗色主题
- **实时搜索**: 快速定位工具
- **键盘快捷键**: Esc、Ctrl+K支持
- **流畅动画**: Vue Transition

### 色彩方案
- **主色调**: 蓝色 (#3B82F6)
- **亮色主题**: 白色背景 + 灰色面板
- **暗色主题**: 深色背景 + 灰色面板
- **状态色**: 成功(绿)、警告(黄)、错误(红)

## 🔄 事件系统

### 常用事件
- `app:ready`: 应用启动完成
- `theme:changed`: 主题切换
- `module:opened`: 模块打开
- `module:closed`: 模块关闭
- `config:changed`: 配置变更

### 事件使用
```typescript
// 监听事件
eventBus.on('event:name', (data) => {
  console.log('收到事件:', data)
})

// 触发事件
eventBus.emit('event:name', { data: 'value' })
```

## 💡 扩展指南

### 添加新模块
1. 在 `src/modules/` 创建新目录
2. 创建 `*.vue` 组件
3. 创建 `index.ts` 导出
4. 在 `ModuleRegistry.ts` 注册
5. 在 `App.vue` 添加懒加载

### 核心系统扩展
- **EventBus**: 添加新事件类型
- **ConfigService**: 扩展配置字段
- **ThemeService**: 添加新主题
- **Rust后端**: 添加新命令

## 📚 参考文档

- [插件开发指南](./docs/PLUGIN_DEVELOPMENT.md)
- [CLAUDE.md](./CLAUDE.md) - 开发准则
- [VERSION_HISTORY.md](./VERSION_HISTORY.md) - 版本历史
- [Tauri文档](https://tauri.app/)
- [Vue3文档](https://cn.vuejs.org/)
- [Tailwind文档](https://tailwindcss.com/)

## ✅ 已掌握要点

1. ✅ 理解微内核+插件架构
2. ✅ 掌握事件驱动通信模式
3. ✅ 熟悉Vue 3 + TypeScript开发
4. ✅ 了解Tauri桌面应用开发
5. ✅ 掌握Tailwind CSS样式系统
6. ✅ 熟悉测试框架Vitest
7. ✅ 理解代码规范和文档要求
8. ✅ 了解性能优化策略

---

**准备就绪！** 我已经完全熟悉梧桐工具箱的架构、设计规范和开发流程，可以开始开发新功能。
