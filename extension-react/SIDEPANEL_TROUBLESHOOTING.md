# AIHC助手插件侧边栏问题诊断指南

## 🎯 **用户手势限制说明**

### ⚠️ **重要**: Chrome扩展的侧边栏API限制

由于Chrome安全策略，`chrome.sidePanel.open()` 只能在**直接的用户手势**中调用，包括：
- 点击插件图标
- 右键菜单点击
- 快捷键触发

**不能通过以下方式打开侧边栏**：
- 页面中的悬浮按钮点击（会失去用户手势上下文）
- 消息传递的异步调用
- 定时器或其他异步操作

### 🔧 **正确的使用方式**

1. **主要方式**: 点击浏览器工具栏中的 🔧 **AIHC助手** 图标
2. **辅助提示**: 页面右侧的悬浮按钮会提示你点击插件图标

## 🔧 **问题诊断步骤**

### 1️⃣ **重新加载插件**
1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 找到 "AIHC助手" 插件
4. 点击 **重新加载** 按钮 🔄

### 2️⃣ **检查Chrome版本**
1. 在地址栏输入 `chrome://version/`
2. 确认Chrome版本是否为 **114或更高版本**
3. ⚠️ sidePanel API需要Chrome 114+

### 3️⃣ **测试插件图标点击**
1. 访问百度云AIHC控制台任意页面：
   - https://console.bce.baidu.com/aihc/tasks
   - https://console.bce.baidu.com/aihc/resources
2. 点击浏览器工具栏中的 🔧 AIHC助手图标
3. 按 **F12** 打开开发者工具
4. 查看 **Console** 标签页中的日志

### 4️⃣ **预期的控制台日志**
点击插件图标后，应该看到以下日志：
```
[AIHC助手] 扩展图标被点击，当前标签页ID: 123 窗口ID: 456
[AIHC助手] sidePanel权限检查: true
[AIHC助手] 尝试打开侧边栏...
[AIHC助手] 侧边栏已成功打开
```

### 5️⃣ **测试悬浮按钮**
1. 在AIHC控制台页面，查看右侧边缘是否有 🔧 悬浮按钮
2. 点击悬浮按钮会显示提示信息，引导你点击插件图标
3. **注意**: 悬浮按钮不能直接打开侧边栏，只能提供指引

### 6️⃣ **正确的测试方法**

⚠️ **重要**: 由于用户手势限制，不能通过控制台命令测试侧边栏打开

**唯一正确的测试方式**：
1. 直接点击浏览器工具栏中的 🔧 **AIHC助手** 图标
2. 在Service Worker控制台中查看日志

**不可行的测试方式**：
```javascript
// ⚠️ 这些命令都不会成功，因为缺少用户手势
chrome.runtime.sendMessage({ action: 'openSidePanel' }); // ⚠️ 不会成功
chrome.sidePanel.open(); // ⚠️ 不会成功
```

## 🐛 **常见问题和解决方案**

### 问题1: 权限错误
**现象**: 控制台显示 "缺少sidePanel权限"
**解决**: 重新安装插件
1. 在扩展管理页面点击 "移除"
2. 重新加载插件文件夹

### 问题2: Chrome版本过低
**现象**: API不可用错误
**解决**: 升级Chrome到114+版本

### 问题3: 侧边栏显示但内容空白
**现象**: 侧边栏打开但没有内容
**解决**: 检查popup页面是否正确构建
```bash
# 检查文件是否存在
ls -la /Users/luyuchao/Documents/GitHub/AIHCX-WEB/extension-react/dist/popup/
```

### 问题4: 悬浮按钮不显示
**现象**: 右侧没有悬浮按钮
**解决**: 
1. 检查content script是否正确注入
2. 确认在支持的AIHC页面上
3. 查看content script控制台日志

## 📋 **日志收集**

如果问题仍然存在，请收集以下信息：

### A. Chrome信息
- Chrome版本: `chrome://version/`
- 操作系统版本

### B. 插件状态
```javascript
// 在控制台执行
console.log('插件ID:', chrome.runtime.id);
console.log('manifest版本:', chrome.runtime.getManifest().version);
```

### C. 权限检查
```javascript
// 检查所有权限
chrome.permissions.getAll().then(permissions => {
    console.log('已授权权限:', permissions);
});
```

### D. 完整的控制台日志
1. 清空控制台
2. 点击插件图标
3. 复制所有日志信息

## 🔍 **高级调试**

### 调试Background Script
1. 访问 `chrome://extensions/`
2. 找到AIHC助手插件
3. 点击 "检查视图" 下的 "background"
4. 在新打开的开发者工具中查看日志

### 调试Content Script
1. 在AIHC页面按F12
2. 在Console中查看 `[AIHC助手]` 开头的日志
3. 检查是否有错误信息

### 调试Popup页面
1. 右键点击插件图标
2. 选择 "检查弹出内容"
3. 查看是否有JavaScript错误

## 📞 **获取帮助**

如果以上步骤都无法解决问题，请提供：
1. Chrome版本号
2. 操作系统版本  
3. 完整的控制台错误日志
4. 是否在支持的页面上测试
5. 插件是否正确重新加载

---

**最后更新**: 2025-09-27
**适用版本**: AIHC助手 v0.4.1 (React版本)