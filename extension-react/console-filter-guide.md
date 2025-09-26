# 控制台日志过滤指南

## 🎯 过滤第三方日志噪音

在AIHC页面的控制台中：

1. 点击控制台右上角的 **过滤器** 图标 🔍
2. 在过滤器输入框中输入：`[AIHC助手]`
3. 这样只会显示插件相关的日志，过滤掉页面的第三方库日志

## 📝 需要查找的关键日志

插件正常工作时应该看到：
```
[AIHC助手] 内容脚本已加载，当前URL: https://...
[AIHC助手] 检测到AIHC控制台页面
[AIHC助手] 开始注入组件
[AIHC助手] 切换按钮已添加到DOM
```

点击插件图标时应该看到：
```
[AIHC助手] 扩展图标被点击，当前标签页ID: xxx 窗口ID: xxx
[AIHC助手] sidePanel权限检查: true
[AIHC助手] 尝试打开侧边栏...
[AIHC助手] 侧边栏已成功打开
```

## ⚠️ 忽略的第三方日志

这些日志可以忽略（它们来自百度云控制台页面本身）：
- `Tracert before fns: logPv stop propagation`
- `A TrackRoute (/xxx) is nested inside another TrackRoute`
- `Portal Assistant loaded`
- `document.domain mutation is ignored`
- 任何来自 `app.d8f06386.js`、`hook.js`、`bundle.js` 的日志