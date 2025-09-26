# AIHC助手浏览器扩展 - React版本

## 项目概述

AIHC助手是一个专为百舸AIHC控制台设计的浏览器扩展程序，主要功能包括自动检测AIHC控制台页面、生成CLI命令、导出任务参数（JSON/YAML格式）、提供API文档链接等。本项目基于Vue版本重写为React实现。

## 技术栈

- **React 18**: 核心UI框架
- **TypeScript**: 类型安全和更好的开发体验
- **Vite**: 构建工具，快速开发和热更新
- **Chrome Extension API**: 浏览器扩展接口
- **CSS Modules**: 样式隔离和组件化样式管理

## 项目结构

```
extension-react/
├── src/
│   ├── components/           # React组件
│   │   ├── tabs/            # 标签页组件
│   │   ├── PopupContainer.tsx
│   │   ├── OptionsContainer.tsx
│   │   └── ...
│   ├── utils/               # 工具函数
│   │   ├── common.ts        # 通用工具
│   │   ├── pageDetection.ts # 页面检测
│   │   ├── chromeApi.ts     # Chrome API包装
│   │   └── helpers.ts       # 辅助函数
│   ├── types/               # TypeScript类型定义
│   ├── styles/              # 样式文件
│   ├── popup/               # 弹窗页面入口
│   ├── options/             # 设置页面入口
│   ├── background/          # 后台脚本
│   ├── content/             # 内容脚本
│   └── manifest.json        # 扩展清单
├── scripts/                 # 构建脚本
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 功能特性

### 支持的页面类型
- 资源池列表页面：显示资源池CLI命令和API文档
- 资源池详情页面：根据clusterUuid生成特定命令  
- 队列列表页面：显示队列相关CLI命令
- 任务列表页面：任务列表查询命令生成
- 任务详情页面：完整的任务操作命令集

### 核心功能
- **智能页面检测**：自动匹配URL模式并识别页面类型
- **CLI命令生成**：基于页面参数自动生成aihc命令
- **多格式导出**：支持JSON、YAML、TXT格式的参数导出
- **一键复制功能**：带视觉反馈的剪贴板操作
- **API文档集成**：快速访问相关技术文档
- **用户引导系统**：新手友好的使用指南
- **侧边栏集成**：通过content script注入的悬浮按钮和侧边栏

## 开发指南

### 环境要求
- Node.js >= 16
- npm >= 8

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 类型检查
```bash
npm run type-check
```

### 生成图标
```bash
npm run generate-icons
```

## 安装和使用

### 开发环境安装
1. 运行 `npm run build` 构建项目
2. 在Chrome浏览器中打开扩展管理页面（chrome://extensions/）
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目根目录下的 `dist` 文件夹

### 配置
1. 安装扩展后，右键点击扩展图标，选择"选项"
2. 在设置页面中填写您的百度云API凭证（Access Key和Secret Key）
3. 保存设置

### 使用方法
1. 访问百舸AIHC控制台（https://console.bce.baidu.com/aihc）
2. 扩展将自动检测支持的页面类型
3. 点击浏览器工具栏中的扩展图标或页面右侧的悬浮按钮
4. 根据页面类型查看相应的CLI命令、API文档等信息
5. 使用复制按钮将命令复制到剪贴板，或保存参数为文件

## 组件架构

### 主要组件
- **PopupContainer**: 主容器组件，管理状态和数据流
- **Header**: 头部组件，显示插件标题和页面信息
- **TabNavigation**: 标签导航组件，支持动态标签显示
- **ContentArea**: 内容区域组件，根据标签类型渲染内容
- **MessageDisplay**: 消息显示组件，支持多种消息类型
- **UserGuide**: 用户引导组件，新手使用指南

### 标签页组件
- **CLICommandTab**: CLI命令标签页
- **CommandScriptTab**: 启动命令标签页  
- **JSONParamsTab**: JSON参数标签页
- **YAMLParamsTab**: YAML参数标签页
- **APIDocsTab**: API文档标签页

## API接口

### Chrome Extension API
- `chrome.storage`: 数据存储
- `chrome.tabs`: 标签页操作
- `chrome.runtime`: 消息通信
- `chrome.sidePanel`: 侧边栏管理

### 消息通信
扩展使用消息传递机制在不同脚本间通信：
- Background Script ↔ Popup
- Background Script ↔ Content Script
- Content Script ↔ Popup

## 样式系统

### 设计原则
- 响应式设计，适配不同屏幕尺寸
- 一致的色彩系统和间距规范
- 平滑的过渡动画和交互反馈
- 支持深色模式（可选）

### 色彩系统
- 主色调：#4285f4（Google蓝）
- 成功色：#10b981（绿色）
- 警告色：#f59e0b（橙色）
- 错误色：#ef4444（红色）

## 调试和问题排查

### 开发者工具
1. 打开Chrome开发者工具
2. 切换到"扩展程序"标签页
3. 查看Background页面和Popup页面的控制台日志

### 常见问题
1. **扩展无法加载**: 检查manifest.json文件和构建产物
2. **页面检测失败**: 确认URL模式匹配逻辑
3. **API调用失败**: 检查网络连接和API凭证配置
4. **样式显示异常**: 检查CSS文件路径和样式优先级

## 性能优化

### 已实现的优化
- 组件懒加载和代码分割
- 防抖和节流处理用户输入
- 缓存机制减少重复API调用
- CSS优化和动画性能

### 建议的优化
- 使用React.memo优化组件渲染
- 实现虚拟滚动处理大量数据
- 添加Service Worker缓存策略

## 贡献指南

### 开发流程
1. Fork项目仓库
2. 创建特性分支
3. 提交代码更改
4. 创建Pull Request

### 代码规范
- 使用TypeScript严格模式
- 遵循ESLint和Prettier配置
- 编写单元测试覆盖核心功能
- 添加适当的代码注释

## 许可证

MIT License

## 更新日志

### v0.4.1 (React版本)
- 完全重写为React架构
- 改进的组件化设计
- 更好的TypeScript支持
- 优化的样式系统
- 增强的错误处理

### 从Vue版本的主要变更
- 使用React Hooks替代Vue Composition API
- TypeScript类型系统重构
- Vite构建配置优化
- 组件架构标准化