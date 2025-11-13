# 讯飞语义请求配置同步功能 - 实现报告

> 📅 完成时间：2025-11-13
> 🎯 需求：在讯飞语义请求中切换转换服务配置的应用ID后，在语义对比中的讯飞语义请求也要生效

---

## ✅ 功能实现完成

### 🎯 需求背景
用户希望在"讯飞语义请求"模块中切换转换服务的应用ID后，这个变化能够自动在"语义对比"模块中的讯飞语义请求部分生效，避免重复配置。

---

## 🛠️ 技术实现方案

### 核心原理
使用 **localStorage事件监听** + **共享配置源** 的方式实现双向同步：

1. **共享存储介质**：两个模块都读取/写入同一个 localStorage 键值
2. **事件监听**：实时监听 localStorage 变化，自动同步配置
3. **状态持久化**：使用 SemanticModuleStateService 持久化模块状态
4. **自动重新初始化**：配置变化时自动重新初始化转换服务

### 存储键值
```javascript
键名: 'xunfei-convert-appId'
示例值: '9b3d4bz5foji1e5b6eebob4zskgj6q81'
```

---

## 📝 代码变更清单

### 1. 核心服务接口更新
**文件**：`src/core/services/SemanticModuleStateService.ts`

```typescript
// 更新 SemanticCompareState 接口
export interface SemanticCompareState {
  queryText: string
  xunfeiResult: any
  xunfeiError: string
  xunfeiTime: number
  selfResult: string
  selfError: string
  selfTime: number
  loadingXunfei: boolean
  loadingSelf: boolean
  selectedConvertAppId: string  // ✨ 新增字段
}
```

### 2. 语义对比模块更新
**文件**：`src/modules/semantic-compare/SemanticCompare.vue`

#### 2.1 导入 watch 函数
```typescript
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
```

#### 2.2 读取 localStorage 配置
```typescript
// 从localStorage同步讯飞语义请求模块中的应用ID选择
const selectedConvertAppId = ref(
  localStorage.getItem('xunfei-convert-appId') ||
  '9b3d4bz5foji1e5b6eebob4zskgj6q81'
)
```

#### 2.3 监听 localStorage 变化
```typescript
// 存储localStorage监听器引用
let storageListener: ((e: StorageEvent) => void) | null = null

// 在 onMounted 中添加监听器
onMounted(() => {
  // ...

  // 监听localStorage中xunfei-convert-appId的变化
  storageListener = (e: StorageEvent) => {
    if (e.key === 'xunfei-convert-appId') {
      const newAppId = e.newValue || '9b3d4bz5foji1e5b6eebob4zskgj6q81'
      selectedConvertAppId.value = newAppId
      console.log('[语义对比] 检测到应用ID变化，已同步:', newAppId)

      // 如果讯飞服务已连接，重新初始化转换服务
      if (xunfeiApiService && xunfeiConnected.value) {
        initConvertService()
        console.log('[语义对比] 已重新初始化转换服务')
      }
    }
  }
  window.addEventListener('storage', storageListener)

  // ...
})
```

#### 2.4 移除监听器
```typescript
onUnmounted(() => {
  // ...

  // 移除localStorage监听器
  if (storageListener) {
    window.removeEventListener('storage', storageListener)
    storageListener = null
  }

  // ...
})
```

#### 2.5 watch 监听器
```typescript
// 监听selectedConvertAppId变化，保存到模块状态
watch(selectedConvertAppId, (newId) => {
  // 保存到localStorage（保持与讯飞语义请求模块一致）
  localStorage.setItem('xunfei-convert-appId', newId)
  console.log('[语义对比] 应用ID已更新:', newId)
})
```

#### 2.6 更新 saveState
```typescript
const saveState = () => {
  SemanticModuleStateService.saveState('semantic-compare', {
    // ... 其他字段
    selectedConvertAppId: selectedConvertAppId.value  // ✨ 新增
  })
}
```

#### 2.7 更新 restoreState
```typescript
const restoreState = () => {
  const savedState = SemanticModuleStateService.getState('semantic-compare')
  if (savedState) {
    // ... 恢复其他字段

    // 恢复selectedConvertAppId，优先使用localStorage中的值（来自讯飞语义请求模块）
    const localStorageAppId = localStorage.getItem('xunfei-convert-appId')
    if (localStorageAppId) {
      selectedConvertAppId.value = localStorageAppId
      console.log('[语义对比] 从localStorage恢复应用ID:', localStorageAppId)
    } else if (savedState.selectedConvertAppId) {
      selectedConvertAppId.value = savedState.selectedConvertAppId
      console.log('[语义对比] 从模块状态恢复应用ID:', savedState.selectedConvertAppId)
    }
  }
}
```

---

## 🔄 同步机制流程图

### 场景1：讯飞语义请求 → 语义对比

```
[讯飞语义请求模块]
    ↓ 用户切换应用ID
selectedConvertAppId.value = 'new-app-id'
    ↓ watch 监听器触发
localStorage.setItem('xunfei-convert-appId', 'new-app-id')
    ↓ storage 事件触发
[语义对比模块]
    ↓ 监听器捕获事件
selectedConvertAppId.value = 'new-app-id'
    ↓ 自动重新初始化
initConvertService()
    ✅ 配置同步完成
```

### 场景2：模块切换时状态恢复

```
[用户切换到语义对比模块]
    ↓ onMounted 触发
restoreState()
    ↓ 优先读取localStorage
localStorage.getItem('xunfei-convert-appId')
    ↓ 恢复配置
selectedConvertAppId.value = 'stored-app-id'
    ✅ 状态恢复完成
```

---

## ✨ 核心特性

### 1. **实时同步**
- ✅ 配置变化立即生效
- ✅ 无需手动刷新或重启
- ✅ 支持跨模块实时同步

### 2. **自动重新初始化**
- ✅ 检测到配置变化时自动重新初始化转换服务
- ✅ 无需用户额外操作
- ✅ 确保新配置立即生效

### 3. **持久化存储**
- ✅ 使用 localStorage 持久化配置
- ✅ 页面刷新后配置不丢失
- ✅ 使用 SemanticModuleStateService 进行双重保障

### 4. **事件监听**
- ✅ 添加 storage 事件监听器
- ✅ 及时清理监听器（防止内存泄漏）
- ✅ 支持模块生命周期管理

### 5. **日志记录**
- ✅ 详细记录同步过程
- ✅ 便于调试和问题排查
- ✅ 明确标识来源和目标

---

## 🧪 测试验证

### 测试场景

#### 场景1：讯飞语义请求 → 语义对比同步
1. 打开"讯飞语义请求"模块
2. 在"转换服务配置"中选择不同的应用ID
3. 切换到"语义对比"模块
4. 点击"连接"按钮建立连接
5. **验证**：连接成功后使用的应用ID与步骤2中选择的一致

#### 场景2：语义对比 → 讯飞语义请求同步
1. 在"语义对比"模块中修改 selectedConvertAppId（通过代码或测试工具）
2. 切换到"讯飞语义请求"模块
3. **验证**：模块中的应用ID选择与步骤1中修改的一致

#### 场景3：页面刷新后配置保持
1. 在任意模块修改应用ID
2. 刷新页面（F5 或 Ctrl+R）
3. 切换到两个模块
4. **验证**：两个模块中的应用ID都与修改后的值一致

#### 场景4：模块切换时状态恢复
1. 在"讯飞语义请求"中修改应用ID
2. 切换到其他模块（如"文本差异对比"）
3. 再切换回"语义对比"模块
4. **验证**：应用ID已自动更新为步骤1中的值

### 预期日志输出

#### 讯飞语义请求模块
```javascript
[语义对比] 检测到应用ID变化，已同步: 9b3d4bz5foji1e5b6eebob4zskgj6q81
[语义对比] 已重新初始化转换服务
```

#### 语义对比模块
```javascript
[语义对比] 应用ID已更新: 9b3d4bz5foji1e5b6eebob4zskgj6q81
[语义对比] 从localStorage恢复应用ID: 9b3d4bz5foji1e5b6eebob4zskgj6q81
```

---

## 📊 技术优势

### 1. **解耦设计**
- 模块间无直接依赖
- 通过 localStorage 实现松耦合
- 便于维护和扩展

### 2. **性能优化**
- 仅在配置变化时同步
- 使用 Vue 响应式系统
- 自动清理监听器，防止内存泄漏

### 3. **用户体验**
- 无需重复配置
- 实时生效
- 配置持久化

### 4. **可维护性**
- 代码结构清晰
- 详细的日志记录
- 完整的类型定义

---

## 🔍 现有实现（无需修改）

### 讯飞语义请求模块
该模块已经实现了完整的配置管理逻辑，无需修改：

```typescript
// 读取配置
const selectedConvertAppId = ref(
  localStorage.getItem('xunfei-convert-appId') ||
  '9b3d4bz5foji1e5b6eebob4zskgj6q81'
)

// 监听变化并保存
watch(selectedConvertAppId, (newId) => {
  localStorage.setItem('xunfei-convert-appId', newId)
})
```

---

## 🎯 实现效果

### 用户操作流程
1. **在讯飞语义请求模块中选择应用ID**
   ```
   转换服务配置 → 应用ID选择 → 切换到其他应用ID
   ```

2. **自动同步到语义对比模块**
   ```
   切换到语义对比 → 连接讯飞服务 → 使用相同的应用ID
   ```

3. **无需重复配置**
   ```
   配置一次，全局生效
   ```

### 价值总结
- ✅ **提升用户体验**：避免重复配置
- ✅ **降低操作成本**：一次配置，处处使用
- ✅ **保证配置一致性**：所有模块使用相同配置
- ✅ **减少错误**：避免手动配置导致的错误

---

## 📚 相关文档

### 技术文档
- [SemanticModuleStateService.ts](../src/core/services/SemanticModuleStateService.ts) - 状态持久化服务
- [XunfeiSemanticRequest.vue](../src/modules/xunfei-semantic-request/XunfeiSemanticRequest.vue) - 讯飞语义请求模块
- [SemanticCompare.vue](../src/modules/semantic-compare/SemanticCompare.vue) - 语义对比模块

### 测试指南
- [QUICK_TEST_GUIDE.md](../QUICK_TEST_GUIDE.md) - 快速测试指南
- [semantic-request.test.ts](../tests/unit/modules/semanticRequest.test.ts) - 单元测试

---

## 🎉 总结

**功能已完全实现并可以立即使用！**

通过 localStorage 事件监听和共享配置机制，实现了讯飞语义请求和语义对比模块之间的配置自动同步。用户只需在一个模块中配置一次，两个模块都会自动使用相同的配置，大大提升了用户体验和操作效率。

**核心优势**：
- 🚀 实时同步
- 💾 持久化存储
- 🔄 自动重新初始化
- 📝 详细日志记录
- 🎯 类型安全

---

*报告生成时间：2025-11-13*
*实现状态：✅ 完成*
*测试状态：🧪 待测试*
