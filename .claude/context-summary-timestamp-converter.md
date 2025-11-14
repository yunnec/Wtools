# 时间戳转换模块 - 上下文摘要

> 生成时间：2025-11-15 00:14
> 任务：为梧桐工具箱新增时间戳转换功能模块

---

## 1. 相似实现分析

### 1.1 JSON工具模块 (src/modules/json-tool/)
**模式分析**：
- 双栏布局：输入区 + 输出区
- 操作按钮：格式化、压缩、验证、清空
- 统计信息：字符数、行数、键数量、嵌套深度
- 错误处理：try-catch + 错误提示
- 响应式：支持大屏幕双栏布局

**可复用组件**：
- 错误显示：`v-if="error"` 红色提示框
- 成功提示：`v-if="success"` 绿色提示框
- 统计卡片：4列网格展示数据
- 复制按钮：使用toastService.copySuccess()

### 1.2 Base64工具模块 (src/modules/base64-tool/)
**模式分析**：
- 简洁双栏：输入文本 + 输出结果
- 操作按钮：编码、解码、清空
- 使用说明：底部卡片展示使用指南
- 简化设计：h-96高度（384px）

**可复用组件**：
- 简化的按钮布局
- 使用说明卡片

### 1.3 文本差异模块 (src/modules/text-diff/)
**模式分析**：
- 控制面板：模式切换、粒度切换
- 实时对比：@input + debouncedCompare
- 暗色主题：完整的dark:前缀支持
- 高级功能：并排/行内模式、行级/词级对比

**可复用组件**：
- 模式切换按钮组（带选中状态）
- 禁用状态管理
- 实时更新机制
- 暗色主题支持

---

## 2. 项目约定

### 2.1 命名约定
- **目录名**：kebab-case（如：timestamp-converter）
- **组件名**：PascalCase + 功能名（如：TimestampConverter.vue）
- **变量名**：camelCase
- **常量名**：UPPER_SNAKE_CASE
- **事件名**：kebab-case + 模块前缀（如：timestamp-converter:open）

### 2.2 文件组织
```
src/modules/timestamp-converter/
├── TimestampConverter.vue    # 主组件
├── index.ts                  # 导出文件
└── services/                 # 可选：业务逻辑分离
    └── timestamp.service.ts
```

### 2.3 导入顺序
1. Vue核心：`import { ref, computed, onMounted } from 'vue'`
2. 项目服务：`import { eventBus } from '../../core/event'`
3. 项目服务：`import { toastService } from '../../core/services/ToastService'`
4. 第三方库：`import { format, parseISO } from 'date-fns'`

### 2.4 代码风格
- **注释**：所有注释使用简体中文
- **TypeScript**：严格模式，完整的类型定义
- **响应式**：优先使用ref，computed处理派生数据
- **事件处理**：使用箭头函数或方法引用
- **错误处理**：try-catch + toastService.error()

---

## 3. 可复用组件清单

### 3.1 核心服务
- **eventBus**：模块打开事件监听
  ```typescript
  eventBus.on('timestamp-converter:open', () => {
    console.log('时间戳转换工具已打开')
  })
  ```

- **toastService**：用户反馈
  ```typescript
  toastService.success('转换成功', '时间戳已转换为日期')
  toastService.error('转换失败', error.message)
  toastService.copySuccess('转换结果')
  ```

### 3.2 UI组件模式

#### 按钮组（带选中状态）
```vue
<div class="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
  <button @click="mode = 'timestamp-to-date'"
    :class="{ 'bg-white dark:bg-gray-600': mode === 'timestamp-to-date' }"
    class="px-4 py-2 rounded-md">
    时间戳→日期
  </button>
</div>
```

#### 输入输出双栏布局
```vue
<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <!-- 输入区 -->
  <div class="card">
    <h3 class="text-lg font-semibold mb-4">{{ inputTitle }}</h3>
    <textarea v-model="inputValue" class="...高度..."></textarea>
  </div>

  <!-- 输出区 -->
  <div class="card">
    <h3 class="text-lg font-semibold mb-4">{{ outputTitle }}</h3>
    <textarea :value="outputValue" readonly class="...高度... bg-gray-50"></textarea>
    <button @click="copyOutput" class="btn-primary mt-2">复制</button>
  </div>
</div>
```

#### 统计信息卡片
```vue
<div class="mt-6 card">
  <h3 class="text-lg font-semibold mb-4">统计信息</h3>
  <div class="grid grid-cols-4 gap-4">
    <div class="text-center">
      <div class="text-2xl font-bold text-blue-600">{{ stats.value1 }}</div>
      <div class="text-sm text-gray-600">标签1</div>
    </div>
    <!-- 更多统计项 -->
  </div>
</div>
```

---

## 4. 测试策略

### 4.1 测试框架
- **框架**：Vitest
- **组件测试**：@vue/test-utils + mount
- **测试文件**：`tests/unit/modules/timestampConverter.test.ts`

### 4.2 测试用例设计
1. **功能测试**
   - 时间戳转日期（秒级）
   - 时间戳转日期（毫秒级）
   - 日期转时间戳
   - 实时转换

2. **边界测试**
   - 无效输入
   - 超大时间戳
   - 空输入
   - 特殊日期（1970-01-01）

3. **UI测试**
   - 按钮点击
   - 输入响应
   - 复制功能
   - 暗色主题

### 4.3 测试示例
```typescript
describe('时间戳转换工具', () => {
  it('应该正确转换时间戳到日期', () => {
    const timestamp = 1609459200000 // 2021-01-01
    const result = convertTimestampToDate(timestamp)
    expect(result).toBe('2021-01-01 00:00:00')
  })

  it('应该处理无效输入', () => {
    const result = convertTimestampToDate('invalid')
    expect(result).toBe('')
  })
})
```

---

## 5. 依赖和集成点

### 5.1 外部依赖
- **无需新增依赖**：使用原生JavaScript Date API
- **可选增强**：date-fns库提供更丰富的日期格式化（但会增加bundle大小）

### 5.2 内部依赖
- **事件总线**：监听模块打开事件
- **Toast服务**：成功/错误提示，复制反馈
- **模块注册表**：注册新模块

### 5.3 集成方式
1. **模块注册**：在ModuleRegistry.ts中添加配置
2. **组件导入**：App.vue中添加异步组件引用
3. **事件监听**：onMounted中注册eventBus事件

---

## 6. 技术选型理由

### 6.1 为什么用原生Date API
**优势**：
- 无需额外依赖
- 浏览器原生支持
- 性能好
- TypeScript内置类型

**劣势**：
- 格式化能力有限
- 需要手动处理时区

**决策**：使用原生API + 自定义格式化函数

### 6.2 为什么支持多种时间戳格式
**原因**：
- 实际开发中会遇到不同精度的时间戳
- 秒级：10位（1609459200）
- 毫秒级：13位（1609459200000）
- 微秒级：16位
- 纳秒级：19位

**实现**：
- 自动检测时间戳长度
- 智能转换精度

### 6.3 为什么需要时区转换
**原因**：
- 跨时区开发需求
- 服务器UTC时间展示
- 本地化显示需求

**实现**：
- 支持多种时区（UTC、本地）
- 实时切换显示

---

## 7. 关键风险点

### 7.1 并发问题
- **风险**：快速输入时频繁转换
- **解决方案**：使用debounce防抖（300ms）

### 7.2 边界条件
- **风险**：无效输入导致错误
- **解决方案**：try-catch + 输入验证 + 友好提示

### 7.3 性能瓶颈
- **风险**：大时间戳数组转换
- **解决方案**：
  - 限制单次转换数量（1000个）
  - 使用Web Worker（可选）

### 7.4 时区问题
- **风险**：时间戳转日期不准确
- **解决方案**：
  - 明确说明时区
  - 提供时区选择
  - 标记UTC和本地时间

---

## 8. 预期功能清单

### 8.1 核心功能（Must Have）
- [x] 时间戳转日期（秒级/毫秒级）
- [x] 日期转时间戳
- [x] 实时转换
- [x] 复制结果

### 8.2 增强功能（Should Have）
- [ ] 多种日期格式输出
- [ ] 时区转换
- [ ] 批量转换
- [ ] 历史记录

### 8.3 高级功能（Could Have）
- [ ] 相对时间显示（2小时前）
- [ ] 格式化字符串自定义
- [ ] 导入/导出CSV
- [ ] 周数计算

### 8.4 特色功能（Wow Feature）
- [ ] 可视化时间轴
- [ ] 时间差计算
- [ ] 倒计时器
- [ ] 闰年计算

---

## 9. 成功标准

### 9.1 功能标准
- ✅ 所有核心功能正常工作
- ✅ 实时转换无延迟
- ✅ 错误输入有友好提示
- ✅ 复制功能稳定可靠

### 9.2 质量标准
- ✅ TypeScript类型检查通过
- ✅ ESLint无警告
- ✅ 单元测试覆盖率>80%
- ✅ 暗色主题完美支持

### 9.3 用户体验标准
- ✅ 界面美观、布局合理
- ✅ 操作流畅、响应及时
- ✅ 提示清晰、错误友好
- ✅ 移动端适配良好

---

**上下文摘要生成完成** ✅
