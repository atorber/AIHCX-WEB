<template>
  <el-drawer
    :model-value="visible"
    @update:model-value="updateVisible"
    title="创建任务"
    size="50%"
    :destroy-on-close="true"
    @close="onClose"
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

        <!-- 资源配置 -->
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

        <!-- 容错&诊断 -->
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
          <el-button @click="close">取消</el-button>
          <el-button type="primary" @click="submitForm">完成</el-button>
        </div>
      </el-form>
    </div>
  </el-drawer>
</template>

<script setup>
import { ref, defineProps, defineEmits, watchEffect } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, InfoFilled } from '@element-plus/icons-vue'

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

const formRef = ref(null)

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

watchEffect(() => {
  if (props.visible && props.model) {
    // 初始化任务名称
    deployForm.value.taskName = `${props.model.name}-任务-${new Date().getTime().toString().slice(-6)}`
  }
})

const handleAddStorage = () => {
  // 处理添加存储的逻辑
  console.log('添加存储')
}

const handleConfigFaultTolerance = () => {
  // 处理容错配置的逻辑
  console.log('配置容错')
}

const submitForm = async () => {
  // 表单提交逻辑
  ElMessage.success('任务创建成功')
  close()
  emit('submit', deployForm.value)
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