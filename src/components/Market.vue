<template>
    <div class="market-container">
      <!-- 顶部描述 -->
      <el-card class="description-card">
        <h1>应用市场</h1>
        <p class="subtitle">一站式模型实践共享与部署平台，支持开发者快速试用多样化预训练模型，加速智能应用创新落地</p>
      </el-card>
  
      <!-- 标签列表 -->
      <div class="tag-list">
        <el-tag
          v-for="tag in tags"
          :key="tag"
          class="tag-item"
          :type="activeTag === tag ? '' : 'info'"
          @click="handleTagClick(tag)"
          effect="plain"
        >
          {{ tag }}
        </el-tag>
      </div>
  
      <!-- 搜索和筛选区域 -->
      <el-row class="search-area" justify="space-between" align="middle">
        <el-col :span="12" style="text-align: left;">
          <el-checkbox v-model="supportDeploy">支持开发机调试</el-checkbox>
          <el-checkbox v-model="supportOneClick" class="ml-4">支持一键部署</el-checkbox>
        </el-col>
        <el-col :span="8">
          <el-input
            v-model="searchQuery"
            placeholder="通过模型名称搜索"
            :prefix-icon="Search"
            clearable
          />
        </el-col>
      </el-row>
  
      <!-- 模型卡片列表 -->
      <el-row :gutter="20" class="model-grid">
        <el-col 
          v-for="model in filteredModels" 
          :key="model.id" 
          :xs="24" 
          :sm="12" 
          :md="8" 
          :lg="8"
          style="margin-bottom: 24px;"
        >
          <el-card class="model-card" shadow="hover">
            <div class="model-tags">
              <el-tag size="small" type="success">{{ model.category }}</el-tag>
              <el-tag size="small" type="info" v-if="model.subcategory">{{ model.subcategory }}</el-tag>
            </div>
            <h2 class="model-title">{{ model.name }}</h2>
            <p class="model-description">{{ model.description }}</p>
            <div class="model-footer">
              <div class="model-meta">
                <el-text type="info" size="small">{{ model.updateDate }}</el-text>
                <el-text type="info" size="small" class="ml-4">{{ model.version }}</el-text>
              </div>
              <el-button 
                v-if="model.supportDeploy" 
                type="primary" 
                size="small"
                @click="handleDeploy(model)"
              >
                一键部署
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 添加抽屉组件 -->
      <el-drawer
        v-model="drawerVisible"
        title="创建任务"
        size="50%"
        :destroy-on-close="true"
      >
        <template #header>
          <h4 class="drawer-title">创建任务</h4>
        </template>
        <div class="deploy-info">
          <el-form 
            ref="formRef"
            :model="deployForm"
            label-width="120px"
            class="deploy-form"
          >
            <!-- 基础信息 -->
            <div class="form-section">
              <div class="section-title">基础信息</div>
              <el-form-item label="任务名称" required>
                <el-input v-model="deployForm.taskName" placeholder="请输入任务名称" />
                <div class="form-tip">支持小写字母、数字以及-，且开头必须是小写字母，结尾必须是小写字母或数字，长度1-50</div>
              </el-form-item>
              <el-form-item label="资源池类型">
                <el-radio-group v-model="deployForm.poolType">
                  <el-radio label="通用资源池">通用资源池</el-radio>
                  <el-radio label="托管资源池">托管资源池</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="资源池">
                <el-select v-model="deployForm.pool" placeholder="请选择资源池">
                  <el-option label="shengzhaotest-A800" value="shengzhaotest-A800" />
                </el-select>
              </el-form-item>
              <el-form-item label="队列">
                <el-select v-model="deployForm.queue" placeholder="请选择队列">
                  <el-option label="中" value="middle" />
                </el-select>
                <div class="form-tip">必填项</div>
              </el-form-item>
              <el-form-item label="优先级">
                <el-select v-model="deployForm.priority" placeholder="请选择优先级">
                  <el-option label="中" value="middle" />
                </el-select>
              </el-form-item>
              <el-form-item label="训练框架">
                <el-select v-model="deployForm.framework" placeholder="请选择训练框架">
                  <el-option label="PyTorch" value="pytorch" />
                </el-select>
              </el-form-item>
            </div>

            <!-- 环境配置 -->
            <div class="form-section">
              <div class="section-title">环境配置</div>
              <el-form-item label="镜像地址">
                <el-input v-model="deployForm.imageUrl" placeholder="请输入镜像地址" />
                <div class="form-tip">若需私有镜像仓库授权码，请输入账号密码</div>
              </el-form-item>
              <el-form-item label="执行命令">
                <el-input
                  v-model="deployForm.command"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入执行命令"
                />
              </el-form-item>
            </div>

            <!-- 在环境配置部分后添加新的表单部分 -->
            <div class="form-section">
              <div class="section-title">资源配置</div>
              <el-form-item label="实例数" required>
                <el-input-number v-model="deployForm.instanceCount" :min="1" :max="100" />
              </el-form-item>
              
              <el-form-item label="加速芯片申请">
                <el-switch v-model="deployForm.enableGpu" />
              </el-form-item>
              
              <el-form-item label="加速芯片类型" v-if="deployForm.enableGpu">
                <el-select v-model="deployForm.gpuType" placeholder="请输入加速芯片类型">
                  <el-option label="不限制" value="unlimited" />
                </el-select>
              </el-form-item>
              
              <el-form-item label="每实例加速芯片数" v-if="deployForm.enableGpu" required>
                <el-input-number v-model="deployForm.gpuPerInstance" :min="1" :max="8" />
              </el-form-item>
              
              <el-form-item label="CPU">
                <el-input-number v-model="deployForm.cpu" placeholder="不限制" />
                <div class="form-tip">核</div>
              </el-form-item>
              
              <el-form-item label="内存">
                <el-input-number v-model="deployForm.memory" placeholder="不限制" />
                <div class="form-tip">GiB</div>
              </el-form-item>
              
              <el-form-item label="共享内存">
                <el-input-number v-model="deployForm.sharedMemory" :min="1" />
                <div class="form-tip">GiB</div>
              </el-form-item>
              
              <el-form-item label="RDMA">
                <el-switch v-model="deployForm.enableRdma" />
                <div class="form-tip">开启后系统将自动调度任务到支持RDMA的节点上</div>
              </el-form-item>
            </div>

            <div class="form-section">
              <div class="section-title">设置数据源</div>
              <el-form-item label="存储类型">
                <el-button type="primary" plain @click="handleAddStorage">
                  <el-icon><Plus /></el-icon> 添加
                </el-button>
              </el-form-item>
            </div>

            <!-- 在设置数据源部分后添加新的表单部分 -->
            <div class="form-section">
              <div class="section-title">容错&诊断</div>
              <el-form-item label="容错">
                <el-switch v-model="deployForm.enableFaultTolerance" />
                <el-button 
                  type="primary" 
                  link 
                  v-if="deployForm.enableFaultTolerance"
                  @click="handleConfigFaultTolerance"
                >
                  修改配置
                </el-button>
              </el-form-item>
            </div>

            <div class="form-section">
              <div class="section-title">高级配置</div>
              <el-form-item label="Tensorboard">
                <el-switch v-model="deployForm.enableTensorboard" />
                <el-tooltip
                  content="开启后，可以在任务详情页查看训练过程中的指标变化"
                  placement="top"
                >
                  <el-icon class="info-icon"><InfoFilled /></el-icon>
                </el-tooltip>
              </el-form-item>

              <el-form-item label="自动删除">
                <el-switch v-model="deployForm.autoDelete" />
                <el-tooltip
                  content="开启后，仅针对于成功/失败状态的任务生效，您可以自定义配置保留时长"
                  placement="top"
                >
                  <el-icon class="info-icon"><InfoFilled /></el-icon>
                </el-tooltip>
              </el-form-item>

              <el-form-item label="告警">
                <el-switch v-model="deployForm.enableAlerts" />
              </el-form-item>

              <el-form-item label="定时提交">
                <el-switch v-model="deployForm.enableScheduledSubmit" />
                <el-tooltip
                  content="可选择在指定时间提交训练任务"
                  placement="top"
                >
                  <el-icon class="info-icon"><InfoFilled /></el-icon>
                </el-tooltip>
              </el-form-item>
            </div>

            <!-- 操作按钮 -->
            <div class="form-actions">
              <el-button @click="drawerVisible = false">取消</el-button>
              <el-button type="primary" @click="submitForm">完成</el-button>
            </div>
          </el-form>
        </div>
      </el-drawer>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { Search, Plus, InfoFilled } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  
  const tags = [
    'DeepSeek',
    'LLM',
    'veTuner',
    'Distill',
    'Megatron',
    '量化',
    'Ray',
    '科学计算',
    '自动驾驶',
    'FineTune',
    'ViT',
    'verl',
    '强化学习',
    'Audio',
    'Text-to-Video',
    'VLM'
  ]
  
  const activeTag = ref('')
  const supportDeploy = ref(false)
  const supportOneClick = ref(false)
  const searchQuery = ref('')
  
  const models = ref([
    {
      id: 1,
      category: 'DeepSeek',
      subcategory: 'LLM',
      name: 'DeepSeek-R1',
      description: 'DeepSeek推出的第一代推理模型 DeepSeek-R1-Zero 和 DeepSeek-R1。DeepSeek-R1-Zero 是一种通过大规模化学习 (RL) 训练的模型，先需监督微调 (SFT) 作为初步步骤，在推理方面表现...',
      updateDate: '2025-3-25更新',
      version: 'DeepSeek-R1',
      supportDeploy: true
    },
    {
      id: 2,
      category: 'LLM',
      name: 'gemma-3-27b-it',
      description: 'Gemma 是来自 Google 的一系列轻量级、最先进的开放模型，基于用于创建 Gemini 模型的相同研究和技术构建。Gemma 3 模型是多模态的，处理文本和图像输入并生成文本输出，提供了预训练...',
      updateDate: '2025-3-25更新',
      version: 'gemma-3-27b-it',
      supportDeploy: true
    },
    {
      id: 3,
      category: 'LLM',
      name: 'QwQ-32B',
      description: 'QwQ 是 Qwen 系列的推理模型，与传统的指令调优模型相比，具备思考和推理能力的 QwQ 在下游任务中，特别是在解决难题时，能够显著提高性能。QwQ-32B 是一个中等规模的推理模型，其性能...',
      updateDate: '2025-3-25更新',
      version: 'QwQ-32B',
      supportDeploy: true
    },
    {
      id: 4,
      category: 'LLM',
      name: 'gemma-3-12b-it',
      description: 'Gemma 是来自 Google 的一系列轻量级、最先进的开放模型，基于用于创建 Gemini 模型的相同研究和技术构建。Gemma 3 模型是多模态的，处理文本和图像输入并生成文本输出，提供了预训练...',
      updateDate: '2025-3-25更新',
      version: 'gemma-3-12b-it',
      supportDeploy: true
    }
  ])
  
  const drawerVisible = ref(false)
  const selectedModel = ref(null)
  
  const deployForm = ref({
    taskName: '',
    poolType: '通用资源池',
    pool: 'shengzhaotest-A800',
    queue: '中',
    priority: '中',
    framework: 'PyTorch',
    image: '',
    createType: 'self',
    imageUrl: '',
    command: '',
    instanceCount: 1,
    enableGpu: false,
    gpuType: '',
    gpuPerInstance: 1,
    cpu: null,
    memory: null,
    sharedMemory: 10,
    enableRdma: false,
    enableFaultTolerance: false,
    enableTensorboard: false,
    autoDelete: false,
    enableAlerts: false,
    enableScheduledSubmit: false,
  })
  
  const formRef = ref(null)
  
  const handleTagClick = (tag) => {
    activeTag.value = activeTag.value === tag ? '' : tag
  }
  
  const filteredModels = computed(() => {
    return models.value.filter(model => {
      const matchesSearch = searchQuery.value === '' || 
        model.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        model.description.toLowerCase().includes(searchQuery.value.toLowerCase())
      
      const matchesTag = activeTag.value === '' || 
        model.category === activeTag.value || 
        model.subcategory === activeTag.value
      
      const matchesDeploy = !supportDeploy.value || model.supportDeploy
      const matchesOneClick = !supportOneClick.value || model.supportDeploy
  
      return matchesSearch && matchesTag && matchesDeploy && matchesOneClick
    })
  })
  
  const handleDeploy = (model) => {
    selectedModel.value = model
    drawerVisible.value = true
  }
  
  const submitForm = async () => {
    // 这里添加表单提交逻辑
    ElMessage.success('任务创建成功')
    drawerVisible.value = false
  }

  const handleAddStorage = () => {
    // 处理添加存储的逻辑
    console.log('添加存储')
  }

  const handleConfigFaultTolerance = () => {
    // 处理容错配置的逻辑
    console.log('配置容错')
  }
  </script>
  
  <style scoped>
  .market-container {
    padding: 20px;
    max-width: 1400px;
    margin: 0 auto;
  }
  
  .description-card {
    margin-bottom: 24px;
    text-align: left;
  }
  
  .description-card h1 {
    font-size: 24px;
    margin-bottom: 12px;
    color: var(--el-text-color-primary);
  }
  
  .subtitle {
    color: var(--el-text-color-secondary);
    font-size: 14px;
    line-height: 1.6;
    margin: 0;
  }
  
  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 24px;
  }
  
  .tag-item {
    cursor: pointer;
  }
  
  .search-area {
    margin-bottom: 24px;
  }
  
  .model-grid {
    margin-top: 24px;
  }
  
  .model-card {
    /* margin-bottom: 20px; */
    height: 100%;
  }
  
  .model-tags {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
  }
  
  .model-title {
    font-size: 18px;
    margin: 16px 0;
    color: var(--el-text-color-primary);
    text-align: left;
  }
  
  .model-description {
    color: var(--el-text-color-secondary);
    font-size: 14px;
    line-height: 1.6;
    margin: 12px 0;
    text-align: left;
  }
  
  .model-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
  }
  
  .model-meta {
    display: flex;
    align-items: center;
  }
  
  .ml-4 {
    margin-left: 16px;
  }
  
  .deploy-info {
    padding: 20px;
  }
  
  .deploy-actions {
    margin-top: 24px;
    text-align: right;
  }
  
  .deploy-info h3 {
    margin-bottom: 20px;
    color: var(--el-text-color-primary);
  }
  
  .deploy-form {
    padding: 20px;
  }
  
  .form-section {
    margin-bottom: 24px;
  }
  
  .section-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 16px;
    color: var(--el-text-color-primary);
    border-bottom: 1px solid var(--el-border-color-light);
    padding-bottom: 8px;
    text-align: left;
    padding-left: 0;
  }
  
  .form-tip {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-top: 4px;
    margin-left: 8px;
  }
  
  .form-actions {
    text-align: right;
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid var(--el-border-color-light);
  }
  
  :deep(.el-form-item__label) {
    font-weight: normal;
  }
  
  :deep(.el-radio-group) {
    width: 100%;
  }
  
  :deep(.el-select) {
    width: 100%;
  }
  
  .drawer-title {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    text-align: left;
  }
  
  :deep(.el-textarea__inner) {
    font-family: monospace;
  }
  
  :deep(.el-input-number) {
    width: 160px;
  }
  
  :deep(.el-switch) {
    margin-right: 8px;
  }
  
  .info-icon {
    margin-left: 8px;
    font-size: 16px;
    color: var(--el-text-color-secondary);
    vertical-align: middle;
  }
  
  :deep(.el-tooltip__trigger) {
    display: inline-flex;
    align-items: center;
  }
  
  :deep(.el-form-item) {
    margin-bottom: 20px;
  }
  </style>