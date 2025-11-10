# ADB快捷指令命令列表

基于文档提取的命令，按功能分类：

## 应用管理类

### 启动应用
```bash
adb shell am start -n com.tinnove.wecarspeech/.app.MainActivity
```

### 强制停止应用
```bash
adb shell am force-stop com.tinnove.wecarspeech
adb shell pkill wecarspeech
```

### 重启应用
```bash
adb shell am start -S com.tinnove.wecarspeech/.app.MainActivity
```

### 安装应用
```bash
adb install -r -d -f -t Tspeech.apk
```
- `-r`: 允许覆盖安装
- `-d`: 允许降级
- `-f`: 强制安装到内部存储
- `-t`: 允许测试APK

### 卸载应用
```bash
adb uninstall com.tinnove.wecarspeech
```

### 获取应用版本信息
```bash
adb shell dumpsys package com.tinnove.wecarspeech | findstr version
```

## 服务管理类

### 启动服务
```bash
adb shell am startservice -n com.tinnove.wecarspeech/com.tinnove.vrlogic.server.ExtraService --es nluStr "语音交互等多轮对话系统"
```
- `--es`: 传递字符串参数(String参数不是仅能传字符串参数)

## 测试与调试类

### 打开日志测试页面
```bash
adb shell am start -n com.tinnove.wecarspeech/com.tinnove.vrclient.test.LogTestActivity
```

### 连续操作：停止应用并重启
```bash
adb shell am force-stop com.tinnove.wecarspeech; adb shell am start -S com.tinnove.wecarspeech/.app.MainActivity
```

### 调试模式注释
```bash
// 关闭应用需要再次执行时才执行
```

## 通用ADB命令(建议补充)

### 设备管理
```bash
adb devices                          # 列出连接的设备
adb shell getprop ro.build.version.release  # 获取Android版本
adb shell getprop ro.product.model          # 获取设备型号
```

### 文件操作
```bash
adb push <local> <remote>           # 推送文件到设备
adb pull <remote> <local>           # 从设备拉取文件
adb shell ls /sdcard/               # 列出设备文件
```

### 日志管理
```bash
adb logcat                          # 查看实时日志
adb logcat -c                       # 清除日志缓存
adb logcat -s TAG_NAME              # 过滤特定标签
```

### 网络调试
```bash
adb tcpip 5555                      # 启用TCP/IP模式(端口5555)
adb connect <ip>                    # 通过WiFi连接设备
adb disconnect <ip>                 # 断开WiFi连接
```

### 系统信息
```bash
adb shell top                       # 查看进程占用
adb shell df                        # 查看磁盘使用
adb shell cat /proc/meminfo         # 查看内存信息
```

### 性能测试
```bash
adb shell dumpsys meminfo <package> # 查看应用内存使用
adb shell dumpsys gfxinfo <package> # 查看应用绘制性能
```

### 屏幕操作
```bash
adb shell screencap /sdcard/screen.png  # 截屏
adb shell screenrecord /sdcard/demo.mp4 # 录屏
adb shell input tap x y                 # 点击屏幕
adb shell input swipe x1 y1 x2 y2 500   # 滑动屏幕
```

### 权限管理
```bash
adb shell pm list packages                     # 列出所有包
adb shell pm clear <package>                   # 清除应用数据
adb shell pm grant <package> <permission>      # 授予权限
adb shell pm revoke <package> <permission>     # 撤销权限
```
