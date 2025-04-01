<template>
  <div class="example-container">
    <div class="page-header">
      <h1>动态表单示例</h1>
      <p class="subtitle">选择表单类型进行操作</p>
    </div>
    
    <el-row :gutter="24">
      <el-col :xs="24" :sm="12" :md="8" v-for="(item, index) in formCards" :key="index" style="margin-bottom: 20px;">
        <el-card class="form-card" :body-style="{ padding: '0' }" shadow="hover">
          <div class="card-content">
            <div class="card-icon">
              <el-icon :size="32"><component :is="item.icon" /></el-icon>
            </div>
            <div class="card-info">
              <h3>{{ item.title }}</h3>
              <p v-if="item.description">{{ item.description }}</p>
            </div>
            <div class="card-action">
              <el-button type="primary" @click="item.action">打开</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row class="result-row" v-if="formResult">
      <el-col :span="24">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <h3>表单提交结果</h3>
              <el-button type="text" @click="clearResult">清除</el-button>
            </div>
          </template>
          <pre>{{ formResult }}</pre>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 动态表单抽屉 -->
    <DynamicFormDrawer
      v-model:visible="drawerVisible"
      :title="drawerTitle"
      :form-descriptor="activeFormDescriptor"
      :init-data="formInitData"
      @submit="handleFormSubmit"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import DynamicFormDrawer from './DynamicFormDrawer.vue'
import { Document, Edit, Download, Upload, Connection, DataAnalysis, Share } from '@element-plus/icons-vue'

// 表单可见性控制
const drawerVisible = ref(false)
const drawerTitle = ref('动态表单')
const activeFormDescriptor = ref(null)
const formInitData = ref({})
const formResult = ref(null)

// 清除结果
const clearResult = () => {
  formResult.value = null
}

// 基本表单描述
const basicFormDescriptor = {
  sections: [
    {
      id: 'basic',
      title: '基础信息',
      fields: [
        {
          id: 'name',
          name: 'name',
          label: '任务名称',
          type: 'text',
          required: true,
          placeholder: '请输入任务名称',
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
            { label: '托管资源池', value: '托管资源池' }
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
      id: 'resource',
      title: '资源配置',
      fields: [
        {
          id: 'instanceCount',
          name: 'instanceCount',
          label: '实例数',
          type: 'number',
          required: true,
          min: 1,
          max: 100,
          defaultValue: 1
        },
        {
          id: 'enableGpu',
          name: 'enableGpu',
          label: '加速芯片申请',
          type: 'switch',
          defaultValue: false
        },
        {
          id: 'gpuType',
          name: 'gpuType',
          label: '加速芯片类型',
          type: 'select',
          options: [
            { label: '不限制', value: 'unlimited' }
          ],
          disabled: (formData) => !formData.enableGpu
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
          defaultValue: false,
          tooltip: '开启后，可以在任务详情页查看训练过程中的指标变化'
        },
        {
          id: 'autoDelete',
          name: 'autoDelete',
          label: '自动删除',
          type: 'switch',
          defaultValue: false,
          tooltip: '开启后，仅针对于成功/失败状态的任务生效，您可以自定义配置保留时长'
        }
      ]
    }
  ]
}

// 微调表单描述
const fineTuneFormDescriptor = {
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

// 下载数据表单描述
const downloadDataFormDescriptor = {
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
          visible: (formData) => formData.source === 'publicCkpt'
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
          visible: (formData) => formData.source === 'publicDataset'
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
          visible: (formData) => formData.source === 'publicCkpt'
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
          visible: (formData) => formData.source === 'publicDataset'
        },
        {
          id: 'downloadUrl',
          name: 'downloadUrl',
          label: '下载地址',
          type: 'text',
          required: true,
          placeholder: '请输入URL，以bos:/开头',
          disabled: (formData) => formData.source !== 'custom'
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
}

// 上传文件表单描述
const uploadFileFormDescriptor = {
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
}

// 模型转换与切分表单描述
const modelConversionFormDescriptor = {
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
}

// 数据预处理表单描述
const dataPreprocessingFormDescriptor = {
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
}

// 数据导出表单描述
const dataExportFormDescriptor = {
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
}

// 显示基本表单
const showBasicForm = () => {
  drawerTitle.value = '创建任务'
  activeFormDescriptor.value = basicFormDescriptor
  formInitData.value = {
    name: 'task-' + Date.now().toString().slice(-6)
  }
  drawerVisible.value = true
}

// 显示微调表单
const showFineTuneForm = () => {
  drawerTitle.value = '模型微调'
  activeFormDescriptor.value = fineTuneFormDescriptor
  formInitData.value = {
    taskName: '微调-' + Date.now().toString().slice(-6),
    method: 'lora'
  }
  drawerVisible.value = true
}

// 显示下载数据表单
const showDownloadDataForm = () => {
  drawerTitle.value = '下载数据'
  activeFormDescriptor.value = downloadDataFormDescriptor
  formInitData.value = {}
  drawerVisible.value = true
}

// 显示上传文件表单
const showUploadFileForm = () => {
  drawerTitle.value = '数据上传'
  activeFormDescriptor.value = uploadFileFormDescriptor
  formInitData.value = {}
  drawerVisible.value = true
}

// 显示数据预处理表单
const showDataPreprocessingForm = () => {
  drawerTitle.value = '数据预处理'
  activeFormDescriptor.value = dataPreprocessingFormDescriptor
  formInitData.value = {
    dataSource: 'localFile',
    dataFormat: 'json',
    tokenizer: 'tiktoken',
    maxLength: 2048,
    operations: ['normalization'],
    splitRatio: 80,
    outputFormat: 'jsonl',
    compression: 'none'
  }
  drawerVisible.value = true
}

// 显示模型转换表单
const showModelConversionForm = () => {
  drawerTitle.value = '权重转换与切分'
  activeFormDescriptor.value = modelConversionFormDescriptor
  formInitData.value = {
    convertType: 'hf2mc',
    modelName: 'llama2-7b',
    tp: 1,
    pp: 1
  }
  drawerVisible.value = true
}

// 显示数据导出表单
const showDataExportForm = () => {
  drawerTitle.value = '数据导出'
  activeFormDescriptor.value = dataExportFormDescriptor
  formInitData.value = {}
  drawerVisible.value = true
}

// 处理表单提交
const handleFormSubmit = (data) => {
  formResult.value = JSON.stringify(data, null, 2)
  console.log('表单提交:', data)
}

// 表单卡片配置 - 移到函数定义之后
const formCards = [
  {
    title: '基本表单',
    description: '创建一个基础任务',
    icon: Document,
    action: showBasicForm
  },
  {
    title: '微调表单',
    description: '配置模型微调参数',
    icon: Edit,
    action: showFineTuneForm
  },
  {
    title: '下载数据',
    description: '从远程下载数据和模型',
    icon: Download,
    action: showDownloadDataForm
  },
  {
    title: '上传文件',
    description: '上传本地文件到服务器',
    icon: Upload,
    action: showUploadFileForm
  },
  {
    title: '模型转换与切分',
    description: '转换模型格式和切分模型',
    icon: Connection,
    action: showModelConversionForm
  },
  {
    title: '数据预处理',
    description: '对训练数据进行预处理操作',
    icon: DataAnalysis,
    action: showDataPreprocessingForm
  },
  {
    title: '数据导出',
    description: '导出数据到对象存储',
    icon: Share,
    action: showDataExportForm
  }
]
</script>

<style scoped>
.example-container {
  padding: 24px;
  max-width: 1280px;
  margin: 0 auto;
  text-align: left;
}

.page-header {
  margin-bottom: 32px;
  text-align: center;
}

.page-header h1 {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.subtitle {
  color: #606266;
  font-size: 16px;
  margin: 0;
}

.form-card {
  margin-bottom: 24px;
  height: 100%;
  transition: all 0.3s;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f5f7fa;
  border: 1px solid #e0e0e0;
}

.card-content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 180px;
}

.card-icon {
  margin-bottom: 16px;
  color: #409EFF;
}

.card-info {
  flex: 1;
}

.card-info h3 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.card-info p {
  margin: 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.4;
}

.card-action {
  margin-top: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.result-row {
  margin-top: 40px;
}

pre {
  background-color: #f5f7fa;
  padding: 16px;
  border-radius: 6px;
  font-family: "Courier New", Courier, monospace;
  white-space: pre-wrap;
  overflow-x: auto;
  font-size: 14px;
  color: #303133;
  max-height: 400px;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .page-header {
    margin-bottom: 24px;
  }
  
  .page-header h1 {
    font-size: 24px;
  }
  
  .subtitle {
    font-size: 14px;
  }
  
  .card-content {
    padding: 16px;
    min-height: 160px;
  }
}
</style> 