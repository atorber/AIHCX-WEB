<template>
  <el-drawer
    :model-value="visible"
    @update:model-value="updateVisible"
    :title="title"
    :size="size"
    :destroy-on-close="true"
    @close="onClose"
  >
    <template #header>
      <h4 class="drawer-title">{{ title }}</h4>
    </template>
    <div class="dynamic-form-container">
      <el-form 
        ref="formRef"
        :model="formData"
        :rules="formRules"
        :label-width="labelWidth"
        class="dynamic-form"
      >
        <!-- 动态生成表单内容 -->
        <template v-for="section in formDescriptor.sections" :key="section.id">
          <!-- 表单分段 -->
          <div class="form-section">
            <div class="section-title">{{ section.title }}</div>
            
            <!-- 动态表单项 -->
            <template v-for="field in section.fields" :key="field.id">
              <el-form-item 
                :label="field.label" 
                :prop="field.name"
                :required="field.required"
              >
                <!-- 文本输入框 -->
                <el-input 
                  v-if="field.type === 'text'" 
                  v-model="formData[field.name]"
                  :placeholder="field.placeholder || '请输入' + field.label"
                  :disabled="field.disabled"
                />
                
                <!-- 选择器 -->
                <el-select 
                  v-else-if="field.type === 'select'" 
                  v-model="formData[field.name]"
                  :placeholder="field.placeholder || '请选择' + field.label"
                  :disabled="field.disabled"
                  style="width: 100%;"
                >
                  <el-option 
                    v-for="option in field.options" 
                    :key="option.value"
                    :label="option.label" 
                    :value="option.value" 
                  />
                </el-select>
                
                <!-- 单选按钮组 -->
                <el-radio-group 
                  v-else-if="field.type === 'radio'" 
                  v-model="formData[field.name]"
                  :disabled="field.disabled"
                >
                  <el-radio 
                    v-for="option in field.options" 
                    :key="option.value"
                    :label="option.value"
                  >
                    {{ option.label }}
                  </el-radio>
                </el-radio-group>
                
                <!-- 多选框 -->
                <el-checkbox 
                  v-else-if="field.type === 'checkbox'" 
                  v-model="formData[field.name]"
                  :disabled="field.disabled"
                >
                  {{ field.checkboxLabel || field.label }}
                </el-checkbox>
                
                <!-- 开关 -->
                <el-switch 
                  v-else-if="field.type === 'switch'" 
                  v-model="formData[field.name]"
                  :disabled="field.disabled"
                />
                
                <!-- 数字输入框 -->
                <el-input-number 
                  v-else-if="field.type === 'number'" 
                  v-model="formData[field.name]"
                  :min="field.min"
                  :max="field.max"
                  :step="field.step"
                  :precision="field.precision"
                  :disabled="field.disabled"
                />
                
                <!-- 文本域 -->
                <el-input 
                  v-else-if="field.type === 'textarea'" 
                  v-model="formData[field.name]"
                  type="textarea"
                  :rows="field.rows || 4"
                  :placeholder="field.placeholder || '请输入' + field.label"
                  :disabled="field.disabled"
                />
                
                <!-- 日期选择器 -->
                <el-date-picker 
                  v-else-if="field.type === 'date'" 
                  v-model="formData[field.name]"
                  :type="field.dateType || 'date'"
                  :placeholder="field.placeholder || '请选择' + field.label"
                  :disabled="field.disabled"
                  style="width: 100%;"
                />
                
                <!-- 上传组件 -->
                <el-upload
                  v-else-if="field.type === 'upload'"
                  action="#"
                  :auto-upload="false"
                  :on-change="(file) => handleFileChange(file, field.name)"
                  :limit="field.limit || 1"
                  :disabled="field.disabled"
                >
                  <el-button type="primary" plain>{{ field.buttonText || '点击上传' }}</el-button>
                  <div class="form-tip" v-if="field.tip">{{ field.tip }}</div>
                </el-upload>
                
                <!-- 默认情况，使用文本输入 -->
                <el-input 
                  v-else 
                  v-model="formData[field.name]"
                  :placeholder="field.placeholder || '请输入' + field.label"
                  :disabled="field.disabled"
                />
                
                <!-- 提示信息 -->
                <div class="form-tip" v-if="field.tip">{{ field.tip }}</div>
                
                <!-- 额外的提示工具 -->
                <el-tooltip
                  v-if="field.tooltip"
                  :content="field.tooltip"
                  placement="top"
                >
                  <el-icon class="info-icon"><InfoFilled /></el-icon>
                </el-tooltip>
              </el-form-item>
            </template>
          </div>
        </template>

        <!-- 操作按钮 -->
        <div class="form-actions">
          <el-button @click="close">{{ cancelButtonText }}</el-button>
          <el-button type="primary" @click="submitForm">{{ submitButtonText }}</el-button>
        </div>
      </el-form>
    </div>
  </el-drawer>
</template>

<script setup>
import { ref, defineProps, defineEmits, computed, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'

import { ServeCreateJob } from '../api/jobs'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '表单'
  },
  size: {
    type: String,
    default: '50%'
  },
  formDescriptor: {
    type: Object,
    required: true,
    // formDescriptor = {
    //   sections: [
    //     {
    //       id: 'basic',
    //       title: '基础信息',
    //       fields: [
    //         {
    //           id: 'name',
    //           name: 'name',
    //           label: '姓名',
    //           type: 'text',
    //           required: true,
    //           placeholder: '请输入姓名',
    //           tip: '支持中文和英文',
    //           rules: [{ required: true, message: '请输入姓名', trigger: 'blur' }]
    //         },
    //         ...
    //       ]
    //     },
    //     ...
    //   ]
    // }
  },
  labelWidth: {
    type: String,
    default: '120px'
  },
  initData: {
    type: Object,
    default: () => ({})
  },
  submitButtonText: {
    type: String,
    default: '确定'
  },
  cancelButtonText: {
    type: String,
    default: '取消'
  }
})

const emit = defineEmits(['update:visible', 'submit', 'cancel'])

const formRef = ref(null)

// 根据表单描述初始化表单数据
const formData = reactive({})

// 初始化表单验证规则
const formRules = computed(() => {
  const rules = {}
  
  props.formDescriptor.sections.forEach(section => {
    section.fields.forEach(field => {
      if (field.rules) {
        rules[field.name] = field.rules
      } else if (field.required) {
        rules[field.name] = [
          { required: true, message: `请输入${field.label}`, trigger: 'blur' }
        ]
      }
    })
  })
  
  return rules
})

// 初始化表单数据
const initFormData = () => {
  // 清空之前的数据
  Object.keys(formData).forEach(key => {
    delete formData[key]
  })
  
  // 设置默认值
  props.formDescriptor.sections.forEach(section => {
    section.fields.forEach(field => {
      let defaultValue = field.defaultValue
      
      // 如果initData中有对应字段的值，则使用initData中的值
      if (props.initData && props.initData[field.name] !== undefined) {
        defaultValue = props.initData[field.name]
      }
      
      // 根据字段类型设置默认值
      if (defaultValue === undefined) {
        switch (field.type) {
          case 'checkbox':
          case 'switch':
            defaultValue = false
            break
          case 'number':
            defaultValue = 0
            break
          case 'select':
          case 'radio':
            defaultValue = field.options && field.options.length > 0 ? field.options[0].value : ''
            break
          default:
            defaultValue = ''
        }
      }
      
      // 设置表单数据
      formData[field.name] = defaultValue
    })
  })
}

// 监听visible变化，在打开时初始化表单数据
watch(() => props.visible, (val) => {
  if (val) {
    initFormData()
  }
}, { immediate: true })

// 监听initData变化，更新表单数据
watch(() => props.initData, () => {
  if (props.visible) {
    initFormData()
  }
}, { deep: true })

const handleFileChange = (file, fieldName) => {
  // 处理文件上传
  formData[fieldName] = file
  console.log('文件上传', fieldName, file)
}

const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    // 提交表单
    emit('submit', { ...formData })
    close()
  } catch (error) {
    ElMessage.error('表单验证失败，请检查输入')
    console.error('表单验证失败', error)
  }
}

const createJob = async () => {
  const res = await ServeCreateJob(formData)
  console.log('创建任务', res)
}

const close = () => {
  emit('update:visible', false)
  emit('cancel')
}

const onClose = () => {
  close()
}

const updateVisible = (value) => {
  emit('update:visible', value)
}
</script>

<style scoped>
.dynamic-form-container {
  padding: 20px;
}

.dynamic-form {
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