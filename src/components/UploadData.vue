<template>
  <div style="padding: 0px 20px; max-width: 1200px; margin: 0 auto; text-align: left">
    <h1 color="$ep-color-primary" style="font-size: 24px; font-weight: 600; margin-bottom: 8px;">数据上传</h1>
    <div style="color: var(--el-text-color-regular); font-size: 14px; margin-bottom: 24px;">
      上传PC本地文件到PFS或本地磁盘
    </div>

    <!-- 表单开始 -->
    <el-form ref="formRef" :model="formModel" :rules="rules" @submit.prevent="handleSubmit" label-width="120px"
      label-position="left">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item required label="文件" prop="data">
            <el-upload
    ref="uploadRef"
    class="upload-demo"
    action="http://127.0.0.1:8000/api/upload"
    :limit="1"
    :before-upload="beforeAvatarUpload"
    :on-error="onError"
    :on-success="onSuccess"
  >
    <template #trigger>
      <el-button type="primary">选择文件</el-button>
    </template>

    <template #tip>
      <div class="el-upload__tip">
        选择要上传的文件，建议小于10M
      </div>
    </template>
  </el-upload>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item required label="保存路径" prop="savePath">
            <el-input clearable v-model="formModel.savePath" placeholder="请选择保存路径">
              <template #append>
                <PathSelector @selection-confirmed="setSavePath" />
              </template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <div style="padding: 20px">
        <el-text style="color: grey">
          说明：上传PC本地文件到PFS或本地磁盘
        </el-text>
      </div>
      <!-- 提交按钮 -->
      <el-row>
        <el-col :span="24" class="text-center">
          <el-form-item>
            <el-button type="primary" @click="handleSubmit">立即上传</el-button>
            <el-button disabled @click="handleReset">历史记录</el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <!-- 表单结束 -->

    <!-- 生成的参数展示 -->
    <el-card v-if="generatedParams" class="box-card" style="margin-top: 20px">
      <div class="clearfix">
        <el-button style="float: right; padding: 3px 0" type="primary" size="small" @click="copyToClipboard">
          复制到剪切板
        </el-button>
      </div>
      <pre class="pre-wrap">{{ generatedParams }}</pre>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { ElMessage, FormRules } from "element-plus";
import type { UploadInstance, UploadProps } from 'element-plus'

const uploadRef = ref<UploadInstance>()

interface UploadData {
  data: string;
  savePath: string;
}

// 定义响应式的表单模型
const formModel:UploadData = reactive({
  data: '',
  savePath: "",
});

// 定义生成的参数
const generatedParams = ref("");

// 定义表单验证规则
const rules: FormRules = {
  datasetUrl: [{ required: true, message: "请选择文件", trigger: "change" }],
  savePath: [{ required: true, message: "请选择保存路径", trigger: "blur" }],
};

const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  console.info('rawFile', rawFile)
  formModel.data = rawFile.name
  return true
}

const setSavePath = (path: string) => {
  formModel.savePath = path
}

const onError = (err: any, file: any, fileList: any) => {
  console.error('upload err', err)
  console.error('upload file', file)
  console.error('upload fileList', fileList)
}

const onSuccess = (res: any, file: any, fileList: any) => {
  console.info('upload res', res)
  console.info('upload file', file)
  console.info('upload fileList', fileList)
  formModel.data = res.file
}

// 引用表单实例
const formRef = ref();

// 提交表单
const handleSubmit = () => {
  if (!formModel.data) {
    ElMessage.warning("请选择文件");
    return false;
  }
  formRef.value.validate((valid: boolean) => {
    if (valid) {
      const aiakJobConfig = formModel;
      uploadRef.value!.submit()
      try {
        generatedParams.value = JSON.stringify(aiakJobConfig, null, 2);
        ElMessage.success("已生成成功");
        uploadRef.value!.clearFiles()
      } catch (error) {
        ElMessage.error("生成参数时出错，请检查输入");
        console.error(error);
      }
    } else {
      ElMessage.error("有必填项未填写");
      return false;
    }
  });
};

// 复制到剪切板
const copyToClipboard = async () => {
  if (!generatedParams.value) {
    ElMessage.warning("没有生成的参数可以复制");
    return;
  }
  try {
    await navigator.clipboard.writeText(generatedParams.value);
    ElMessage.success("复制成功！");
  } catch (err) {
    ElMessage.error("复制失败，请手动复制");
    console.error(err);
  }
};

// 重置表单
const handleReset = () => {
  if (formRef.value) {
    formRef.value.resetFields();
    generatedParams.value = ""; // 可选：清除生成的参数展示
    ElMessage.success("表单已重置");
  }
};
</script>

<style>
.ep-button {
  margin: 4px;
}

.ep-button+.ep-button {
  margin-left: 0;
  margin: 4px;
}

/* 为表单添加一些间距 */
.el-form {
  width: 100%;
  padding: 20px;
}

/* 调整 el-row 间距 */
.el-row {
  margin: 0;
}

/* 调整生成参数展示框样式 */
.box-card {
  width: 100%;
  padding: 20px;
  word-break: break-word;
  /* 允许在单词内换行 */
  white-space: pre-wrap;
  /* 保留空格和换行符，并允许自动换行 */
  background-color: #f9f9f9;
  border: 1px solid #ebeef5;
}

/* 确保 pre 标签自动换行 */
.pre-wrap {
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
}
</style>
