# 236日志解密工具目录

## 📋 说明

此目录用于存放 236日志解压模块所需的解密工具。

## 🔧 安装说明

### 必需文件
- `DecryptLogForWinX64.exe` - Windows 64位系统的解密工具

### 安装步骤
1. 从系统管理员或 IT 部门获取 `DecryptLogForWinX64.exe`
2. 将文件复制到此目录：`src-tauri/bin/DecryptLogForWinX64.exe`
3. 确保文件具有执行权限
4. 重启梧桐工具箱应用

### 备选安装位置
如果无法放置在此目录，也可以放在应用的可执行文件同目录下：
- `wutong-toolbox.exe` 所在目录的 `bin` 子目录
- 或直接放在 `wutong-toolbox.exe` 所在目录

### 文件结构示例
```
应用安装目录/
├── wutong-toolbox.exe
├── bin/
│   └── DecryptLogForWinX64.exe  ⬅️ 解密工具
└── other files...
```

## ⚠️ 重要提示
- 解密工具是 236日志解压功能正常运行所必需的
- 如果缺失此工具，用户将无法解压加密的日志文件
- 请妥善保管解密工具，不要随意传播

## 📞 技术支持
如遇问题，请联系系统管理员或 IT 部门。
