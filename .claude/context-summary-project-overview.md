# 项目上下文摘要（梧桐工具箱）

生成时间：2025-11-12 10:36:00

## 1. 相似实现分析

### 实现1: 语义对比模块 (src/modules/semantic-compare/SemanticCompare.vue:1-100)
- **模式**: 双栏对比布局 + 实时状态管理
- **可复用**: 连接状态显示组件、结果展示组件、统计信息组件
- **需注意**: 使用 ref 管理DOM引用，事件总线通信，响应式状态管理

### 实现2: ADB快捷指令模块 (src/modules/shortcut-commands/ShortcutCommands.vue:1-80)
- **模式**: 配置驱动 + 服务层抽象
- **可复用**: 自定义命令管理组件、服务层接口、分类排序逻辑
- **需注意**: 服务层分离 (CustomCommandService)，组件化设计

### 实现3: JSON工具模块 (src/modules/json-tool/JsonTool.vue:1-50)
- **模式**: 输入输出双栏布局 + 操作按钮组
- **可复用**: 表单验证、错误处理、复制/下载功能
- **需注意**: Vue 3 Composition API，响应式数据，事件处理

### 实现4: 236日志解压模块 (src/modules/log-decompress/LogDecompress.vue:1-50)
- **模式**: 进度反馈 + 错误显示 + 环境检测
- **可复用**: 进度条组件、错误提示组件、Tauri环境检测
- **需注意**: 开发模式提示，进度状态管理，错误处理

### 实现5: 插件系统核心 (src/core/plugin.bak/PluginManager.ts:1-80)
- **模式**: 生命周期管理 + 上下文隔离
- **可复用**: 插件注册机制、验证框架、测试框架
- **需注意**: 事件驱动通信，类型安全，资源管理

## 2. 项目约定

### 命名约定
- **文件命名**: 使用短横线分隔 (shortcut-commands, log-decompress)
- **组件命名**: PascalCase (JsonTool, ShortcutCommands)
- **类型定义**: PascalCase + .d.ts 后缀 (plugin.d.ts, event.d.ts)
- **模块目录**: 小写字母 + 短横线
- **Vue组件**: 大驼峰命名 (SemanticCompare.vue)

### 文件组织
```
src/
├── core/                 # 核心系统
│   ├── config/          # 配置管理
│   ├── event/           # 事件总线
│   ├── theme/           # 主题服务
│   └── plugin.bak/      # 插件系统(已废弃)
├── modules/             # 功能模块
│   ├── [module-name]/   # 模块目录
│   │   ├── *.vue        # Vue组件
│   │   ├── index.ts     # 导出文件
│   │   ├── components/  # 子组件(可选)
│   │   └── services/    # 服务层(可选)
├── types/               # 类型定义
└── components/          # 公共组件
```

### 导入顺序
1. Vue相关 (defineAsyncComponent, ref, reactive等)
2. 项目核心系统 (core/*)
3. 类型定义 (types/*)
4. 工具函数 (utils/helpers)
5. 第三方库 (lodash, axios等)

### 代码风格
- **缩进**: 2个空格
- **引号**: 单引号优先
- **分号**: 必需
- **注释**: 完整的简体中文注释，描述意图而非重复代码
- **TypeScript**: 严格模式，完整类型定义
- **Vue**: 组合式API + <script setup> 语法

## 3. 可复用组件清单

### 核心服务层
- `src/core/event/EventBus.ts`: 事件总线，支持 on/once/emit/off
- `src/core/config/ConfigService.ts`: 配置管理，支持持久化和监听
- `src/core/theme/ThemeService.ts`: 主题服务，亮/暗色切换
- `src/core/plugin.bak/PluginTestFramework.ts`: 插件测试框架

### 工具函数
- `src/test/test-utils.ts`: 测试工具函数

### 公共组件
- `src/components/ui/ThemeToggle.vue`: 主题切换按钮

### 模块注册
- `src/modules/ModuleRegistry.ts`: 模块注册表，统一管理所有模块

## 4. 测试策略

### 测试框架
- **单元测试**: Vitest + Vue Test Utils
- **E2E测试**: Playwright
- **覆盖率**: 使用 @vitest/coverage-v8

### 测试模式
- **模块测试**: 测试每个工具模块的核心逻辑
- **核心系统测试**: 测试EventBus、ConfigService、ThemeService
- **组件测试**: 使用 mount + shallowMount
- **边界条件测试**: 重点测试错误处理和边界情况

### 参考文件
- `tests/unit/modules/jsonTool.test.ts`: JSON工具测试，包含23个测试用例
- `tests/unit/core/eventBus.test.ts`: 事件总线测试
- `tests/unit/core/themeService.test.ts`: 主题服务测试
- `tests/e2e/main-flow.spec.ts`: 端到端测试

### 覆盖要求
- **正常流程**: 100%覆盖主要功能
- **边界条件**: 必测 (空值、超长字符串、特殊字符)
- **错误处理**: 必测 (网络错误、解析失败、权限问题)
- **性能测试**: 关键模块需要性能基准测试

## 5. 依赖和集成点

### 外部依赖
- `@tauri-apps/api`: Tauri桌面应用API
- `vue`: Vue 3.5.24，组合式API
- `typescript`: TypeScript 5.9.3
- `vite`: Vite 7.2.2，构建工具
- `tailwindcss`: Tailwind CSS 3.4.18，样式框架
- `vitest`: Vitest 4.0.8，测试框架

### 内部依赖
- **核心系统**: EventBus、ConfigService、ThemeService、ModuleRegistry
- **模块通信**: 通过事件总线进行解耦通信
- **配置共享**: ConfigService统一管理所有配置

### 集成方式
- **事件驱动**: 通过EventBus.emit/on进行模块间通信
- **服务注入**: 通过context.services访问核心服务
- **组件懒加载**: 使用defineAsyncComponent实现代码分割
- **配置持久化**: localStorage + ConfigService自动迁移

### 配置来源
- **应用配置**: localStorage.wutong-config
- **主题配置**: localStorage.wutong-theme
- **版本迁移**: ConfigService自动处理版本升级

## 6. 技术选型理由

### 为什么用Tauri？
- **优势**: 性能接近原生、支持多平台、安全沙箱、Rust后端
- **适用场景**: 需要本地文件系统访问、跨平台桌面应用
- **权衡**: 学习成本较高，但长期维护性好

### 为什么用Vue 3？
- **优势**: 组合式API、性能优异、生态成熟、中文文档完善
- **适用场景**: 中小型项目、快速开发、团队熟悉度高
- **权衡**: 与React相比生态系统较小，但开发效率更高

### 为什么用TypeScript？
- **优势**: 类型安全、IDE支持好、降低运行时错误
- **适用场景**: 中大型项目、多人协作、长期维护
- **权衡**: 编译步骤增加，但收益明显

### 为什么用Tailwind CSS？
- **优势**: 原子化CSS、开发效率高、设计一致性好
- **适用场景**: 快速原型、统一视觉风格、响应式设计
- **权衡**: 样式冗余，但开发速度优势明显

## 7. 关键风险点

### 并发问题
- **事件总线**: 可能存在事件竞争，需要考虑事件顺序
- **配置更新**: 多个模块同时更新配置可能导致状态不一致
- **缓解措施**: 事件队列化、配置原子操作

### 边界条件
- **大文件处理**: JSON工具处理超大JSON (10MB+)
- **长字符串**: 语义请求模块处理超长文本
- **网络异常**: 语义请求失败后的重试和降级
- **缓解措施**: 性能测试、错误处理、用户提示

### 性能瓶颈
- **模块切换**: 懒加载可能导致的首次加载延迟
- **DOM更新**: 大数据量渲染的性能问题
- **内存泄漏**: 事件监听器未及时清理
- **缓解措施**: 代码分割、虚拟滚动、生命周期管理

### 安全考虑
- **XSS防护**: Vue自动转义，但用户输入仍需验证
- **数据持久化**: localStorage存储敏感信息
- **网络请求**: 语义请求涉及API密钥管理
- **缓解措施**: 输入验证、加密存储、密钥管理

## 8. 开发指南总结

### 新模块开发流程
1. 在 src/modules/ 下创建目录
2. 创建 *.vue 组件文件
3. 创建 index.ts 导出文件
4. 在 ModuleRegistry.ts 中注册模块
5. 编写单元测试
6. 更新类型定义（如需要）

### 代码规范检查清单
- [ ] TypeScript严格模式
- [ ] 完整的类型定义
- [ ] 中文注释和文档
- [ ] 响应式数据管理
- [ ] 错误处理和用户提示
- [ ] 性能优化（懒加载、防抖等）
- [ ] 测试覆盖率达标
- [ ] 主题切换支持

### 常见模式
- **双栏布局**: 左侧输入，右侧输出，中间操作按钮
- **状态管理**: 使用 ref/reactive 管理本地状态
- **事件通信**: 通过EventBus与外部通信
- **错误处理**: try-catch + 用户友好的错误提示
- **加载状态**: 使用 loading 标志 + 进度显示
- **主题适配**: 所有样式使用 dark: 前缀支持暗色模式
