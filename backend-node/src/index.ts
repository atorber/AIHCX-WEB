const express = require("express");
import { Request, Response } from 'express';
const cors = require("cors");
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

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
  DescribeApp
} from './routes/apps';

const app = express();
app.use(express.json());
// 配置CORS中间件，允许暴露必要的响应头并接收Authorization请求头
app.use(cors({
  exposedHeaders: ['Authorization', 'x-bce-request-id', 'server'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'token', 'ak', 'sk', 'region'],
  credentials: true
}));

// Swagger 配置
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    // info: {
    //   title: 'AIHCX API 文档',
    //   version: '1.0.0',
    //   description: 'AIHCX 服务 API 接口文档'
    // },
    servers: [
      {
        url: 'http://127.0.0.1:8000',
        description: '开发服务器'
      }
    ],
    tags: [
      {
        name: '资源池',
        description: '资源池相关操作'
      },
      {
        name: '任务',
        description: '任务相关操作'
      },
      {
        name: '应用',
        description: '应用相关操作'
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/index.ts'] // 指定包含 API 注释的文件路径
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "AIHCX API 文档"
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
    if (action === 'DescribeJobs') {
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

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
