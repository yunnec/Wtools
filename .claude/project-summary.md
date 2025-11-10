# 梧桐工具箱 - 项目知识总结

## 项目概览

**梧桐工具箱** (Wutong Toolbox) 是一个基于 Tauri 框架开发的桌面工具箱应用，提供了多种实用工具的集合。项目采用模块化架构，具有良好的扩展性和可维护性。

### 关键信息
- **项目名称**: 梧桐工具箱 (wutong-toolbox)
- **版本**: 0.1.0
- **技术栈**: Tauri 2.0 + Vue 3 + TypeScript + Vite + Tailwind CSS
- **开发语言**: Rust (后端) + TypeScript/JavaScript (前端)
- **许可证**: MIT License
- **模块数量**: 6个核心工具模块

## 技术架构

### 前端技术栈
- **Vue 3.5.24**: 使用组合式 API，响应式框架
- **TypeScript 5.9.3**: 类型安全，strict 模式
- **Vite 7.2.2**: 现代化构建工具，快速热重载
- **Tailwind CSS 3.4.18**: 实用优先的 CSS 框架
- **模块化设计**: 异步组件加载，代码分割

### 桌面应用框架
- **Tauri 2.0**: Rust 后端 + Web 前端的混合应用框架
- **跨平台支持**: Windows、macOS、Linux
- **安全模型**: CSP (Content Security Policy) 配置
- **权限管理**: Capabilities 系统

### 构建与开发工具
- **包管理器**: npm (package.json)
- **测试框架**: Vitest (单元测试) + Playwright (E2E 测试)
- **代码覆盖率**: v8 引擎，要求 ≥80%
- **代码质量**: 自动化测试，TypeScript 严格模式

## 核心系统架构

### 1. 事件驱动架构
**文件**: `src/core/event/EventBus.ts`
- 支持事件监听 on()
- 支持一次性监听 once()
- 支持事件触发 emit()
- 支持事件移除 off()
- 支持批量移除 removeAllListeners()

### 2. 配置管理服务
**文件**: `src/core/config/ConfigService.ts`
- 本地存储持久化
- 支持配置变化监听
- 主题配置集成
- 事件总线集成

### 3. 主题系统
**文件**: `src/core/theme/ThemeService.ts`
- 支持亮色/暗色主题切换
- DOM 类名自动切换
- 本地存储持久化
- 事件通知机制

### 4. 模块注册表
**文件**: `src/modules/ModuleRegistry.ts`
- 集中管理所有工具模块
- 分类管理 (tool/other/image/text/convert)
- 动态组件加载
- 搜索功能支持

## 功能模块清单

### 6 个核心工具模块

1. **ADB快捷指令** (`/shortcut-commands`)
   - 一键执行ADB命令（32个常用命令）
   - 6个功能分类：应用管理、设备信息、文件操作、日志调试、网络调试、系统管理
   - Web演示模式 + Tauri执行模式
   - 实时搜索和分类过滤

2. **讯飞语义请求** (`/xunfei-semantic-request`)
   - 讯飞语义理解 API 集成
   - 文本分析功能

3. **自研语义请求** (`/semantic-request`)
   - 自研语义分析功能
   - 定制化处理

4. **颜色选择器** (`/color-picker`)
   - 颜色选择功能
   - 调色板生成
   - 格式转换

5. **JSON工具** (`/json-tool`)
   - JSON 格式化
   - JSON 验证
   - JSON 压缩

6. **Base64工具** (`/base64-tool`)
   - Base64 编码
   - Base64 解码

### 核心组件

1. **主应用** (`src/App.vue`)
   - 侧边栏导航
   - 搜索功能
   - 动态模块加载
   - 主题切换

2. **主题切换按钮** (`src/components/ui/ThemeToggle.vue`)
   - 亮色/暗色主题切换
   - SVG 图标动态切换

## 代码质量与测试

### 测试体系

#### 单元测试 (Vitest)
**目录**: `tests/unit/`
- **测试框架**: Vitest
- **测试环境**: happy-dom
- **覆盖率要求**: 80% (branches/functions/lines/statements)
- **测试文件**:
  - `core/themeService.test.ts` - 主题服务测试
  - `core/eventBus.test.ts` - 事件总线测试
  - `core/pluginManager.test.ts` - 插件管理器测试
  - `modules/calculator.test.ts` - 计算器测试
  - `modules/jsonTool.test.ts` - JSON 工具测试
  - `modules/semanticRequest.test.ts` - 语义请求测试
  - `modules/xunfeiSemanticRequest.test.ts` - 讯飞语义请求测试

#### E2E 测试 (Playwright)
**文件**: `tests/e2e/main-flow.spec.ts`
- **测试框架**: Playwright
- **测试场景**:
  - 主页显示
  - 工具搜索
  - 模块开关
  - 主题切换
  - 键盘快捷键
  - 计算器功能
  - JSON 工具功能
  - Base64 工具功能
  - 颜色选择器功能
  - 响应式设计 (移动端/平板)
  - 插件系统

### 代码风格
- **中文注释**: 所有代码注释使用简体中文
- **UTF-8 编码**: 所有文件使用 UTF-8 无 BOM 编码
- **TypeScript 严格模式**: 启用严格类型检查
- **模块化设计**: 单一职责，职责分离
- **异步组件**: 使用 `defineAsyncComponent` 懒加载

## 文件结构

```
wutong-toolbox/
├── src/                          # 前端源码
│   ├── App.vue                   # 主应用组件
│   ├── main.ts                   # 应用入口
│   ├── styles.css                # 全局样式
│   ├── components/               # 公共组件
│   │   └── ui/
│   │       └── ThemeToggle.vue   # 主题切换按钮
│   ├── core/                     # 核心系统
│   │   ├── config/               # 配置管理
│   │   │   ├── ConfigService.ts  # 配置服务
│   │   │   └── index.ts
│   │   ├── event/                # 事件系统
│   │   │   ├── EventBus.ts       # 事件总线
│   │   │   └── index.ts
│   │   ├── theme/                # 主题系统
│   │   │   ├── ThemeService.ts   # 主题服务
│   │   │   └── index.ts
│   │   └── plugin.bak/           # 插件系统 (已废弃)
│   ├── modules/                  # 工具模块
│   │   ├── ModuleRegistry.ts     # 模块注册表
│   │   ├── shortcut-commands/    # ADB快捷指令
│   │   ├── xunfei-semantic-request/  # 讯飞语义请求
│   │   ├── semantic-request/     # 自研语义请求
│   │   ├── color-picker/         # 颜色选择器
│   │   ├── json-tool/            # JSON 工具
│   │   └── base64-tool/          # Base64 工具
│   └── types/                    # 类型定义
├── src-tauri/                    # Tauri Rust 后端
│   ├── src/
│   │   ├── main.rs               # Rust 主程序入口
│   │   └── lib.rs                # Tauri 应用配置
│   ├── Cargo.toml                # Rust 依赖配置
│   ├── tauri.conf.json           # Tauri 应用配置
│   ├── build.rs                  # 构建配置
│   ├── capabilities/             # 权限配置
│   └── icons/                    # 应用图标
├── docs/                         # 项目文档
│   └── PLUGIN_DEVELOPMENT.md     # 插件开发指南
├── tests/                        # 测试
│   ├── unit/                     # 单元测试
│   │   ├── core/                 # 核心系统测试
│   │   └── modules/              # 模块测试
│   └── e2e/                      # E2E 测试
│       └── main-flow.spec.ts
├── .claude/                      # Claude 工作区
│   ├── project-summary.md        # 项目总结
│   └── cleanup-report.md         # 清理报告
├── package.json                  # 项目配置
├── vite.config.js                # Vite 配置
├── tsconfig.json                 # TypeScript 配置
├── tailwind.config.js            # Tailwind CSS 配置
├── vitest.config.ts              # Vitest 配置
├── CLAUDE.md                     # 开发准则
├── VERSION_HISTORY.md            # 版本历史
└── README.md                     # 项目说明
```

## 开发流程

### 开发命令
```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# Tauri 开发
npm run tauri dev

# Tauri 构建
npm run tauri build

# 运行测试
npm run test

# 运行测试 UI
npm run test:ui

# 运行测试 (无 UI)
npm run test:run

# 代码覆盖率测试
npm run test:coverage

# E2E 测试
npm run test:e2e
```

### 核心工作流程
1. **分析需求**: 使用 sequential-thinking 工具
2. **获取上下文**: 执行 7 步强制检索清单
3. **选择工具**: 根据任务类型选择合适工具
4. **执行任务**: 使用 Read/Edit/Write 直接编码
5. **验证质量**: 运行测试，检查覆盖率
6. **存储知识**: 更新操作日志和验证报告

## 配置与设置

### TypeScript 配置
- **严格模式**: 启用所有严格检查
- **模块化**: ESNext 模块系统
- **目标**: ES2020
- **路径映射**: `@/` 映射到 `src/`

### Tailwind CSS 配置
- **暗黑模式**: class 模式
- **自定义颜色**:
  - `primary`: 蓝色系调色板
  - `dark`: 自定义深色主题色
- **动画**: fade-in, slide-up, theme-switch
- **自定义工具类**: btn-primary, card, input-field, search-input

### Vite 配置
- **Vue 插件**: @vitejs/plugin-vue
- **路径别名**: @ → src
- **测试配置**: 集成 Vitest

### Vitest 配置
- **测试环境**: happy-dom
- **覆盖率提供器**: v8
- **覆盖率阈值**: 全局 80%
- **覆盖率报告格式**: text, json, html, lcov

## ADB快捷指令模块详解

ADB快捷指令是项目的核心特色功能，提供32个常用ADB命令的快速执行入口。

### 命令分类
1. **应用管理** (6个)
   - 启动应用、停止应用、重启应用
   - 安装应用、卸载应用、查看版本

2. **设备信息** (4个)
   - 列出设备、查看型号、查看版本

3. **文件操作** (4个)
   - 推送文件、拉取文件、查看文件

4. **日志调试** (4个)
   - 查看日志、过滤日志、保存日志

5. **网络调试** (4个)
   - TCP/IP模式、WiFi连接、端口转发

6. **系统管理** (10个)
   - 查看进程、磁盘、内存、截屏、录屏等

### 技术实现
- **前端**: Vue 3 Composition API
- **后端**: Tauri 2.0 Rust 命令执行
- **环境自适应**: Web演示模式 + Tauri执行模式
- **动态导入**: 按需加载Tauri API
- **错误处理**: 完善的异常处理机制

## 安全考虑

1. **CSP**: 配置了 Content Security Policy
2. **权限模型**: Tauri Capabilities 系统
3. **数据存储**: 本地存储，不涉及敏感数据传输
4. **插件隔离**: 已移除插件系统，简化安全模型

## 未来规划

### 已废弃功能
- **插件系统**: 已删除，需要时可以考虑恢复
- **文件管理器**: 曾存在，已删除
- **文本编辑器**: 曾存在，已删除
- **计算器**: 已删除
- **URL工具**: 已删除
- **二维码生成器**: 已删除

### 当前状态 (2025-11-10)
**保留模块**: 6个
- 1个工具类: ADB快捷指令 (32个常用命令，6个分类)
- 2个语义请求模块: 讯飞语义请求、自研语义请求
- 3个实用工具: 颜色选择器、JSON工具、Base64工具

### 潜在发展方向
1. **更多ADB命令**: 扩展ADB快捷指令功能
2. **云端同步**: 配置和数据的云端同步
3. **自定义主题**: 用户自定义主题颜色
4. **快捷键系统**: 完整的快捷键支持
5. **国际化**: 多语言支持

## 关键开发准则

1. **强制中文**: 所有注释、文档、日志使用简体中文
2. **强制测试**: 每次实现必须提供测试
3. **强制验证**: 必须通过本地 AI 验证
4. **模块化设计**: 单一职责，职责分离
5. **性能优先**: 100% 代码分割，懒加载
6. **类型安全**: TypeScript 严格模式
7. **事件驱动**: 模块间解耦通信
8. **响应式设计**: 支持移动端/平板/桌面

## 常见模式与最佳实践

### 组件模式
```typescript
// 异步组件加载
const Component = defineAsyncComponent(() => import('./Component.vue'))

// 事件监听与清理
onMounted(() => {
  eventBus.on('event', handler)
})

onUnmounted(() => {
  eventBus.off('event', handler)
})
```

### 状态管理
```typescript
// 使用 ref 进行响应式状态
const state = ref('initial')

// 计算属性
const computedState = computed(() => {
  return process(state.value)
})
```

### 主题集成
```typescript
// 获取主题
const isDark = computed(() => themeService.theme === 'dark')

// 切换主题
const toggleTheme = () => {
  themeService.toggleTheme()
}
```

### 环境自适应模式
```typescript
// 检查 Tauri 环境
try {
  const { invoke } = await import('@tauri-apps/api/core')
  isTauri.value = true
} catch {
  isTauri.value = false
  // Web 演示模式
}
```

## 结论

梧桐工具箱是一个设计良好、架构清晰的桌面应用项目。它采用了现代化的技术栈，具有良好的可扩展性和可维护性。项目遵循严格的开发准则，注重代码质量和测试覆盖。

当前版本（v0.1.0）包含6个精心挑选的实用工具模块，其中ADB快捷指令是核心特色功能，提供32个常用ADB命令的快速执行。项目已完成从初期的8-9个模块精简到6个核心模块的优化，删除了不再使用的功能，提升了整体质量和用户体验。

---
*更新时间: 2025-11-10*
*项目版本: v0.1.0*
*模块数量: 6个*
