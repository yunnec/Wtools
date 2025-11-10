# 梧桐工具箱 - 项目知识总结

## 项目概览

**梧桐工具箱** (Wutong Toolbox) 是一个基于 Tauri 框架开发的桌面工具箱应用，提供了多种实用工具的集合。项目采用微内核+插件架构，具有良好的扩展性和可维护性。

### 关键信息
- **项目名称**: 梧桐工具箱 (wutong-toolbox)
- **版本**: 0.1.0 (v1.0.0 已发布)
- **技术栈**: Tauri 2.0 + Vue 3 + TypeScript + Vite + Tailwind CSS
- **开发语言**: Rust (后端) + TypeScript/JavaScript (前端)
- **许可证**: MIT License

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
- 分类管理 (file/text/calc/convert/image/other)
- 动态组件加载
- 搜索功能支持

### 5. 插件系统 (已废弃)
**目录**: `src/core/plugin.bak/`
- 完整的插件 API 设计
- 生命周期管理
- 测试框架
- 目前已被删除，功能并入主系统

## 功能模块清单

### 8 个核心工具模块

1. **计算器** (`/calculator`)
   - 基础数学运算 (+, -, *, /)
   - 高级数学函数 (sin, cos, tan, sqrt, log)
   - 常数支持 (π, e)
   - 历史记录显示

2. **颜色选择器** (`/color-picker`)
   - 颜色选择功能
   - 调色板生成
   - 格式转换

3. **JSON 工具** (`/json-tool`)
   - JSON 格式化
   - JSON 验证
   - JSON 压缩

4. **Base64 工具** (`/base64-tool`)
   - Base64 编码
   - Base64 解码

5. **URL 工具** (`/url-tool`)
   - URL 编码/解码
   - 参数解析

6. **二维码生成器** (`/qrcode`)
   - 二维码生成
   - 二维码解析

7. **讯飞语义请求** (`/xunfei-semantic-request`)
   - 讯飞语义理解 API 集成
   - 文本分析

8. **自研语义请求** (`/semantic-request`)
   - 语义请求功能
   - 定制化处理

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
│   │   ├── calculator/           # 计算器
│   │   ├── color-picker/         # 颜色选择器
│   │   ├── json-tool/            # JSON 工具
│   │   ├── base64-tool/          # Base64 工具
│   │   ├── url-tool/             # URL 工具
│   │   ├── qrcode/               # 二维码生成器
│   │   ├── semantic-request/     # 语义请求
│   │   ├── xunfei-semantic-request/  # 讯飞语义请求
│   │   └── example-plugin.bak/   # 示例插件 (已废弃)
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
│   ├── context-summary-*.md      # 上下文摘要
│   ├── operations-log.md         # 操作日志
│   └── verification-report.md    # 验证报告
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

## 性能指标

根据版本历史 (v1.0.0)：
- **构建时间**: 1.95 秒
- **总大小**: ~134 kB (gzip: ~37 kB)
- **代码分割**: 100% (所有模块独立打包)
- **首屏加载**: < 800ms
- **模块切换**: < 200ms
- **性能等级**: A 级

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

### 潜在发展方向
1. **更多工具模块**: 可扩展的工具集
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

## 结论

梧桐工具箱是一个设计良好、架构清晰的桌面应用项目。它采用了现代化的技术栈，具有良好的可扩展性和可维护性。项目遵循严格的开发准则，注重代码质量和测试覆盖。虽然插件系统已被废弃，但整体架构仍然支持未来的扩展需求。

---
*生成时间: 2025-11-10 22:30*
*项目版本: v1.0.0*
