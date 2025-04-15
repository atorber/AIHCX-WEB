<template>
  <el-drawer
    :model-value="visible"
    @update:model-value="updateVisible"
    title="模型微调"
    size="50%"
    :destroy-on-close="true"
    @close="onClose"
  >
    <template #header>
      <h4 class="drawer-title">模型微调</h4>
    </template>
    <div class="deploy-info">
      <el-form 
        ref="fineTuneFormRef"
        :model="fineTuneForm"
        label-width="120px"
        class="deploy-form"
      >
        <!-- 基础信息 -->
        <div class="form-section">
          <div class="section-title">基础信息</div>
          <el-form-item label="微调任务名称" required>
            <el-input v-model="fineTuneForm.taskName" placeholder="请输入微调任务名称" />
            <div class="form-tip">支持小写字母、数字以及-，且开头必须是小写字母，结尾必须是小写字母或数字，长度1-50</div>
          </el-form-item>
          <el-form-item label="资源池类型">
            <el-radio-group v-model="fineTuneForm.poolType">
              <el-radio label="通用资源池">通用资源池</el-radio>
              <el-radio label="专用资源池">专用资源池</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="资源池">
            <el-select v-model="fineTuneForm.pool" placeholder="请选择资源池">
              <el-option label="shengzhaotest-A800" value="shengzhaotest-A800" />
            </el-select>
          </el-form-item>
        </div>

        <!-- 微调数据集 -->
        <div class="form-section">
          <div class="section-title">微调数据集</div>
          <el-form-item label="数据集选择">
            <el-select v-model="fineTuneForm.dataset" placeholder="请选择数据集">
              <el-option label="金融领域问答集" value="finance-qa" />
              <el-option label="医疗领域问答集" value="medical-qa" />
              <el-option label="法律领域问答集" value="legal-qa" />
            </el-select>
          </el-form-item>
          <el-form-item label="数据集预览">
            <el-button type="primary" plain @click="previewDataset">
              预览数据集
            </el-button>
          </el-form-item>
          <el-form-item label="自定义数据集">
            <el-upload
              action="#"
              :auto-upload="false"
              :on-change="handleFileChange"
              :limit="1"
            >
              <el-button type="primary" plain>上传数据集</el-button>
              <div class="form-tip">支持JSON、CSV、TXT格式，最大2GB</div>
            </el-upload>
          </el-form-item>
        </div>

        <!-- 微调参数 -->
        <div class="form-section">
          <div class="section-title">微调参数</div>
          <el-form-item label="学习率">
            <el-input-number v-model="fineTuneForm.learningRate" :min="0.000001" :max="0.01" :step="0.000001" :precision="6" />
          </el-form-item>
          <el-form-item label="训练轮次">
            <el-input-number v-model="fineTuneForm.epochs" :min="1" :max="100" />
          </el-form-item>
          <el-form-item label="批次大小">
            <el-input-number v-model="fineTuneForm.batchSize" :min="1" :max="128" />
          </el-form-item>
          <el-form-item label="训练方法">
            <el-select v-model="fineTuneForm.method" placeholder="请选择训练方法">
              <el-option label="LoRA" value="lora" />
              <el-option label="QLoRA" value="qlora" />
              <el-option label="全参数微调" value="full" />
            </el-select>
          </el-form-item>
        </div>

        <!-- 高级配置 -->
        <div class="form-section">
          <div class="section-title">高级配置</div>
          <el-form-item label="Tensorboard">
            <el-switch v-model="fineTuneForm.enableTensorboard" />
            <el-tooltip
              content="开启后，可以在任务详情页查看训练过程中的指标变化"
              placement="top"
            >
              <el-icon class="info-icon"><InfoFilled /></el-icon>
            </el-tooltip>
          </el-form-item>
          <el-form-item label="自动评估">
            <el-switch v-model="fineTuneForm.autoEvaluate" />
            <el-tooltip
              content="开启后，微调完成后将自动评估模型性能"
              placement="top"
            >
              <el-icon class="info-icon"><InfoFilled /></el-icon>
            </el-tooltip>
          </el-form-item>
        </div>

        <!-- 操作按钮 -->
        <div class="form-actions">
          <el-button @click="close">取消</el-button>
          <el-button type="primary" @click="submitForm">开始微调</el-button>
        </div>
      </el-form>
    </div>
  </el-drawer>
</template>

<script setup>
import { ref, defineProps, defineEmits, watchEffect } from 'vue'
import { ElMessage } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  model: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:visible', 'submit'])

const fineTuneFormRef = ref(null)

const fineTuneForm = ref({
  taskName: '',
  poolType: '通用资源池',
  pool: 'shengzhaotest-A800',
  dataset: '',
  learningRate: 0.00002,
  epochs: 3,
  batchSize: 8,
  method: 'lora',
  enableTensorboard: true,
  autoEvaluate: false
})

watchEffect(() => {
  if (props.visible && props.model) {
    // 设置默认任务名称
    fineTuneForm.value.taskName = `${props.model.name}-微调-${new Date().getTime().toString().slice(-6)}`
  }
})

const previewDataset = () => {
  // 处理数据集预览的逻辑
  console.log('预览数据集', fineTuneForm.value.dataset)
}

const handleFileChange = (file) => {
  // 处理文件上传变化
  console.log('文件上传', file)
}

const submitForm = async () => {
  // 这里添加微调表单提交逻辑
  ElMessage.success('微调任务创建成功')
  close()
  emit('submit', fineTuneForm.value)
}

const close = () => {
  emit('update:visible', false)
}

const onClose = () => {
  close()
}

const updateVisible = (value) => {
  emit('update:visible', value)
}
</script>

<style scoped>
.deploy-info {
  padding: 20px;
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