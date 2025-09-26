# AIHC助手插件调试指南

## 🔍 问题排查步骤

### 1. 检查插件安装状态
- 打开Chrome扩展程序页面 (`chrome://extensions/`)
- 确认"AIHC助手"插件已启用
- 检查插件版本是否为0.4.1

### 2. 检查插件权限
确认插件具有以下权限：
- `storage` - 存储配置和状态
- `activeTab` - 访问当前标签页
- `tabs` - 管理标签页
- `sidePanel` - 侧边栏功能

### 3. 检查页面URL
插件只在以下页面工作：
- `https://console.bce.baidu.com/aihc/*`

### 4. 查看控制台日志
1. 打开开发者工具 (F12)
2. 切换到Console标签页
3. 刷新页面
4. 查找以`[AIHC助手]`开头的日志

**正常日志示例：**
```
[AIHC助手] 内容脚本已加载，当前URL: https://console.bce.baidu.com/aihc/tasks
[AIHC助手] 文档已加载完成
[AIHC助手] 检测到AIHC控制台页面
[AIHC助手] 禁用状态检查结果: {}
[AIHC助手] 开始注入组件
[AIHC助手] injectComponent 开始执行
[AIHC助手] 禁用页面列表: []
[AIHC助手] 当前页面路径: /aihc/tasks
[AIHC助手] 创建切换按钮
[AIHC助手] 切换按钮已添加到DOM
```

### 5. 检查DOM元素
在控制台执行以下代码检查按钮是否存在：
```javascript
// 检查切换按钮
console.log('切换按钮:', document.getElementById('aihcx-helper-toggle'));

// 检查侧边栏面板
console.log('侧边栏面板:', document.getElementById('aihcx-side-panel'));

// 检查遮罩层
console.log('遮罩层:', document.getElementById('aihcx-side-panel-mask'));
```

### 6. 检查CSS样式
确认样式文件是否正确加载：
```javascript
// 检查样式表
const stylesheets = Array.from(document.styleSheets);
const aihcStyles = stylesheets.find(sheet => 
  sheet.href && sheet.href.includes('content/style.css')
);
console.log('AIHC样式表:', aihcStyles);
```

## 🐛 常见问题及解决方案

### 问题1：按钮不显示
**可能原因：**
- 插件未启用
- 页面URL不匹配
- CSS样式未加载
- JavaScript错误

**解决方案：**
1. 重新加载插件
2. 检查控制台错误
3. 确认页面URL正确

### 问题2：按钮显示但无法点击
**可能原因：**
- CSS z-index问题
- 事件监听器未绑定
- 元素被其他元素遮挡

**解决方案：**
1. 检查CSS样式
2. 查看控制台错误
3. 检查元素层级

### 问题3：侧边栏无法打开
**可能原因：**
- background脚本错误
- 消息传递失败
- 权限不足

**解决方案：**
1. 检查background脚本
2. 查看控制台错误
3. 确认权限配置

## 🔧 手动测试步骤

### 1. 基础功能测试
```javascript
// 手动创建按钮进行测试
const button = document.createElement('button');
button.id = 'aihcx-helper-toggle';
button.style.cssText = `
  position: fixed;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  width: 40px;
  height: 60px;
  background: linear-gradient(135deg, #4285f4 0%, #34a853 100%);
  border: none;
  border-radius: 8px 0 0 8px;
  cursor: pointer;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
`;
button.textContent = 'AIHC';
document.body.appendChild(button);
```

### 2. 事件测试
```javascript
// 测试按钮点击事件
const button = document.getElementById('aihcx-helper-toggle');
if (button) {
  button.addEventListener('click', () => {
    console.log('按钮被点击了！');
    alert('AIHC助手按钮工作正常！');
  });
}
```

## 📞 获取帮助

如果以上步骤都无法解决问题，请提供以下信息：

1. **浏览器版本**：Chrome版本号
2. **插件版本**：0.4.1
3. **页面URL**：当前测试的页面地址
4. **控制台日志**：完整的控制台输出
5. **错误信息**：任何错误或警告信息
6. **重现步骤**：详细的操作步骤

---

**注意**：确保在真实的AIHC控制台页面进行测试，插件不会在本地测试页面工作。
