## 项目上下文摘要（236日志解压功能）
生成时间：2025-11-11 19:10:00

### 1. 源功能分析（车机日志自动解密解压工具）
- **功能来源**: D:\workdoc\工具\236解压工具\
- **核心流程**:
  - 查找DecryptLogForWinX64.exe解密工具
  - 解密加密日志文件（.dat等）→ 生成tar.gz临时文件
  - 解压tar.gz文件 → 提取日志内容到指定目录
  - 清理临时文件，自动打开结果目录
- **依赖文件**: 
  - DecryptLogForWinX64.exe（解密工具，必需）
  - 360zip.exe（可选，备用解压工具）
- **语言实现**: Python + Shell脚本
- **输出位置**: {文件名}_logs/ 目录

### 2. 相似实现分析
- **ADB快捷指令模块**: /c/code/Wtools/src/modules/shortcut-commands/
  - 模式：前端Vue + Rust后端命令执行
  - 可复用：isTauri检测、invoke调用模式、executeCommand函数
  - 需注意：错误处理、异步执行、结果展示
  
- **事件总线**: /c/code/Wtools/src/core/event/EventBus.ts
  - 模式：模块间解耦通信
  - 可复用：事件通知机制、模块间通信

### 3. 项目约定
- **命名约定**: 
  - 模块目录：kebab-case（如shortcut-commands）
  - 组件文件：PascalCase（如SemanticCompare.vue）
  - 服务文件：camelCase（如customCommandService.ts）
- **文件组织**: 
  - src/modules/{模块名}/
  - src/modules/{模块名}/{模块名}.vue
  - src/modules/{模块名}/index.ts
  - src/modules/{模块名}/services/（服务类）
- **导入顺序**: 
  - Vue/第三方库 → 项目工具类 → 核心系统 → 本模块
- **代码风格**: 
  - 强制中文注释
  - TypeScript严格模式
  - UTF-8无BOM编码

### 4. 可复用组件清单
- **事件总线**: src/core/event/EventBus.ts - 模块间通信
- **模块注册表**: src/modules/ModuleRegistry.ts - 模块配置管理
- **主题服务**: src/core/theme/ThemeService.ts - 主题切换
- **配置管理**: src/core/config/ConfigService.ts - 配置持久化
- **Rust命令执行**: src-tauri/src/lib.rs - execute_command函数

### 5. 测试策略
- **测试框架**: Vitest（单元测试）+ Playwright（E2E测试）
- **测试模式**: 
  - 单元测试：src/tests/unit/modules/{模块名}/
  - E2E测试：tests/e2e/main-flow.spec.ts
- **参考文件**: tests/unit/modules/shortcut-commands/customCommandService.test.ts
- **覆盖要求**: 正常流程 + 边界条件 + 错误处理

### 6. 依赖和集成点
- **外部依赖**: 
  - Tauri 2.0（桌面应用框架）
  - @tauri-apps/api（前端调用Rust）
- **内部依赖**: 
  - Vue 3（前端框架）
  - TypeScript（类型安全）
- **集成方式**: 
  - Rust后端：#[tauri::command] 暴露函数
  - 前端：invoke('@tauri-apps/api/core') 调用
  - 模块注册：ModuleRegistry.ts中配置
- **配置来源**: tauri.conf.json（应用配置）

### 7. 技术选型理由
- **为什么用Rust实现**:
  - 文件处理性能高（相对于Python/Node.js）
  - Tauri原生支持，安全性好
  - 单二进制部署，无外部依赖
  - 与现有项目架构一致（ADB快捷指令已采用）
- **优势**: 零外部依赖、打包后自包含、跨平台支持
- **劣势和风险**: 
  - 需要打包DecryptLogForWinX64.exe到资源目录
  - 文件路径处理需要考虑Windows/Linux/macOS差异
  - 大文件处理时的内存和性能优化

### 8. 关键风险点
- **依赖文件路径**: DecryptLogForWinX64.exe路径处理
  - 方案：打包到src-tauri/icons/或创建bin/目录
  - 通过Tauri的Path API获取资源路径
- **跨平台兼容性**: 
  - Windows：使用.exe文件
  - Linux/macOS：可能需要wine或提供替代方案
- **大文件处理**: 
  - 解密/解压过程可能耗时
  - 需要进度显示和取消功能
- **安全考虑**: 
  - 临时文件清理
  - 文件路径验证（防止目录穿越攻击）
