import express, { Request, Response } from 'express';
import cors from 'cors';
import * as swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './swagger';

// 导入路由
import resourcePoolsRouter from './routes/resourcePools';
import jobsRouter from './routes/jobs';

import {
  DescribeResourcePools,
  DescribeResourcePool,
  DescribeResourceQueues,
  DescribeResourceQueue
} from './routes/resourcePools';

import {
  DescribeJobs,
  DescribeJob,
  DescribeJobWebTerminal,
  CreateJob
} from './routes/jobs';

import {
  DescribeApps,
  DescribeApp,
  DescribeAppTags
} from './routes/apps';

import {
  Login,
  DescribeUser
} from './routes/user';

const app = express();
const port = process.env.PORT || 8000;

// 解析 JSON 请求体
app.use(express.json());

// 配置CORS中间件，允许暴露必要的响应头并接收Authorization请求头
app.use(cors({
  exposedHeaders: ['Authorization', 'x-bce-request-id', 'server'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'token', 'ak', 'sk', 'region', 'x-api-key'],
  credentials: true
}));

// 集成 Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  swaggerOptions: {
    defaultModelsExpandDepth: 3, // 展开模型的深度
    defaultModelExpandDepth: 3,  // 展开默认模型的深度
    filter: true,                // 启用过滤
    showExtensions: true,        // 显示扩展
    showCommonExtensions: true,  // 显示通用扩展
  },
  customCss: '.swagger-ui .topbar { display: none }', // 隐藏顶部栏
  customSiteTitle: "AI训练平台 API 文档"  // 设置页面标题
}));

// 注册路由
app.use('/', resourcePoolsRouter);
app.use('/', jobsRouter);

// RPC风格API入口
app.post('/', async (req: Request, res: Response) => {
  const { method, params, query, body, headers, url, baseUrl, originalUrl } = req;
  const action = query.action;
  const responseData = {
    url,
    baseUrl,
    originalUrl,
    method,
    params,
    query,
    body,
    headers
  }

  if (action === 'CreateJob') {
    const response = await CreateJob(req, res);
    res.json(response);
  } else if (action === 'Login') {
    const response = await Login(req, res);
    res.json(response);
  } else {
    res.status(400).json({
      message: 'Invalid action'
    });
  }
});

app.get('/', async (req: Request, res: Response) => {
  const { method, params, query, body, headers, url, baseUrl, originalUrl } = req;
  const action = query.action;
  const responseData = {
    url,
    baseUrl,
    originalUrl,
    method,
    params,
    query,
    body,
    headers
  }

  console.log(responseData);

  try {
    if (action === 'DescribeUser') {
      const response = await DescribeUser(req, res);
      res.json(response);
    } else if (action === 'DescribeJobs') {
      const response = await DescribeJobs(req, res);
      res.json(response);
    } else if (action === 'DescribeJob') {
      const response = await DescribeJob(req, res);
      res.json(response);
    } else if (action === 'DescribeResourcePools') {
      const response = await DescribeResourcePools(req, res);
      res.json(response);
    } else if (action === 'DescribeResourcePool') {
      const response = await DescribeResourcePool(req, res);
      res.json(response);
    } else if (action === 'DescribeResourceQueues') {
      const response = await DescribeResourceQueues(req, res);
      res.json(response);
    } else if (action === 'DescribeResourceQueue') {
      const response = await DescribeResourceQueue(req, res);
      res.json(response);
    } else if (action === 'DescribeJobWebTerminal') {
      const response = await DescribeJobWebTerminal(req, res);
      res.json(response);
    } else if (action === 'DescribeApps') {
      const response = await DescribeApps(req, res);
      res.json(response);
    } else if (action === 'DescribeApp') {
      const response = await DescribeApp(req, res);
      res.json(response);
    } else if (action === 'DescribeAppTags') {
      const response = await DescribeAppTags(req, res);
      console.log(response);
      res.json(response);
    } else {
      res.status(400).json({
        message: 'Invalid action'
      });
    }
  } catch (err) {
    console.error('API请求错误:', err);
    res.status(500).json({
      message: err instanceof Error ? err.message : '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? err : undefined
    });
  }
});

// 启动服务器
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  console.log(`API documentation is available at http://localhost:${port}/api-docs`);
});
