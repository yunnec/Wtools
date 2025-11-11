# 应用版本管理机制

## 概述

梧桐工具箱实现了完整的版本管理机制，确保应用升级时用户数据不会丢失。

## 🔧 核心机制

### 1. 版本号管理

**应用版本号**：`src/core/config/ConfigService.ts:5`
```typescript
const APP_VERSION = '1.0.0'
```

**存储位置**：localStorage 的 `wutong-config` 键中的 `appVersion` 字段

### 2. 数据迁移流程

```
应用启动
    ↓
ConfigService 构造函数
    ↓
loadFromStorage() 加载配置
    ↓
checkAndMigrateVersion() 检查版本
    ├─ 版本匹配 → 无需操作
    └─ 版本不匹配 → 执行迁移，保留所有用户数据
    ↓
更新版本号并保存
```

### 3. 保留的数据

✅ **完全保留的用户数据**：
- 自定义命令列表 (`customCommands`)
- 分类排序顺序 (`adbCategoryOrder`)
- 主题设置 (`theme`)
- 语言设置 (`language`)
- 模块开关 (`modules`)

## 🚀 版本升级步骤

### 方法1：更新常量（推荐）

1. 打开 `src/core/config/ConfigService.ts`
2. 修改版本号：
   ```typescript
   const APP_VERSION = '1.1.0'  // 从 '1.0.0' 升级到 '1.1.0'
   ```
3. 如果需要数据转换，在 `checkAndMigrateVersion()` 中添加逻辑
4. 重新构建应用

### 方法2：编程式升级（用于特殊场景）

```typescript
import { configService } from '@/core/config'

// 在代码中调用
configService.updateAppVersion('1.1.0')
```

## 📊 迁移逻辑模板

如果需要在升级时转换数据，可以这样扩展：

```typescript
private checkAndMigrateVersion(): void {
  const currentVersion = this.config.appVersion

  if (currentVersion !== APP_VERSION) {
    console.log(`检测到版本变化 (${currentVersion} -> ${APP_VERSION})`)

    // v1.0.0 -> v1.1.0 的迁移逻辑
    if (currentVersion === '1.0.0' && APP_VERSION === '1.1.0') {
      // 示例：转换自定义命令格式
      this.config.customCommands = this.config.customCommands.map(cmd => ({
        ...cmd,
        newField: 'defaultValue'  // 添加新字段
      }))
    }

    // v1.1.0 -> v1.2.0 的迁移逻辑
    if (currentVersion === '1.1.0' && APP_VERSION === '1.2.0') {
      // 其他迁移逻辑...
    }

    this.config.appVersion = APP_VERSION
    this.saveToStorage()
  }
}
```

## 🧪 测试版本迁移

### 创建测试脚本

1. 在浏览器控制台中执行：
   ```typescript
   // 查看当前版本
   localStorage.getItem('wutong-config')
   // 手动修改版本
   configService.updateAppVersion('0.9.0')
   // 刷新页面，观察迁移日志
   location.reload()
   ```

2. 验证迁移结果：
   - 检查控制台日志
   - 确认数据未丢失
   - 确认版本号已更新

## 📝 日志说明

应用启动时会输出以下日志：

```
[ConfigService] 已加载配置, 版本: 1.0.0
[ConfigService] 当前配置版本: 1.0.0, 应用版本: 1.1.0
[ConfigService] 检测到版本变化 (1.0.0 -> 1.1.0)，执行数据迁移...
[ConfigService] 版本迁移完成，所有用户数据已保留
```

## ✨ 最佳实践

1. **版本号格式**：使用语义化版本号（SemVer）：`主版本.次版本.修订号`
2. **迁移逻辑**：保持向后兼容，保留所有用户数据
3. **日志记录**：添加详细的迁移日志，便于排查问题
4. **测试验证**：每次版本升级后都要测试数据迁移
5. **文档更新**：更新此文档以反映新版本的变化

## ⚠️ 注意事项

- 首次启动应用时，版本号为空，会使用默认值
- 合并配置时使用展开运算符，保留用户数据
- 不要在迁移过程中删除或修改用户数据
- 确保迁移逻辑的幂等性（同一次升级重复执行不会出错）

---

**创建时间**：2025-11-11
**当前版本**：1.0.0
**维护者**：Claude Code
