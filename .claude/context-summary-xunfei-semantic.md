# 项目上下文摘要（讯飞语义请求模块）

生成时间：2025-11-10 22:30:00

## 1. 相似实现分析

### 1.1 SemanticRequest.vue (src/modules/semantic-request/SemanticRequest.vue:1-200)
**模式**：双栏布局 + 历史记录 + API配置
- 左侧：输入区域(2列) + API配置 + 历史记录
- 右侧：响应结果展示(3列)
- 状态管理：loading, error, success, history
- API调用：HTTP POST请求

**可复用组件**：
- 响应式状态管理 (ref, shouldResetDisplay)
- 历史记录存储 (localStorage)
- 错误处理机制 (try-catch + error显示)
- 成功反馈 (success状态 + 提示信息)
- 双栏网格布局 (grid-cols-1 lg:grid-cols-5)

**需注意**：
- onMounted中加载历史记录
- 字符数统计 (queryText.length)
- API配置下拉选择 (appIdOptions)
- 成功时清空error，错误时清空success

### 1.2 JsonTool.vue (src/modules/json-tool/JsonTool.vue:1-159)
**模式**：输入-处理-输出三段式布局
- 上方：工具栏和操作按钮
- 中间：双栏输入输出区域
- 下方：统计信息展示
- 使用 ref 管理响应式数据

**可复用组件**：
- textarea 输入区域 (v-model绑定)
- 操作按钮布局
- 错误处理机制 (try-catch + error显示)
- 成功提示机制 (success状态)
- 统计信息展示 (computed计算)

**需注意**：
- 错误时清空success，成功时清空error
- 使用 navigator.clipboard API 复制结果
- onMounted 中监听事件总线

### 1.3 Calculator.vue (src/modules/calculator/Calculator.vue:1-235)
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

## 2. 项目约定

### 2.1 命名约定
- **模块ID**：短横线分隔（如 `json-tool`, `url-tool`, `xunfei-semantic-request`）
- **文件命名**：
  - 组件文件：大驼峰 (XunfeiSemanticRequest.vue)
  - 工具文件：小写+连字符 (xunfei-auth.service.ts)
- **变量/函数**：小驼峰 (queryText, sendRequest, buildAuthParams)
- **常量**：大写+下划线 (WS_URL, API_CONFIG)

### 2.2 文件组织
```
src/modules/xunfei-semantic-request/
├── index.ts                      # 组件导出（异步加载）
├── XunfeiSemanticRequest.vue     # 主Vue组件
├── services/                     # 服务层（可选）
│   ├── xunfei-auth.service.ts    # 认证服务
│   ├── xunfei-websocket.service.ts # WebSocket服务
│   └── xunfei-api.service.ts     # API服务
└── types/                        # 类型定义
    └── xunfei.types.ts
```

### 2.3 导入顺序
1. Vue 核心：`import { ref, computed, onMounted } from 'vue'`
2. 项目内模块：`import { eventBus } from '../../core/event'`
3. 工具函数：`import { formatDate } from '../../utils'`

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
- `tests/unit/modules/semanticRequest.test.ts`: 语义请求测试
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
- 原生 WebSocket API (浏览器内置)
- Web Crypto API (SHA256计算)

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
  - 发送: `eventBus.emit('module:opened', { id: 'xunfei-semantic-request' })`
  - 接收: `eventBus.on('event:name', callback)`

### 5.4 配置来源
- API密钥：用户输入，localStorage记忆
- 应用ID：下拉选择，硬编码10个选项
- 其他配置：AIUI_PARAMS, USER_PARAMS硬编码

## 6. 技术选型理由

### 6.1 为什么用原生 WebSocket
- **优势**：
  - 浏览器内置支持，无依赖
  - 性能优秀，实时双向通信
  - 与Vue响应式系统完美结合
  - 支持自动重连和心跳保活

- **劣势和风险**：
  - 需要手动管理连接状态
  - 错误处理较为复杂
  - 需要处理断线重连

### 6.2 为什么用 Web Crypto API
- **优势**：
  - 原生支持SHA256，性能极佳
  - 安全可靠，经过验证
  - 异步执行，不阻塞UI
  - 无需引入第三方库

- **劣势和风险**：
  - 需要异步处理
  - 浏览器兼容性（现代浏览器全支持）

## 7. 关键风险点

### 7.1 WebSocket相关风险
- **连接失败**: 网络问题、防火墙拦截
- **断线重连**: 需要指数退避算法
- **心跳保活**: 30秒间隔发送心跳包
- **认证失效**: 时间戳过期、APIKey错误

### 7.2 认证相关风险
- **SHA256计算错误**: 参数编码、拼接顺序
- **时间戳不同步**: 服务器时间差异
- **APIKey泄露**: 提示用户注意安全
- **参数格式错误**: JSON结构、Base64编码

### 7.3 界面交互风险
- **响应式设计**: 需要在移动端测试
- **长文本处理**: WebSocket消息可能很长
- **流式结果展示**: 实时追加消息的性能
- **连接状态指示**: 连接中/已连接/断开状态

### 7.4 兼容性风险
- **Tauri环境**: 在桌面环境中可能有限制
- **浏览器API**: WebSocket和Crypto API在某些环境不可用
- **CORS问题**: WebSocket通常不受CORS限制

## 8. 讯飞语义请求模块设计方案

### 8.1 WebSocket API信息
- **接口**: ws://wsapi.xfyun.cn/v1/aiui
- **认证参数**:
  - appid: 应用ID
  - checksum: SHA256(APIKEY + curtime + paramBase64)
  - curtime: 当前时间戳(秒)
  - param: AIUI_PARAMS的Base64编码
  - signtype: sha256

### 8.2 界面设计
- **输入区域**: 大文本框，支持多行输入
- **连接管理**: 建立/断开连接按钮
- **状态指示**: 连接状态（绿色/黄色/红色）
- **操作按钮**: "发送语义查询"、"清空"、"复制结果"
- **结果区域**: 流式展示WebSocket响应JSON
- **历史记录**: 记录最近的查询和响应

### 8.3 核心功能
1. WebSocket连接建立
2. 认证参数计算（SHA256）
3. 语义查询发送
4. 流式结果接收和展示
5. 连接状态管理
6. 错误处理和重连
7. 历史记录管理

### 8.4 服务层设计
- **XunfeiAuthService**: 认证服务
  - buildAuthParams() - 构建认证参数
  - calculateSHA256() - SHA256计算
  - encodeBase64() - Base64编码

- **XunfeiWebSocketService**: WebSocket服务
  - connect() - 建立连接
  - disconnect() - 断开连接
  - sendQuery() - 发送查询
  - onMessage() - 消息回调
  - onError() - 错误处理
  - onClose() - 关闭回调

- **XunfeiApiService**: API服务
  - sendSemanticQuery() - 高层API
  - manageConnection() - 连接管理
  - saveHistory() - 历史记录
  - loadHistory() - 加载历史

### 8.5 文件结构
```
src/modules/xunfei-semantic-request/
├── index.ts                           # 组件导出
├── XunfeiSemanticRequest.vue          # 主组件
└── services/                          # 服务层
    ├── xunfei-auth.service.ts         # 认证服务
    ├── xunfei-websocket.service.ts    # WebSocket服务
    └── xunfei-api.service.ts          # API服务
```

### 8.6 注册配置
- **ModuleRegistry**:
  - id: 'xunfei-semantic-request'
  - name: '讯飞语义请求'
  - description: '发送文本获取讯飞语义理解结果'
  - category: 'other'
- **App.vue**: moduleComponents 添加映射

## 9. 与自研语义请求的差异

### 9.1 协议差异
- **自研**: HTTP POST，短连接
- **讯飞**: WebSocket，长连接

### 9.2 认证差异
- **自研**: 简单的 appId 参数
- **讯飞**: SHA256签名认证，复杂参数

### 9.3 响应差异
- **自研**: 一次性返回结果
- **讯飞**: 流式推送，可能多条消息

### 9.4 状态管理差异
- **自研**: loading, error, success 三状态
- **讯飞**: + 连接状态 (connecting, connected, disconnected)

## 10. 开发优先级

### 10.1 高优先级
1. 认证服务 (XunfeiAuthService)
2. WebSocket基础连接
3. 消息发送和接收
4. 基础UI界面

### 10.2 中优先级
1. 连接状态管理
2. 错误处理和重连
3. 历史记录功能
4. 结果展示优化

### 10.3 低优先级
1. 心跳保活
2. 性能优化
3. 高级配置选项
4. 导出功能
