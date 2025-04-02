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
          v-for="model in filteredApps" 
          :key="model.id" 
          :xs="24" 
          :sm="12" 
          :md="8" 
          :lg="8"
          style="margin-bottom: 24px;"
        >
          <el-card class="model-card" shadow="hover">
            <div class="model-tags">
              <el-tag v-for="tag in model.tags" size="small" type="success">{{ tag }}</el-tag>
            </div>
            <h2 class="model-title">{{ model.name }}</h2>
            <p class="model-description">{{ model.description }}</p>
            <div class="model-footer">
              <div class="model-meta">
                <el-text type="info" size="small">{{ model.updateDate }}</el-text>
                <el-text type="info" size="small" class="ml-4">{{ model.version }}</el-text>
              </div>
              <el-button-group>
                <el-button 
                  v-for="action in model.actions"
                  :key="action"
                  type="primary" 
                  size="small"
                  @click="handleAction(model, action)"
                >
                  {{ action }}
                </el-button>
              </el-button-group>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 使用抽离的组件 -->
      <CreateTaskDrawer 
        v-model:visible="drawerVisible" 
        :model="selectedModel"
        @submit="handleTaskSubmit"
      />
      
      <FineTuneDrawer 
        v-model:visible="fineTuneDrawerVisible" 
        :model="selectedModel"
        @submit="handleFineTuneSubmit"
      />

    <!-- 动态表单抽屉 -->
    <DynamicFormDrawer
      v-model:visible="jobDrawerVisible"
      :title="selectedModel?.name || ''"
      :form-descriptor="selectedModel?.jobFormDescriptor"
      :init-data="selectedModel?.formInitData"
      @submit="handleJobSubmit"
    />

    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { Search, Plus, InfoFilled } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import { ServeGetApps, ServeGetAppTags } from '../api/apps'
  import CreateTaskDrawer from './CreateTaskDrawer.vue'
  import FineTuneDrawer from './FineTuneDrawer.vue'
  
  const tags = ref([])
  const getTags = async () => {
    const res = await ServeGetAppTags()
    tags.value = res.tags
  }
  getTags()
  
  const activeTag = ref('')
  const supportDeploy = ref(false)
  const supportOneClick = ref(false)
  const searchQuery = ref('')
  
  const apps = ref([])
  const getApps = async () => {
    const res = await ServeGetApps({ pageSize: 100, pageNumber: 1 })
    apps.value = res.apps
  }
  getApps()
  
  const drawerVisible = ref(false)
  const fineTuneDrawerVisible = ref(false)
  const jobDrawerVisible = ref(false)
  const selectedModel = ref(null)
  
  const handleTagClick = (tag) => {
    activeTag.value = activeTag.value === tag ? '' : tag
  }
  
  const filteredApps = computed(() => {
    return apps.value.filter(model => {
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

  const handleAction = (model, action) => {
    console.log(model, action)
    selectedModel.value = model
    if (action === '一键部署') {
      drawerVisible.value = true
    } else if (action === '模型微调') {
      fineTuneDrawerVisible.value = true
    } else if (action === '运行任务') {
      jobDrawerVisible.value = true
    }
  }
  
  const handleTaskSubmit = (formData) => {
    console.log('任务表单提交数据:', formData)
    ElMessage.success('任务创建成功')
  }

  const handleFineTuneSubmit = (formData) => {
    console.log('微调表单提交数据:', formData)
    ElMessage.success('微调任务创建成功')
  }

  const handleJobSubmit = (formData) => {
    console.log('任务表单提交数据:', formData)
    ElMessage.success('任务创建成功')
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
    min-height: 4lh;
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