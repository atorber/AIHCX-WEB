import { Request, Response, Router } from 'express';
import { RequestHeaders, getSignature, extractCredentials } from '../utils/common';
const rp = require("request-promise");
import { v4 as uuidv4 } from 'uuid';

const router = Router();

const apps = [
  {
    id: 1,
    tags: ['DeepSeek', 'LLM'],
    category: 'DeepSeek',
    subcategory: 'LLM',
    name: 'DeepSeek-R1',
    description: 'DeepSeek推出的第一代推理模型 DeepSeek-R1-Zero 和 DeepSeek-R1。DeepSeek-R1-Zero 是一种通过大规模化学习 (RL) 训练的模型，先需监督微调 (SFT) 作为初步步骤，在推理方面表现...',
    updateDate: '2025-3-25更新',
    version: 'DeepSeek-R1',
    supportDeploy: true,
    actions: ['一键部署']
  },
  {
    id: 2,
    tags: ['LLM', '数据'],
    category: 'AI工具',
    subcategory: '数据转储',
    name: '数据转储',
    description: '将对象存储中的数据下载到本地或者将本地数据上传到对象存储，本地存储可以是并行文件存储、本地盘、容量型存储等。',
    updateDate: '2025-3-25更新',
    version: 'gemma-3-27b-it',
    supportDeploy: true,
    actions: ['运行任务'],
    jobFormDescriptor: {
      sections: [
        {
          id: 'basic',
          title: '基础信息',
          fields: [
            {
              id: 'taskName',
              name: 'taskName',
              label: '微调任务名称',
              type: 'text',
              required: true,
              placeholder: '请输入微调任务名称',
              tip: '支持小写字母、数字以及-，且开头必须是小写字母，结尾必须是小写字母或数字，长度1-50'
            },
            {
              id: 'poolType',
              name: 'poolType',
              label: '资源池类型',
              type: 'radio',
              required: true,
              options: [
                { label: '通用资源池', value: '通用资源池' },
                { label: '专用资源池', value: '专用资源池' }
              ]
            },
            {
              id: 'pool',
              name: 'pool',
              label: '资源池',
              type: 'select',
              required: true,
              options: [
                { label: 'shengzhaotest-A800', value: 'shengzhaotest-A800' }
              ]
            }
          ]
        },
        {
          id: 'dataset',
          title: '微调数据集',
          fields: [
            {
              id: 'dataset',
              name: 'dataset',
              label: '数据集选择',
              type: 'select',
              required: true,
              options: [
                { label: '金融领域问答集', value: 'finance-qa' },
                { label: '医疗领域问答集', value: 'medical-qa' },
                { label: '法律领域问答集', value: 'legal-qa' }
              ]
            },
            {
              id: 'customDataset',
              name: 'customDataset',
              label: '自定义数据集',
              type: 'upload',
              buttonText: '上传数据集',
              tip: '支持JSON、CSV、TXT格式，最大2GB'
            }
          ]
        },
        {
          id: 'params',
          title: '微调参数',
          fields: [
            {
              id: 'learningRate',
              name: 'learningRate',
              label: '学习率',
              type: 'number',
              min: 0.000001,
              max: 0.01,
              step: 0.000001,
              precision: 6,
              defaultValue: 0.00002
            },
            {
              id: 'epochs',
              name: 'epochs',
              label: '训练轮次',
              type: 'number',
              min: 1,
              max: 100,
              defaultValue: 3
            },
            {
              id: 'batchSize',
              name: 'batchSize',
              label: '批次大小',
              type: 'number',
              min: 1,
              max: 128,
              defaultValue: 8
            },
            {
              id: 'method',
              name: 'method',
              label: '训练方法',
              type: 'select',
              required: true,
              options: [
                { label: 'LoRA', value: 'lora' },
                { label: 'QLoRA', value: 'qlora' },
                { label: '全参数微调', value: 'full' }
              ]
            }
          ]
        },
        {
          id: 'advanced',
          title: '高级配置',
          fields: [
            {
              id: 'enableTensorboard',
              name: 'enableTensorboard',
              label: 'Tensorboard',
              type: 'switch',
              defaultValue: true,
              tooltip: '开启后，可以在任务详情页查看训练过程中的指标变化'
            },
            {
              id: 'autoEvaluate',
              name: 'autoEvaluate',
              label: '自动评估',
              type: 'switch',
              defaultValue: false,
              tooltip: '开启后，微调完成后将自动评估模型性能'
            }
          ]
        }
      ]
    }
  },
  {
    id: 3,
    tags: ['LLM', '推理'],
    category: 'LLM',
    subcategory: '推理',
    name: 'QwQ-32B',
    description: 'QwQ 是 Qwen 系列的推理模型，与传统的指令调优模型相比，具备思考和推理能力的 QwQ 在下游任务中，特别是在解决难题时，能够显著提高性能。QwQ-32B 是一个中等规模的推理模型，其性能...',
    updateDate: '2025-3-25更新',
    version: 'QwQ-32B',
    supportDeploy: true,
    actions: ['一键部署', '模型微调'],
    fineTuneFormDescriptor: {
      sections: [
        {
          id: 'basic',
          title: '基础信息',
          fields: [
            {
              id: 'taskName',
              name: 'taskName',
              label: '微调任务名称',
              type: 'text',
              required: true,
              placeholder: '请输入微调任务名称',
              tip: '支持小写字母、数字以及-，且开头必须是小写字母，结尾必须是小写字母或数字，长度1-50'
            },
            {
              id: 'poolType',
              name: 'poolType',
              label: '资源池类型',
              type: 'radio',
              required: true,
              options: [
                { label: '通用资源池', value: '通用资源池' },
                { label: '专用资源池', value: '专用资源池' }
              ]
            },
            {
              id: 'pool',
              name: 'pool',
              label: '资源池',
              type: 'select',
              required: true,
              options: [
                { label: 'shengzhaotest-A800', value: 'shengzhaotest-A800' }
              ]
            }
          ]
        },
        {
          id: 'dataset',
          title: '微调数据集',
          fields: [
            {
              id: 'dataset',
              name: 'dataset',
              label: '数据集选择',
              type: 'select',
              required: true,
              options: [
                { label: '金融领域问答集', value: 'finance-qa' },
                { label: '医疗领域问答集', value: 'medical-qa' },
                { label: '法律领域问答集', value: 'legal-qa' }
              ]
            },
            {
              id: 'customDataset',
              name: 'customDataset',
              label: '自定义数据集',
              type: 'upload',
              buttonText: '上传数据集',
              tip: '支持JSON、CSV、TXT格式，最大2GB'
            }
          ]
        },
        {
          id: 'params',
          title: '微调参数',
          fields: [
            {
              id: 'learningRate',
              name: 'learningRate',
              label: '学习率',
              type: 'number',
              min: 0.000001,
              max: 0.01,
              step: 0.000001,
              precision: 6,
              defaultValue: 0.00002
            },
            {
              id: 'epochs',
              name: 'epochs',
              label: '训练轮次',
              type: 'number',
              min: 1,
              max: 100,
              defaultValue: 3
            },
            {
              id: 'batchSize',
              name: 'batchSize',
              label: '批次大小',
              type: 'number',
              min: 1,
              max: 128,
              defaultValue: 8
            },
            {
              id: 'method',
              name: 'method',
              label: '训练方法',
              type: 'select',
              required: true,
              options: [
                { label: 'LoRA', value: 'lora' },
                { label: 'QLoRA', value: 'qlora' },
                { label: '全参数微调', value: 'full' }
              ]
            }
          ]
        },
        {
          id: 'advanced',
          title: '高级配置',
          fields: [
            {
              id: 'enableTensorboard',
              name: 'enableTensorboard',
              label: 'Tensorboard',
              type: 'switch',
              defaultValue: true,
              tooltip: '开启后，可以在任务详情页查看训练过程中的指标变化'
            },
            {
              id: 'autoEvaluate',
              name: 'autoEvaluate',
              label: '自动评估',
              type: 'switch',
              defaultValue: false,
              tooltip: '开启后，微调完成后将自动评估模型性能'
            }
          ]
        }
      ]
    }
  },
  {
    id: 4,
    tags: ['LLM', '推理'],
    category: 'LLM',
    subcategory: '推理',
    name: 'gemma-3-12b-it',
    description: 'Gemma 是来自 Google 的一系列轻量级、最先进的开放模型，基于用于创建 Gemini 模型的相同研究和技术构建。Gemma 3 模型是多模态的，处理文本和图像输入并生成文本输出，提供了预训练...',
    updateDate: '2025-3-25更新',
    version: 'gemma-3-12b-it',
    supportDeploy: true,
    actions: ['一键部署']
  },
  {
    id: 5,
    tags: ['LLM'],
    category: 'AI工具',
    subcategory: '模型权重转换',
    name: '模型权重转换',
    description: '将模型权重转换为其他格式，支持的HF转Megatron以及Megatron转HF。',
    updateDate: '2025-3-25更新',
    version: 'gemma-3-12b-it',
    supportDeploy: true,
    actions: ['运行任务'],
    jobFormDescriptor: {
      sections: [
        {
          id: 'basic',
          title: '基础信息',
          fields: [
            {
              id: 'taskName',
              name: 'taskName',
              label: '微调任务名称',
              type: 'text',
              required: true,
              placeholder: '请输入微调任务名称',
              tip: '支持小写字母、数字以及-，且开头必须是小写字母，结尾必须是小写字母或数字，长度1-50'
            },
            {
              id: 'poolType',
              name: 'poolType',
              label: '资源池类型',
              type: 'radio',
              required: true,
              options: [
                { label: '通用资源池', value: '通用资源池' },
                { label: '专用资源池', value: '专用资源池' }
              ]
            },
            {
              id: 'pool',
              name: 'pool',
              label: '资源池',
              type: 'select',
              required: true,
              options: [
                { label: 'shengzhaotest-A800', value: 'shengzhaotest-A800' }
              ]
            }
          ]
        },
        {
          id: 'dataset',
          title: '微调数据集',
          fields: [
            {
              id: 'dataset',
              name: 'dataset',
              label: '数据集选择',
              type: 'select',
              required: true,
              options: [
                { label: '金融领域问答集', value: 'finance-qa' },
                { label: '医疗领域问答集', value: 'medical-qa' },
                { label: '法律领域问答集', value: 'legal-qa' }
              ]
            },
            {
              id: 'customDataset',
              name: 'customDataset',
              label: '自定义数据集',
              type: 'upload',
              buttonText: '上传数据集',
              tip: '支持JSON、CSV、TXT格式，最大2GB'
            }
          ]
        },
        {
          id: 'params',
          title: '微调参数',
          fields: [
            {
              id: 'learningRate',
              name: 'learningRate',
              label: '学习率',
              type: 'number',
              min: 0.000001,
              max: 0.01,
              step: 0.000001,
              precision: 6,
              defaultValue: 0.00002
            },
            {
              id: 'epochs',
              name: 'epochs',
              label: '训练轮次',
              type: 'number',
              min: 1,
              max: 100,
              defaultValue: 3
            },
            {
              id: 'batchSize',
              name: 'batchSize',
              label: '批次大小',
              type: 'number',
              min: 1,
              max: 128,
              defaultValue: 8
            },
            {
              id: 'method',
              name: 'method',
              label: '训练方法',
              type: 'select',
              required: true,
              options: [
                { label: 'LoRA', value: 'lora' },
                { label: 'QLoRA', value: 'qlora' },
                { label: '全参数微调', value: 'full' }
              ]
            }
          ]
        },
        {
          id: 'advanced',
          title: '高级配置',
          fields: [
            {
              id: 'enableTensorboard',
              name: 'enableTensorboard',
              label: 'Tensorboard',
              type: 'switch',
              defaultValue: true,
              tooltip: '开启后，可以在任务详情页查看训练过程中的指标变化'
            },
            {
              id: 'autoEvaluate',
              name: 'autoEvaluate',
              label: '自动评估',
              type: 'switch',
              defaultValue: false,
              tooltip: '开启后，微调完成后将自动评估模型性能'
            }
          ]
        }
      ]
    }
  },
  {
    id: 6,
    tags: ['AI工具'],
    category: 'AI工具',
    subcategory: '数据预处理',
    name: '数据预处理',
    description: '对数据进行预处理，支持的预处理方式包括：数据清洗、数据转换、数据归一化、数据标准化等。',
    updateDate: '2025-3-25更新',
    version: 'gemma-3-12b-it',
    supportDeploy: true,
    actions: ['运行任务']
  },
  {
    id: 7,
    tags: ['AI工具'],
    category: 'AI工具',
    subcategory: '文件上传',
    name: '文件上传',
    description: '将本地文件上传到对象存储，本地存储可以是并行文件存储、本地盘、容量型存储等。',
    updateDate: '2025-3-25更新',
    version: 'gemma-3-12b-it',
    supportDeploy: true,
    actions: ['运行任务']
  },
  {
    id: 8,
    tags: ['AI工具'],
    category: 'AI工具',
    subcategory: '文件下载',
    name: '文件下载',
    description: '将对象存储中的数据下载到本地，本地存储可以是并行文件存储、本地盘、容量型存储等。',
    updateDate: '2025-3-25更新',
    version: 'gemma-3-12b-it',
    supportDeploy: true,
    actions: ['运行任务']
  },
  {
    id: 9,
    tags: ['AI工具'],
    category: 'AI工具',
    subcategory: '数据导出到对象存储',
    name: '数据导出到对象存储',
    description: '将数据导出到对象存储，本地存储可以是并行文件存储、本地盘、容量型存储等。',
    updateDate: '2025-3-25更新',
    version: 'gemma-3-12b-it',
    supportDeploy: true,
    actions: ['运行任务']
  }
]

/**
 * @swagger
 * /?action=DescribeApps:
 *   get:
 *     tags: ['应用']
 *     summary: 获取应用列表
 *     description: 获取应用列表
 *     parameters:
 *       - in: header
 *         name: token
 *         schema:
 *           type: string
 *         required: false
 *         description: "授权信息,authorization/token/x-api-key三选一, 格式: Bearer ak|sk|region,区域,可选值: bj, gz, su, bd, fwh, yq"
 *       - in: header
 *         name: authorization
 *         schema:
 *           type: string
 *         required: false
 *         description: "授权信息,authorization/token/x-api-key三选一, 格式: Bearer ak|sk|region,区域,可选值: bj, gz, su, bd, fwh, yq"
 *       - in: header
 *         name: x-api-key
 *         schema:
 *           type: string
 *         required: false
 *         description: "自定义授权信息，authorization/token/x-api-key三选一, 格式: ak|sk|region,区域,可选值: bj, gz, su, bd, fwh, yq"
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: number
 *         required: false
 *         default: 100
 *         description: 每页数量
 *       - in: query
 *         name: pageNumber
 *         schema:
 *           type: number
 *         required: false
 *         default: 1
 *         description: 页码
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *         required: false
 *         default: createdAt
 *         description: "排序字段, 可选值: createdAt, name, status"
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *         required: false
 *         default: desc
 *         description: "排序方向, 可选值: asc, desc"
 *     responses:
 *       200:
 *         description: 成功获取任务列表
 *       500:
 *         description: 服务器错误
 */
const DescribeApps = async (req: Request, res: Response) => {
  const { resourcePoolId, pageSize, pageNumber, orderBy, order } = req.query;

  const aihcQuery = {
    resourcePoolId,
    pageSize: pageSize || 100,
    pageNo: pageNumber || 1,
    orderBy: orderBy || 'createdAt',
    order: order || 'desc'
  };

  try {
    const responseData = {
      requestId: uuidv4(),
      apps: apps,
      totalCount: apps.length,
      pageSize: 100,
      pageNumber: 1,
      orderBy: 'createdAt',
      order: 'desc'
    }

    res.json(responseData);
  } catch (err: any) {
    res.status(err.statusCode).json(err.error);
  }
}

/**
 * @swagger
 * /?action=DescribeApp:
 *   get:
 *     tags: ['应用']
 *     summary: 获取应用详情
 *     description: 获取指定应用的详情
 *     parameters:
 *       - in: header
 *         name: token
 *         schema:
 *           type: string
 *         required: false
 *         description: "授权信息,authorization/token/x-api-key三选一, 格式: Bearer ak|sk|region,区域,可选值: bj, gz, su, bd, fwh, yq"
 *       - in: header
 *         name: authorization
 *         schema:
 *           type: string
 *         required: false
 *         description: "授权信息,authorization/token/x-api-key三选一, 格式: Bearer ak|sk|region,区域,可选值: bj, gz, su, bd, fwh, yq"
 *       - in: header
 *         name: x-api-key
 *         schema:
 *           type: string
 *         required: false
 *         description: "自定义授权信息，authorization/token/x-api-key三选一, 格式: ak|sk|region,区域,可选值: bj, gz, su, bd, fwh, yq"
 *       - in: query
 *         name: appId
 *         schema:
 *           type: string
 *         required: true
 *         description: 应用ID
 *     responses:
 *       200:
 *         description: 成功获取应用详情
 *       500:
 *         description: 服务器错误
 */
const DescribeApp = async (req: Request, res: Response) => {
  const { method, params, query, body, headers, url, baseUrl, originalUrl } = req;

  const aihcQuery = {
    appId: query.appId,
  };

  const app = apps.find(app => app.id === parseInt(query.appId as string));
  if (!app) {
    return res.status(404).json({
      requestId: uuidv4(),
      error: '应用不存在'
    });
  }
  try {
    const responseData = {
      requestId: uuidv4(),
      ...app
    }

    res.json(responseData);
  } catch (err: any) {
    res.status(err.statusCode || 500).json(err.error);
  }
}


export default router;

export {
  DescribeApps,
  DescribeApp,
};