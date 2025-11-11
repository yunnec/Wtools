# WebSocket用Rust实现的可行性分析

## 项目现状
- **项目类型**: Tauri 2.0 混合应用
- **前端**: Vue 3 + TypeScript
- **后端**: Rust (目前只有简单命令)
- **WebSocket**: 纯JavaScript实现

## WebSocket用Rust实现方案

### 架构设计
```
┌─────────────────┐       ┌─────────────────┐
│   前端 (Vue)    │◄─────►│  Tauri Commands │
│  TypeScript     │       │   (事件通道)     │
└─────────────────┘       └─────────────────┘
                                ▼
                            ┌─────────────┐
                            │ WebSocket   │
                            │   (Rust)    │
                            │  tokio-tungstenite │
                            └─────────────┘
```

### Rust实现核心代码
```rust
// 1. 添加依赖 (Cargo.toml)
[dependencies]
tokio = { version = "1", features = ["full"] }
tokio-tungstenite = "0.20"
futures-util = "0.3"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
tauri = { version = "2", features = ["macros"] }

// 2. WebSocket服务 (lib.rs)
use tauri::{Manager, State};
use tokio::sync::mpsc;
use futures_util::stream::StreamExt;
use tokio_tungstenite::{connect_async, tungstenite::Message};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct WsMessage {
    query: String,
    // 其他字段...
}

#[derive(Debug, Serialize, Deserialize)]
struct WsResponse {
    data: String,
    // 其他字段...
}

#[tauri::command]
async fn xunfei_websocket_connect(
    app: tauri::AppHandle,
    config: String,
) -> Result<String, String> {
    // 解析配置
    let ws_url = "ws://wsapi.xfyun.cn/v1/aiui";
    // 连接WebSocket
    let (ws_stream, _) = connect_async(ws_url).await
        .map_err(|e| e.to_string())?;

    let (write, read) = ws_stream.split();

    // 发送查询
    // 接收响应
    // 返回结果
    Ok("connected".to_string())
}
```

### 事件通道通信
```rust
// Rust端发送事件
let event_payload = serde_json::to_string(&response).unwrap();
app.emit_all("xunfei:message", event_payload).unwrap();

// TypeScript端监听事件
import { listen } from '@tauri-apps/api/event';
const unlisten = await listen('xunfei:message', (event) => {
  console.log('收到WebSocket消息:', event.payload);
});
```

## 方案对比

### 方案A: 纯JavaScript (当前)
**优势**:
- ✅ 开发简单快速
- ✅ 调试方便
- ✅ 实时双向通信自然
- ✅ 无需跨语言通信

**劣势**:
- ⚠️ 性能略低
- ⚠️ 内存管理依赖GC

**适用场景**: WebSocket逻辑不复杂，UI实时更新

### 方案B: Rust实现
**优势**:
- ✅ 性能更高
- ✅ 内存安全
- ✅ 类型安全
- ✅ 并发处理优

**劣势**:
- ❌ 开发复杂
- ❌ 需要事件通道
- ❌ 调试困难
- ❌ 过度工程化

**适用场景**: 高并发、大数据量WebSocket场景

### 方案C: 混合模式 ⭐推荐
**WebSocket核心逻辑**: Rust
- 连接管理
- 消息收发
- 重连机制

**UI处理**: JavaScript
- 实时显示
- 用户交互
- 状态管理

**实现**:
```rust
// Rust: WebSocket客户端 + Tauri命令
#[tauri::command]
async fn send_xunfei_query(
    query: String,
) -> Result<serde_json::Value, String> {
    // 1. 检查连接状态
    // 2. 发送查询
    // 3. 接收响应
    // 4. 返回结果
    // 5. 保持连接或断开
}
```

```typescript
// JavaScript: 前端调用
import { invoke } from '@tauri-apps/api/core';

async function sendQuery(query: string) {
  try {
    const result = await invoke('send_xunfei_query', { query });
    displayResult(result);
    // 检查是否需要重连
  } catch (error) {
    console.error('查询失败:', error);
  }
}
```

## 实际建议

### 当前问题
讯飞语义请求WebSocket断线问题

### 推荐解决方案
1. **简单方案**: 保持JavaScript实现，修复重连逻辑
   - 成本: 2小时
   - 风险: 低
   - 效果: 90%

2. **Rust方案**: 迁移到Rust实现
   - 成本: 1-2天
   - 风险: 中
   - 效果: 95%

3. **混合方案**: Rust核心 + JS UI
   - 成本: 1天
   - 风险: 中高
   - 效果: 95%

## 结论

### 对当前问题（WebSocket重连）
**建议保持JavaScript实现**
- 原因1: WebSocket逻辑不复杂，JS足够
- 原因2: 前端需要实时显示，用事件通道会增加复杂度
- 原因3: 修复当前重连逻辑成本更低

### 对长期发展
**可以迁移到Rust**
- 适合场景: 大量并发WebSocket连接
- 前提: 需要时再迁移（YAGNI原则）
- 方式: 事件通道 + 异步处理

### 最终建议
1. **现在**: 快速修复JS版本的重连问题（方案A）
2. **未来**: 观察使用情况，如果遇到性能瓶颈再考虑Rust
3. **代码**: 保持WebSocket逻辑模块化，便于未来迁移
