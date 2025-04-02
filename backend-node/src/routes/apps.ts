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
    tags: ['AI工具'],
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
          title: '基本信息',
          fields: [
            {
              id: 'convertType',
              name: 'convertType',
              label: '类型',
              type: 'radio',
              defaultValue: 'hf2mc',
              options: [
                { label: 'hf-mcore', value: 'hf2mc' },
                { label: 'mcore-hf', value: 'mc2hf' }
              ]
            },
            {
              id: 'modelName',
              name: 'modelName',
              label: '模型名称',
              type: 'select',
              required: true,
              defaultValue: 'llama2-7b',
              options: [
                { label: 'llama2-7b', value: 'llama2-7b' },
                { label: 'llama2-13b', value: 'llama2-13b' },
                { label: 'llama2-70b', value: 'llama2-70b' },
                { label: 'llama3-8b', value: 'llama3-8b' },
                { label: 'llama3-70b', value: 'llama3-70b' },
                { label: 'qwen2-0.5b', value: 'qwen2-0.5b' },
                { label: 'qwen2-1.5b', value: 'qwen2-1.5b' },
                { label: 'qwen2-7b', value: 'qwen2-7b' },
                { label: 'qwen2-72b', value: 'qwen2-72b' }
              ]
            }
          ]
        },
        {
          id: 'tensorParallel',
          title: '模型切分配置',
          fields: [
            {
              id: 'tp',
              name: 'tp',
              label: 'TP',
              type: 'number',
              required: true,
              defaultValue: 1,
              min: 1,
              placeholder: '请输入 TP 值，必须为正整数'
            },
            {
              id: 'pp',
              name: 'pp',
              label: 'PP',
              type: 'number',
              required: true,
              defaultValue: 1,
              min: 1,
              placeholder: '请输入 PP 值，必须为正整数'
            }
          ]
        },
        {
          id: 'paths',
          title: '路径配置',
          fields: [
            {
              id: 'sourcePath',
              name: 'sourcePath',
              label: '原始权重路径',
              type: 'text',
              required: true,
              placeholder: '请输入原始权重路径'
            },
            {
              id: 'savePath',
              name: 'savePath',
              label: '保存路径',
              type: 'text',
              required: true,
              placeholder: '请输入保存路径'
            }
          ]
        }
      ]
    },
    formInitData: {
      convertType: 'hf2mc',
      modelName: 'llama2-7b',
      tp: 1,
      pp: 1,
      sourcePath: '',
      savePath: ''
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
    actions: ['运行任务'],
    jobFormDescriptor: {
      sections: [
        {
          id: 'inputData',
          title: '输入数据',
          fields: [
            {
              id: 'dataSource',
              name: 'dataSource',
              label: '数据来源',
              type: 'radio',
              defaultValue: 'localFile',
              options: [
                { label: '本地文件', value: 'localFile' },
                { label: '远程数据集', value: 'remoteDataset' }
              ]
            },
            {
              id: 'inputPath',
              name: 'inputPath',
              label: '输入路径',
              type: 'text',
              required: true,
              placeholder: '请输入数据路径'
            },
            {
              id: 'dataFormat',
              name: 'dataFormat',
              label: '数据格式',
              type: 'select',
              defaultValue: 'json',
              options: [
                { label: 'JSON', value: 'json' },
                { label: 'CSV', value: 'csv' },
                { label: 'TXT', value: 'txt' },
                { label: 'JSONL', value: 'jsonl' }
              ]
            }
          ]
        },
        {
          id: 'preprocessingOptions',
          title: '预处理选项',
          fields: [
            {
              id: 'tokenizer',
              name: 'tokenizer',
              label: '分词器',
              type: 'select',
              defaultValue: 'tiktoken',
              options: [
                { label: 'TikToken', value: 'tiktoken' },
                { label: 'SentencePiece', value: 'sentencepiece' },
                { label: 'WordPiece', value: 'wordpiece' },
                { label: 'BPE', value: 'bpe' }
              ]
            },
            {
              id: 'maxLength',
              name: 'maxLength',
              label: '最大长度',
              type: 'number',
              defaultValue: 2048,
              min: 128,
              max: 8192,
              step: 1
            },
            {
              id: 'operations',
              name: 'operations',
              label: '预处理操作',
              type: 'checkbox',
              options: [
                { label: '去除重复', value: 'deduplication' },
                { label: '规范化', value: 'normalization' },
                { label: '过滤短文本', value: 'filterShort' },
                { label: '打乱数据', value: 'shuffle' }
              ],
              defaultValue: ['normalization']
            },
            {
              id: 'splitRatio',
              name: 'splitRatio',
              label: '训练集比例',
              type: 'slider',
              defaultValue: 80,
              min: 50,
              max: 95,
              step: 5,
              tooltip: '训练集与验证集分割比例'
            }
          ]
        },
        {
          id: 'outputOptions',
          title: '输出选项',
          fields: [
            {
              id: 'outputPath',
              name: 'outputPath',
              label: '输出路径',
              type: 'text',
              required: true,
              placeholder: '请输入处理后数据保存路径'
            },
            {
              id: 'outputFormat',
              name: 'outputFormat',
              label: '输出格式',
              type: 'select',
              defaultValue: 'jsonl',
              options: [
                { label: 'JSONL', value: 'jsonl' },
                { label: 'Binary', value: 'binary' },
                { label: 'Arrow', value: 'arrow' },
                { label: 'Parquet', value: 'parquet' }
              ]
            },
            {
              id: 'compression',
              name: 'compression',
              label: '压缩方式',
              type: 'select',
              defaultValue: 'none',
              options: [
                { label: '不压缩', value: 'none' },
                { label: 'GZIP', value: 'gzip' },
                { label: 'ZSTD', value: 'zstd' },
                { label: 'LZ4', value: 'lz4' }
              ]
            }
          ]
        }
      ]
    },
    formInitData: {
      dataSource: 'localFile',
      inputPath: '',
      dataFormat: 'json',
      tokenizer: 'tiktoken',
      maxLength: 2048,
      operations: ['normalization'],
      splitRatio: 80,
      outputPath: '',
      outputFormat: 'jsonl',
      compression: 'none'
    }
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
    actions: ['运行任务'],
    jobFormDescriptor: {
      sections: [
        {
          id: 'upload',
          title: '上传信息',
          fields: [
            {
              id: 'data',
              name: 'data',
              label: '文件',
              type: 'upload',
              required: true,
              buttonText: '选择文件',
              tip: '选择要上传的文件，建议小于10M'
            },
            {
              id: 'savePath',
              name: 'savePath',
              label: '保存路径',
              type: 'text',
              required: true,
              placeholder: '请选择保存路径'
            }
          ]
        }
      ]
    },
    formInitData: {
      data: '',
      savePath: ''
    }
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
    actions: ['运行任务'],
    jobFormDescriptor: {
      sections: [
        {
          id: 'source',
          title: '数据来源',
          fields: [
            {
              id: 'source',
              name: 'source',
              label: '来源',
              type: 'radio',
              defaultValue: 'custom',
              options: [
                { label: '自定义', value: 'custom' },
                { label: '公共权重', value: 'publicCkpt' },
                { label: '公共数据集', value: 'publicDataset' }
              ]
            }
          ]
        },
        {
          id: 'details',
          title: '下载详情',
          fields: [
            {
              id: 'ckptFormat',
              name: 'ckptFormat',
              label: '模型格式',
              type: 'select',
              defaultValue: 'HF',
              options: [
                { label: 'HF', value: 'HF' },
                { label: 'MCore', value: 'MCore' }
              ],
              visible: (formData: { source: string; }) => formData.source === 'publicCkpt'
            },
            {
              id: 'datasetFormat',
              name: 'datasetFormat',
              label: '数据格式',
              type: 'select',
              defaultValue: '原始数据',
              options: [
                { label: '原始数据', value: '原始数据' },
                { label: '预处理数据', value: '预处理数据' }
              ],
              visible: (formData: { source: string; }) => formData.source === 'publicDataset'
            },
            {
              id: 'name',
              name: 'name',
              label: '模型',
              type: 'select',
              defaultValue: 'llama2-7b',
              options: [
                { label: 'llama2-7b', value: 'llama2-7b' },
                { label: 'llama2-13b', value: 'llama2-13b' },
                { label: 'llama2-70b', value: 'llama2-70b' },
                { label: 'llama3-8b', value: 'llama3-8b' },
                { label: 'llama3-70b', value: 'llama3-70b' },
                { label: 'qwen2-0.5b', value: 'qwen2-0.5b' },
                { label: 'qwen2-1.5b', value: 'qwen2-1.5b' },
                { label: 'qwen2-7b', value: 'qwen2-7b' },
                { label: 'qwen2-72b', value: 'qwen2-72b' }
              ],
              visible: (formData: { source: string; }) => formData.source === 'publicCkpt'
            },
            {
              id: 'name',
              name: 'name',
              label: '数据集',
              type: 'select',
              defaultValue: 'alpaca_zh-llama3-train',
              options: [
                { label: 'alpaca_zh-llama3-train', value: 'alpaca_zh-llama3-train' },
                { label: 'alpaca_zh-llama3-valid', value: 'alpaca_zh-llama3-valid' },
                { label: 'pile_llama_test', value: 'pile_llama_test' },
                { label: 'WuDaoCorpus2.0_base_sample', value: 'WuDaoCorpus2.0_base_sample' }
              ],
              visible: (formData: { source: string; }) => formData.source === 'publicDataset'
            },
            {
              id: 'downloadUrl',
              name: 'downloadUrl',
              label: '下载地址',
              type: 'text',
              required: true,
              placeholder: '请输入URL，以bos:/开头',
              disabled: (formData: { source: string; }) => formData.source !== 'custom'
            },
            {
              id: 'savePath',
              name: 'savePath',
              label: '保存路径',
              type: 'text',
              required: true,
              placeholder: '请选择保存路径'
            }
          ]
        }
      ]
    },
    formInitData: {
      source: 'custom',
      ckptFormat: 'HF',
      datasetFormat: '原始数据',
      name: 'llama2-7b',
      downloadUrl: '',
      savePath: ''
    }
  },
  {
    id: 9,
    tags: ['AI工具'],
    category: 'AI工具',
    subcategory: '数据导出',
    name: '数据导出',
    description: '将数据导出到对象存储，本地存储可以是并行文件存储、本地盘、容量型存储等。',
    updateDate: '2025-3-25更新',
    version: 'gemma-3-12b-it',
    supportDeploy: true,
    actions: ['运行任务'],
    jobFormDescriptor: {
      sections: [
        {
          id: 'source',
          title: '源数据信息',
          fields: [
            {
              id: 'sourcePath',
              name: 'sourcePath',
              label: '文件夹路径',
              type: 'text',
              required: true,
              placeholder: '请选择文件夹路径'
            }
          ]
        },
        {
          id: 'credentials',
          title: '认证信息',
          fields: [
            {
              id: 'ak',
              name: 'ak',
              label: 'AK',
              type: 'text',
              required: true,
              placeholder: '请输入ak'
            },
            {
              id: 'sk',
              name: 'sk',
              label: 'SK',
              type: 'text',
              required: true,
              placeholder: '请输入sk'
            }
          ]
        },
        {
          id: 'destination',
          title: '目标存储',
          fields: [
            {
              id: 'bucket',
              name: 'bucket',
              label: '存储桶',
              type: 'select',
              required: true,
              placeholder: '请选择存储桶',
              options: [
                { label: 'llama2-7b', value: 'llama2-7b' },
                { label: 'llama2-13b', value: 'llama2-13b' },
                { label: 'llama2-70b', value: 'llama2-70b' },
                { label: 'llama3-8b', value: 'llama3-8b' },
                { label: 'llama3-70b', value: 'llama3-70b' },
                { label: 'qwen2-0.5b', value: 'qwen2-0.5b' },
                { label: 'qwen2-1.5b', value: 'qwen2-1.5b' },
                { label: 'qwen2-7b', value: 'qwen2-7b' },
                { label: 'qwen2-72b', value: 'qwen2-72b' },
                { label: 'baichuan2-7b', value: 'baichuan2-7b' },
                { label: 'baichuan2-13b', value: 'baichuan2-13b' },
                { label: 'qwen-1.8b', value: 'qwen-1.8b' },
                { label: 'qwen-7b', value: 'qwen-7b' },
                { label: 'qwen-14b', value: 'qwen-14b' },
                { label: 'qwen-72b', value: 'qwen-72b' }
              ]
            },
            {
              id: 'storagePath',
              name: 'storagePath',
              label: '存储路径',
              type: 'text',
              required: true,
              placeholder: '请输入存储路径'
            }
          ]
        }
      ]
    },
    formInitData: {
      sourcePath: '',
      ak: '',
      sk: '',
      bucket: '',
      storagePath: ''
    }
  }
]

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

const DescribeAppTags = async (req: Request, res: Response) => {
  const tags = apps.map(app => app.tags).flat();
  const uniqueTags = [...new Set(tags)];
  const responseData = {
    requestId: uuidv4(),
    tags: uniqueTags
  }
  console.log(responseData);
  return responseData;
}


export default router;

export {
  DescribeApps,
  DescribeApp,
  DescribeAppTags
};