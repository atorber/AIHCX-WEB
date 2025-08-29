# AIHCX

AIHCX是一个基于Node.js技术栈构建的**机器学习平台开发者工具全集**，旨在为AI/ML开发者提供一站式的开发、训练、部署和管理工具。

## 🚀 项目概述

AIHCX集成了多种开发工具和平台，帮助机器学习工程师和开发者更高效地进行模型训练、资源管理、任务调度和开发工作。项目采用模块化架构，支持多种部署方式和集成场景。

## 🛠️ 技术栈

- **后端框架**: Node.js + Express.js + TypeScript
- **前端框架**: Vue 3 + Element Plus + TypeScript
- **构建工具**: Vite + Webpack
- **数据库**: JSON文件存储（可扩展支持其他数据库）
- **API文档**: Swagger/OpenAPI
- **浏览器扩展**: Chrome Extension API
- **CLI工具**: Node.js命令行工具

## 📦 核心组件

### 1. CLI命令行工具 (`backend-node/`)
- 基于Node.js的命令行界面
- 支持任务创建、资源管理、模型训练等操作
- 提供丰富的命令行参数和交互式配置

### 2. WEB管理平台 (`web/`)
- 现代化的Vue 3单页应用
- 完整的任务管理、资源池管理、应用管理功能
- 响应式设计，支持多设备访问
- 集成Element Plus UI组件库

### 3. 后端API服务 (`backend-node/`)
- RESTful API接口设计
- 完整的CRUD操作支持
- Swagger API文档自动生成
- 模块化路由设计

### 4. 浏览器插件 (`extension/`)
- Chrome扩展程序
- 提供AIHC平台的快速访问功能
- 支持一键任务创建和状态查看

### 5. 油猴脚本 (`tampermonkey/`)
- 用户脚本支持
- 增强现有网页的AIHC功能
- 支持自定义脚本开发

### 6. MCP服务 (`mcp/`)
- Model Context Protocol服务
- 支持AI模型集成和上下文管理
- 提供标准化的模型接口

## 🎯 主要功能特性

### 任务管理
- 机器学习任务创建和配置
- 训练参数设置和优化
- 任务状态监控和日志查看
- 批量任务处理支持

### 资源池管理
- 计算资源分配和调度
- 资源使用率监控
- 动态资源扩缩容
- 成本优化建议

### 应用管理
- AI应用部署和管理
- 版本控制和回滚
- 性能监控和优化
- 用户权限管理

### 数据管理
- 数据集上传和预处理
- 数据质量检查和验证
- 数据版本管理
- 数据标注工具集成

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0 或 yarn >= 1.22.0
- 现代浏览器（Chrome、Firefox、Safari、Edge）

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/your-username/AIHCX-WEB.git
cd AIHCX-WEB
```

2. **安装依赖**
```bash
# 安装Web前端依赖
cd web
npm install

# 安装后端Node.js依赖
cd ../backend-node
npm install

# 安装浏览器插件依赖
cd ../extension
npm install
```

3. **启动服务**
```bash
# 启动后端API服务
cd backend-node
npm run dev

# 启动Web前端
cd ../web
npm run dev

# 构建浏览器插件
cd ../extension
npm run build
```

### 配置说明

1. **后端配置**: 在`backend-node/`目录下配置环境变量和数据库连接
2. **前端配置**: 在`web/src/`目录下配置API接口地址
3. **插件配置**: 在`extension/src/`目录下配置插件参数

## 📚 API文档

项目集成了Swagger/OpenAPI文档，启动后端服务后可通过以下地址访问：
- API文档: `http://localhost:3000/api-docs`
- API测试: `http://localhost:3000/api-docs/swagger-ui`

## 🔧 开发指南

### 项目结构
```
AIHCX-WEB/
├── web/                 # Vue 3前端应用
├── backend-node/        # Node.js后端API服务
├── extension/           # 浏览器插件
├── tampermonkey/        # 油猴脚本
├── mcp/                 # MCP服务
└── tools/               # 辅助工具
```

### 开发规范
- 使用TypeScript进行类型安全开发
- 遵循ESLint代码规范
- 提交前运行测试用例
- 使用语义化版本号

### 测试
```bash
# 运行单元测试
npm run test

# 运行E2E测试
npm run test:e2e

# 生成测试覆盖率报告
npm run test:coverage
```

## 🌟 贡献指南

我们欢迎社区贡献！请查看以下步骤：

1. Fork项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 📄 许可证

本项目采用MIT许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🤝 联系我们

- 项目主页: [GitHub Repository](https://github.com/your-username/AIHCX-WEB)
- 问题反馈: [Issues](https://github.com/your-username/AIHCX-WEB/issues)
- 功能建议: [Discussions](https://github.com/your-username/AIHCX-WEB/discussions)

## 🙏 致谢

感谢所有为AIHCX项目做出贡献的开发者和用户！

---

**AIHCX** - 让机器学习开发更简单、更高效！ 🚀