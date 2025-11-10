# 项目上下文摘要（自研语义请求模块）

生成时间：2025-11-10 22:30:00

## 1. 相似实现分析

### 1.1 JsonTool.vue (src/modules/json-tool/JsonTool.vue:1-159)
**模式**：输入-处理-输出三段式布局
- 上方：工具栏和操作按钮
- 中间：双栏输入输出区域
- 下方：统计信息展示
- 使用 ref 管理响应式数据
- 事件处理函数式编程

**可复用组件**：
- textarea 输入区域 (v-model绑定)
- 操作按钮布局
- 错误处理机制 (try-catch + error显示)
- 成功提示机制 (success状态)
- 统计信息展示 (computed计算)

**需注意**：
- 错误时清空success，成功时清空error
- 使用 naneclipboard API 复制结果
- onMounted 中监听事件总线

### 1.2 Calculator.vue (src/modules/calculator/Calculator.vue:1-235)
**模式**：操作界面驱动型
- 显示屏 + 按钮网格布局
- 状态管理：display, history, operator, previous
- 事件驱动：append, calculate, clear等操作

**可复用组件**：
- 响应式状态管理 (ref, shouldResetDisplay)
- 事件广播 (eventBus.emit)
- 历史记录展示
- 计算逻辑封装

**需注意**：
- 需要清理 previous 和 operator 状态
- 除零检查
- 事件广播用于模块间通信

### 1.3 TextEditor.vue (src/modules/text-editor/TextEditor.vue:1-178)
**模式**：功能面板弹窗式
- 工具栏 + 主编辑区
- 搜索/替换框可显示/隐藏
- computed 计算属性 (hasContent)

**可复用组件**：
- 条件渲染面板 (v-if)
- 按钮组布局
- 确认对话框 (confirm)
- 状态切换逻辑

**需注意**：
- 区分 showSearch 和 showReplace 状态
- 使用 confirm 进行危险操作确认
- onMounted 中监听外部事件

## 2. 项目约定

### 2.1 命名约定
- **模块ID**：短横线分隔（如 `json-tool`, `url-tool`）
- **文件命名**：
  - 组件文件：大驼峰 (JsonTool.vue, Calculator.vue)
  - 工具文件：小写+连字符 (test-utils.ts)
- **变量/函数**：小驼峰 (inputJson, formatJson)
- **常量**：大写+下划线 (VITE_APP_TITLE)

### 2.2 文件组织
```
src/modules/
├── module-name/
│   ├── index.ts          # 组件导出（异步加载）
│   ├── ModuleName.vue    # Vue组件
│   └── README.md         # 可选说明
```

### 2.3 导入顺序
1. Vue 核心：import { ref, computed, onMounted } from 'vue'
2. 项目内模块：import { eventBus } from '../../core/event'
3. 工具函数：import { formatDate } from '../../utils'

### 2.4 代码风格
- 模板：使用 Tailwind CSS 类
- 脚本：使用 `<script setup>` + Composition API
- 注释：所有注释使用中文
- 缩进：2个空格
- 字符串：优先使用单引号

## 3. 可复用组件清单

### 3.1 核心服务
- `src/core/event/index.ts`: 事件总线 (eventBus.emit/on/off/once)
- `src/modules/ModuleRegistry.ts`: 模块注册表
- `src/core/config/`: 配置管理服务
- `src/core/theme/`: 主题服务

### 3.2 通用模式
- 异步组件加载：`defineAsyncComponent(() => import('./Component.vue'))`
- 错误处理：try-catch + 错误状态显示
- 成功反馈：success 状态 + 提示信息
- 复制功能：navigator.clipboard.writeText()
- 响应式数据：ref + computed

## 4. 测试策略

### 4.1 测试框架
- **主框架**: Vitest (^4.0.8)
- **Vue测试**: @vue/test-utils (^2.4.6)
- **断言库**: expect (Vitest内置)
- **覆盖率**: @vitest/coverage-v8

### 4.2 测试模式
- **单元测试**: 测试纯逻辑函数
- **组件测试**: 使用 mount() 测试 Vue 组件
- **E2E测试**: Playwright (^1.56.1)

### 4.3 参考文件
- `tests/unit/modules/jsonTool.test.ts`: 最完整的测试示例
- 测试模式：
  1. 提取逻辑为独立函数
  2. describe 分组 (功能/边界/性能)
  3. it 测试用例 (使用中文描述)
  4. expect 断言

### 4.4 覆盖要求
- ✅ 正常流程测试
- ✅ 边界条件测试
- ✅ 错误处理测试
- ✅ 性能测试（大数据量）

## 5. 依赖和集成点

### 5.1 外部依赖
- Vue 3.5.24 (响应式框架)
- @tauri-apps/api (Tauri API)

### 5.2 内部依赖
- `src/core/event/index.ts`: 事件总线
- `src/modules/ModuleRegistry.ts`: 模块管理
- `src/App.vue`: 主应用组件

### 5.3 集成方式
- **模块注册**：
  1. ModuleRegistry.ts 添加模块配置
  2. App.vue 的 moduleComponents 添加映射
  3. 目录创建 index.ts 导出组件

- **事件通信**：
  - 发送: `eventBus.emit('module:opened', { id: 'xxx' })`
  - 接收: `eventBus.on('event:name', callback)`

### 5.4 配置来源
- 无需额外配置
- 固定API参数写在代码中

## 6. 技术选型理由

### 6.1 为什么用 Vue 3 + Composition API
- **优势**：
  - 组合式API使逻辑复用更容易
  - 响应式系统性能优秀
  - defineAsyncComponent 支持代码分割
  - TypeScript 支持完善

- **劣势和风险**：
  - 需要学习组合式API
  - 与选项式API混用可能混乱

### 6.2 为什么用 Tailwind CSS
- **优势**：
  - 快速开发，无需切换上下文
  - 一致的设计系统
  - 响应式设计简单
  - 体积小 (按需生成)

- **劣势和风险**：
  - 类名可能过长
  - 需要学习 Tailwind 约定

## 7. 关键风险点

### 7.1 API相关风险
- **网络异常**: 需要处理请求失败、超时
- **CORS问题**: API可能存在跨域限制
- **认证问题**: 需要检查是否需要认证
- **参数验证**: 确保query参数安全

### 7.2 界面交互风险
- **响应式设计**: 需要在移动端测试
- **长文本处理**: query可能很长，需要处理溢出
- **结果展示**: API返回格式未知，需要处理多种情况

### 7.3 性能风险
- **API延迟**: 可能需要加载提示
- **频繁请求**: 建议添加防抖
- **大结果集**: 需要分页或虚拟滚动

### 7.4 兼容性风险
- **Tauri环境**: 在桌面环境中可能有限制
- **浏览器API**: clipboard API 在某些环境不可用

## 8. 语义请求模块设计方案

### 8.1 API信息
- **接口**: POST /voiceserver/api/v1/tinnove-ai/query
- **固定参数**:
  - wtAppId: "9b3d4bz5foji1e5b6eebob4zskgj6q81"
  - userId: "test11111123"
  - tinnoveAiUrl: "http://nlu-pf.auto-pai.cn/zp/update"
  - version: "cache"
- **可变参数**:
  - query: 用户输入的查询文本

### 8.2 界面设计
- **输入区域**: 大文本框，支持多行输入
- **操作按钮**: "发送请求"、"清空"、"复制结果"
- **结果区域**: 展示API返回的JSON或文本
- **状态指示**: 加载中、成功、错误
- **历史记录**: 可选，记录最近的查询

### 8.3 核心功能
1. 文本输入验证
2. HTTP POST请求
3. 响应结果展示
4. 错误处理和提示
5. 结果复制到剪贴板
6. 请求历史管理（可选）

### 8.4 文件结构
```
src/modules/semantic-request/
├── index.ts                      # 组件导出
└── SemanticRequest.vue           # 主组件
```

### 8.5 注册配置
- **ModuleRegistry**: id: 'semantic-request', category: 'other'
- **App.vue**: moduleComponents 添加映射
