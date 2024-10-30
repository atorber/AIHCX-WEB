<template>
  <div style="padding: 0px 20px; max-width: 1200px; margin: 0 auto; text-align: left">
    <h1 color="$ep-color-primary">{{ msg }}</h1>

    <!-- 表单开始 -->
    <el-form ref="formRef" :model="formModel" @submit.prevent="handleSubmit" label-width="120px"
      label-position="left">
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="来源" prop="trainingPhase">
            <el-radio-group v-model="formModel.source" aria-label="label position">
              <el-radio-button value="custom">自定义</el-radio-button>
              <el-radio-button value="publicCkpt">公共权重</el-radio-button>
              <el-radio-button value="publicDataset">公共数据集</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <!-- 第一列 -->
        <el-col v-if="source === 'publicCkpt'" :span="8">
          <el-form-item label="模型" prop="modelName">
            <el-select v-model="formModel.name" placeholder="请选择模型名称">
              <el-option v-for="model in modelOptions" :key="model" :label="model" :value="model"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col v-if="source === 'publicDataset'" :span="8">
          <el-form-item label="数据集" prop="modelName">
            <el-select v-model="formModel.name" placeholder="请选择模型名称">
              <el-option v-for="model in modelOptions" :key="model" :label="model" :value="model"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item required label="下载地址" prop="datasetUrl">
            <el-input :disabled="source !== 'custom'" v-model="formModel.downloadUrl" placeholder="请输入URL，以bos:/开头"></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item required label="保存路径" prop="mountPath">
            <el-input v-model="formModel.savePath" placeholder="请选择保存路径"></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <div style="padding: 20px">
        <el-text style="color: grey">
          说明：从百度云对象存储BOS中下载数据集或权重到PFS或本地磁盘
        </el-text>
      </div>
      <!-- 提交按钮 -->
      <el-row>
        <el-col :span="24" class="text-center">
          <el-form-item>
            <el-button type="primary" @click="handleSubmit">立即下载</el-button>
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
import { reactive, computed, watch, ref } from "vue";
import { ElMessage, FormRules } from "element-plus";
import { generatePreprocessData, timeStr } from "./aiak-parms";

interface DownloadData {
  source: string;
  name: string;
  downloadUrl: string;
  savePath: string;
}

const source = ref('custom')
// 定义响应式的表单模型
const formModel:DownloadData = reactive({
  source: "custom",
  name: "llama2-70b",
  downloadUrl: "",
  savePath: "/workspace/pfs",
});

const msg = ref("数据集&权重下载");

// 定义生成的参数
const generatedParams = ref("");

// 定义模型选项
const modelOptions = [
  "llama2-7b",
  "llama2-13b",
  "llama2-70b",
  "llama3-8b",
  "llama3-70b",
  "qwen2-0.5b",
  "qwen2-1.5b",
  "qwen2-7b",
  "qwen2-72b",
  "baichuan2-7b",
  "baichuan2-13b",
  "qwen-1.8b",
  "qwen-7b",
  "qwen-14b",
  "qwen-72b",
  "qwen1.5-0.5b",
  "qwen1.5-1.8b",
  "qwen1.5-4b",
  "qwen1.5-7b",
  "qwen1.5-14b",
  "qwen1.5-32b",
  "qwen1.5-72b",
];

// 定义数据集选项
const pretrainDatasets = ["pile_llama_test", "WuDaoCorpus2.0_base_sample"];
const sftDatasets = ["alpaca_zh-llama3-train", "alpaca_zh-llama3-valid"];

// 监听 trainingPhase 变化，重置 datasetName
watch(
  () => formModel.source,
  (newPhase) => {
    if (newPhase === "dataset") {
      formModel.name = pretrainDatasets[0];
    } else if (newPhase === "model") {
      formModel.name = sftDatasets[0];
    } else {
      formModel.name = "";
    }
  }
);

// 定义表单验证规则
const rules: FormRules = {
  modelName: [{ required: true, message: "请选择模型名称", trigger: "blur" }],
  replicas: [
    { required: true, message: "请输入训练机数", trigger: "blur" },
    { type: "number", min: 1, message: "副本数必须为正整数", trigger: "blur" },
  ],
  version: [
    { required: true, message: "请输入版本", trigger: "blur" },
    {
      pattern: /^[A-Za-z0-9\-]+$/,
      message: "版本只能包含数字、字母和中划线",
      trigger: "blur",
    },
  ],
  trainingPhase: [
    { required: true, message: "请选择训练阶段", trigger: "blur" },
  ],
  image: [{ required: true, message: "请输入镜像地址", trigger: "blur" }],
  mountPath: [{ required: true, message: "请输入挂载路径", trigger: "blur" }],
  // 根据需要为其他字段添加更多规则
};

// 引用表单实例
const formRef = ref();

// 提交表单
const handleSubmit = () => {
  formRef.value.validate((valid: boolean) => {
    if (valid) {
      const aiakJobConfig = formModel;

      try {
        generatedParams.value = JSON.stringify(aiakJobConfig, null, 2);

        ElMessage.success("已生成成功");
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
