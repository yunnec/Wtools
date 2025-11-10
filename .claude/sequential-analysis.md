# 讯飞语义请求模块深度分析

## 当前时间
2025-11-10 18:03:00

## 分析目标
深度分析讯飞语义请求模块的开发需求、关键风险和技术方案

## 核心问题梳理

### 1. 技术架构差异分析
**自研语义请求 vs 讯飞语义请求**

自研实现：
- 协议：HTTP POST
- 连接方式：短连接，每次请求建立新连接
- 认证：基于应用ID（wtAppId）
- 数据格式：JSON body
- 响应模式：一次性返回结果

讯飞需求：
- 协议：WebSocket长连接
- 连接方式：建立持久连接，双向通信
- 认证：SHA256签名校验（APIKEY + curtime + param）
- 数据格式：JSON + 特殊结束标记("--end--")
- 响应模式：流式推送，需要过滤action="result"且data.sub="tpp"

**关键发现**：
这需要完全不同的技术架构 - 从HTTP短连接模式切换到WebSocket长连接模式

### 2. WebSocket实现关键技术点

**浏览器原生支持**：
- 所有现代浏览器（Chrome 16+, Firefox 11+, Safari 7+, Edge 12+）都原生支持WebSocket API
- Vue 3项目可以直接使用window.WebSocket API
- 无需额外依赖库

**核心实现要素**：
```javascript
const ws = new WebSocket('ws://wsapi.xfyun.cn/v1/aiui')
ws.onopen = () => { /* 连接成功 */ }
ws.onmessage = (event) => { /* 接收消息 */ }
ws.onerror = (error) => { /* 错误处理 */ }
ws.onclose = () => { /* 连接关闭 */ }
ws.send(data) // 发送数据
ws.close() // 关闭连接
```

**生命周期管理**：
- 组件挂载时建立连接
- 组件卸载时关闭连接
- 异常断开时自动重连机制
- 连接状态监控

### 3. SHA256加密实现

**JavaScript原生支持**：
- Web Crypto API (SubtleCrypto) 原生支持SHA-256
- 现代浏览器全面支持
- API示例：
```javascript
const encoder = new TextEncoder()
const data = encoder.encode(APIKEY + curtime + paramBase64)
const hashBuffer = await crypto.subtle.digest('SHA-256', data)
const hashArray = Array.from(new Uint8Array(hashBuffer))
const checksum = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
```

**认证公式**：
- checksum = SHA256(APIKEY + curtime + paramBase64)
- curtime: 当前时间戳（秒级）
- param: Base64编码的AIUI_PARAMS + USER_PARAMS

### 4. 配置管理策略分析

**硬编码 vs 配置化**：

硬编码方案（推荐）：
- 优势：简单、快速、无需外部配置
- 适用于：开发测试、内部工具
- 项目中已有10个应用ID硬编码在Vue组件中

配置化方案：
- 优势：灵活、易于部署、可配置
- 适用于：多环境部署、动态配置
- 需要：配置文件或环境变量

**讯飞API必需配置**：
- appid: 应用ID（已有类似appIdOptions）
- apikey: API密钥（需安全存储）
- wsUrl: ws://wsapi.xfyun.cn/v1/aiui
- AIUI_PARAMS: 认证和数据类型配置
- USER_PARAMS: 用户参数配置

**最佳实践**：
结合现有模式 - 硬编码应用ID列表 + 本地存储（localStorage）记忆用户选择

### 5. 界面设计差异化分析

**现有自研语义请求界面特点**：
- 双栏布局：左侧输入+配置+历史，右侧结果展示
- 应用ID下拉选择（10个预置选项）
- 实时历史记录（最多10条，支持点击回放）
- 响应时间显示
- 一键清空和复制功能
- 加载状态和错误提示

**讯飞语义请求界面差异**：
- 需要连接状态指示（已连接/断开/重连中）
- 需要实时流式结果显示
- 发送数据格式需要说明
- 接收数据需要过滤和解析
- 连接超时和重连机制需要UI提示

**保持一致的设计语言**：
- 沿用双栏布局
- 沿用蓝色主题和按钮样式
- 沿用卡片式组件
- 沿用历史记录功能
- 扩展配置区域（添加连接状态、API密钥等）

### 6. 关键风险点识别

**技术风险**：
1. **WebSocket连接稳定性**
   - 网络波动导致连接断开
   - 需要自动重连机制
   - 重连次数限制避免无限重连

2. **浏览器兼容性**
   - 旧版浏览器可能不支持WebSocket
   - 需要降级处理或提示升级浏览器

3. **认证失败**
   - APIKEY泄露风险
   - 时间戳不同步导致认证失败
   - paramBase64编码错误

4. **数据解析错误**
   - 接收数据格式变化
   - 编码问题（中文字符）
   - 结束标记"--end--"处理

**业务风险**：
1. **讯飞API限制**
   - 并发连接数限制
   - QPS限制
   - 费用控制

2. **用户体验**
   - 连接建立时间较长
   - 实时结果显示的流畅性
   - 错误提示的友好性

**安全风险**：
1. **密钥泄露**
   - APIKEY硬编码在代码中
   - 浏览器开发者工具可查看
   - 建议：生产环境使用环境变量

2. **中间人攻击**
   - WebSocket明文传输
   - 建议：生产环境使用wss://

### 7. 最佳实践参考

**从现有模块学到的**：
1. **配置管理**：使用下拉选择 + localStorage记忆
2. **历史记录**：限制条数、时间戳、点击回放
3. **状态管理**：loading/error/success状态清晰
4. **用户体验**：响应时间显示、复制功能、清空操作
5. **事件通信**：使用eventBus解耦模块
6. **代码组织**：index.ts导出 + .vue组件分离

**讯飞模块独特要求**：
1. **WebSocket封装**：独立的WebSocket管理类
2. **认证服务**：独立的认证和参数计算服务
3. **流式处理**：实时数据流解析和过滤
4. **连接管理**：连接状态、生命周期管理

### 8. 技术选型建议

**必须实现**：
- WebSocket API（原生）
- Web Crypto API SHA-256
- Base64编码（btoa/atob）
- EventBus事件通信

**可选增强**：
- 心跳机制保持连接活跃
- 消息队列处理并发请求
- 断线重连指数退避算法
- 连接池管理

**避免**：
- 引入WebSocket第三方库（增加依赖，无必要）
- 使用不安全的MD5/SHA1（已使用SHA256）
- 硬编码敏感信息（在配置中提示）

## 下一步行动

1. ✅ 完成WebSocket技术方案设计
2. ✅ 完成SHA256加密方案设计
3. ✅ 完成配置管理策略
4. ✅ 完成界面差异化设计
5. ✅ 识别风险点和应对策略
6. ⏳ 开始技术实现
