# 正式包构建 - 检查清单

## 🎯 构建前检查

### 必备文件
- [x] `src-tauri/bin/DecryptLogForWinX64.exe` ✅ (2.0MB)
- [x] `src-tauri/tauri.conf.json` 配置resources ✅
- [ ] 构建命令准备就绪 ⏳

## 📦 构建命令

### 全平台构建
```bash
npm run tauri build
```
**耗时**: 约5-10分钟
**输出**: Windows/macOS/Linux三个平台

### 仅Windows构建（推荐）
```bash
npm run tauri build -- --target x86_64-pc-windows-msvc
```
**耗时**: 约3-5分钟
**输出**: 仅Windows平台

## 🔍 构建后验证

### 文件存在性检查
```bash
# 检查输出目录
ls -la src-tauri/target/release/bundle/msi/
```

### 日志验证
运行正式版本，在控制台或日志文件中查看：
```
[236解压] 找到解密工具: C:\Program Files\wutong-toolbox\bin\DecryptLogForWinX64.exe
```

### 功能验证步骤
1. ✅ 打开应用
2. ✅ 进入"236日志解压"模块
3. ✅ 选择或拖拽日志文件
4. ✅ 点击"开始解压"
5. ✅ 确认自动打开解压目录

## 🎉 成功标志

所有以下条件满足即为成功：
- [ ] 构建命令执行完成，无错误
- [ ] 生成MSI/EXE安装文件
- [ ] 安装到系统后应用能正常启动
- [ ] 解密工具路径正确
- [ ] 解压功能完全正常

## 🚨 常见问题解决

### 问题1：构建失败
**原因**: 可能缺少依赖
**解决**: 运行 `npm install` 然后重试

### 问题2：解密工具路径错误
**原因**: 文件未正确复制或配置错误
**解决**:
1. 检查 `src-tauri/bin/DecryptLogForWinX64.exe` 是否存在
2. 重新复制文件
3. 重新构建

### 问题3：无法打开解压目录
**原因**: 权限问题或路径不存在
**解决**: 检查应用是否有文件管理器访问权限

## 📞 需要帮助？

如果在构建过程中遇到问题：
1. 查看构建日志输出
2. 检查错误信息
3. 参考 `.claude/packaging-guide.md` 详细指南

---

**最后更新**: 2025-11-12 12:10
**状态**: 等待执行构建命令
