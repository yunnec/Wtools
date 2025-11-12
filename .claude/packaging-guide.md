# 236日志解密工具打包指南

## 📋 打包方案

**更新时间**: 2025-11-12 12:15
**适用版本**: v1.0.0 及以上

## 🎯 目标

将 `DecryptLogForWinX64.exe` 打包到正式发布版本中，用户无需手动安装即可使用。

## ✅ 已完成的配置

### 1. Tauri配置修改

**文件**: `src-tauri/tauri.conf.json`
**修改**: 添加 `bundle.resources` 配置

```json
{
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ],
    "resources": [
      "bin/DecryptLogForWinX64.exe"  // ← 新增这行
    ]
  }
}
```

## 📂 文件放置

### 开发环境
当前解密工具位置：
```
C:\code\Wtools\src-tauri\target\debug\bin\DecryptLogForWinX64.exe
```

### 正式打包
**需要放置在**:
```
src-tauri/bin/DecryptLogForWinX64.exe
```

**操作步骤**:
1. 从开发环境复制解密工具：
   ```bash
   cp src-tauri/target/debug/bin/DecryptLogForWinX64.exe src-tauri/bin/
   ```

2. 确保文件存在：
   ```bash
   ls -la src-tauri/bin/DecryptLogForWinX64.exe
   ```

## 🏗️ 构建流程

### 开发模式 (Development)
```bash
npm run tauri dev
```
- 使用 `target/debug/bin/DecryptLogForWinX64.exe`
- 解密工具路径：`当前目录/bin/DecryptLogForWinX64.exe`

### 正式打包 (Production)
```bash
npm run tauri build
```

**打包过程**:
1. Tauri读取 `tauri.conf.json` 中的 `resources` 配置
2. 将 `src-tauri/bin/DecryptLogForWinX64.exe` 复制到构建输出
3. 打包成最终的可执行文件

**输出位置**:
- **Windows**: `src-tauri/target/release/bundle/msi/*.msi`
- **macOS**: `src-tauri/target/release/bundle/dmg/*.dmg`
- **Linux**: `src-tauri/target/release/bundle/deb/*.deb` 或 `AppImage`

## 🔧 路径解析

### 在Rust代码中访问

当前代码使用：
```rust
let exe_dir = std::env::current_exe()
    .map_err(|e| format!("获取当前exe路径失败: {}", e))?
    .parent()
    .ok_or("无法获取exe目录")?
    .to_path_buf();
```

这个路径解析方式在打包后仍然有效：
- **Windows**: `C:\Program Files\Wutong Toolbox\wutong-toolbox.exe`
- **查找路径**:
  1. `C:\Program Files\Wutong Toolbox\bin\DecryptLogForWinX64.exe` ✅ 找到！
  2. `C:\Program Files\Wutong Toolbox\DecryptLogForWinX64.exe`

### 文件结构示例

**正式安装后的目录结构**:
```
Windows:
C:\Program Files\wutong-toolbox\
├── wutong-toolbox.exe              ← 主程序
├── bin\
│   └── DecryptLogForWinX64.exe    ← 解密工具 (打包进去的)
├── resources\
│   └── (其他资源文件)
└── licenses\
    └── (许可证文件)

macOS:
/Applications/wutong-toolbox.app/Contents/
├── MacOS/wutong-toolbox
├── bin/
│   └── DecryptLogForWinX64.exe
└── Resources/
```

## 📦 打包验证

### 检查资源是否打包

1. **Windows MSI检查**:
   ```bash
   # 解压MSI文件查看内容
   # 或者使用工具如 7-Zip 打开MSI文件
   # 检查是否存在 bin/DecryptLogForWinX64.exe
   ```

2. **通过日志验证**:
   运行正式版本，查看日志：
   ```
   [236解压] 找到解密工具: C:\Program Files\wutong-toolbox\bin\DecryptLogForWinX64.exe
   ```

### 构建测试命令

```bash
# 完整构建
cd src-tauri
cargo build --release

# 仅检查配置
tauri build --debug  # 快速验证，不会真正打包
```

## 🎨 多平台兼容性

### Windows
- ✅ 自动包含 `DecryptLogForWinX64.exe`
- ✅ 64位系统完美支持
- ✅ 文件会放在安装目录的 `bin/` 子目录

### macOS
- ⚠️ `DecryptLogForWinX64.exe` 是Windows可执行文件
- ❌ 在macOS上无法直接运行
- 💡 **建议**: 提供macOS版本的解密工具，或使用Wine

### Linux
- ⚠️ 同macOS问题
- 💡 **建议**: 提供Linux版本，或使用Wine

## 🔄 更新策略

### 如何更新解密工具

1. **替换源文件**:
   ```bash
   # 替换解密工具
   cp 新的解密工具.exe src-tauri/bin/DecryptLogForWinX64.exe
   ```

2. **重新构建**:
   ```bash
   npm run tauri build
   ```

3. **分发**:
   - 用户重新下载安装包
   - 或提供增量更新机制

## 📋 清单列表

### 需要准备的文件
- [ ] `DecryptLogForWinX64.exe` (Windows 64位版)
- [ ] `DecryptLogForMac` (如果需要macOS支持)
- [ ] `DecryptLogForLinux` (如果需要Linux支持)

### 配置文件
- [x] `src-tauri/tauri.conf.json` - 已添加resources配置
- [ ] `src-tauri/bin/DecryptLogForWinX64.exe` - 需要放置文件

### 构建命令
- [ ] `cp` 命令复制文件
- [ ] `npm run tauri build` 执行构建
- [ ] 验证打包结果

## 🎯 推荐部署方案

### 方案一：纯Windows发布（推荐）
- **优势**: 简单、可靠、无兼容性问题
- **适用**: 主要面向Windows用户
- **实施**:
  - 仅打包 `DecryptLogForWinX64.exe`
  - 不支持macOS/Linux
  - 在README中说明仅支持Windows

### 方案二：多平台支持
- **优势**: 覆盖所有平台
- **挑战**: 需要多个平台的解密工具
- **实施**:
  - Windows: `bin/DecryptLogForWinX64.exe`
  - macOS: `bin/DecryptLogForMac`
  - Linux: `bin/DecryptLogForLinux`
  - 代码中动态选择解密工具

### 方案三：自动下载（未来考虑）
- **优势**: 应用体积小，可更新解密工具
- **挑战**: 需要服务器存储
- **实施**:
  - 应用启动时检查解密工具
  - 如果不存在，自动从服务器下载
  - 提供离线安装选项

## 🚀 立即执行步骤

### 第1步：放置解密工具
```bash
# 确保在项目根目录
cd C:\code\Wtools

# 创建bin目录（如果不存在）
mkdir -p src-tauri/bin

# 复制解密工具
cp src-tauri/target/debug/bin/DecryptLogForWinX64.exe src-tauri/bin/

# 验证文件存在
ls -la src-tauri/bin/
```

### 第2步：构建测试
```bash
# 开发模式测试
npm run tauri dev

# 检查日志输出
# 应该显示：找到解密工具: ...bin/DecryptLogForWinX64.exe
```

### 第3步：正式打包
```bash
# 全平台构建
npm run tauri build

# 或仅构建Windows
npm run tauri build -- --target x86_64-pc-windows-msvc
```

### 第4步：验证打包结果
1. 运行正式版本
2. 查看日志确认解密工具路径
3. 测试解压功能

## ✅ 成功标志

构建成功后，在正式版本中应该看到：
```
[236解压] 找到解密工具: C:\Program Files\wutong-toolbox\bin\DecryptLogForWinX64.exe
[236解压] 解密完成
[236解压] 解压完成
[236解压] 已自动打开解压目录
```

## 📞 技术支持

### 常见问题

**Q: 构建时提示找不到文件**
A: 检查 `src-tauri/bin/DecryptLogForWinX64.exe` 是否存在，路径是否正确

**Q: 正式版中解密工具无法运行**
A: 检查文件权限，确保可执行

**Q: macOS/Linux上运行失败**
A: 当前仅支持Windows，macOS/Linux需要单独的工具

**Q: 如何更新解密工具**
A: 替换 `src-tauri/bin/` 中的文件，重新构建即可

## 🎉 总结

通过在 `tauri.conf.json` 中配置 `resources`，我们可以轻松地将解密工具打包到正式版本中。用户在安装应用后即可直接使用，无需手动配置。

**推荐步骤**:
1. ✅ 已完成：修改 `tauri.conf.json`
2. ⏳ 待执行：复制解密工具到 `src-tauri/bin/`
3. ⏳ 待执行：执行 `npm run tauri build`
4. ⏳ 待执行：验证打包结果

---

**配置完成**: 2025-11-12 12:15
**状态**: 配置已就绪，等待放置文件并构建
