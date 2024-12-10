<template>
  <div style="padding: 0px 20px; max-width: 1200px; margin: 0 auto; text-align: left">
    <h1 color="$ep-color-primary">{{ msg }}</h1>

    <!-- 表单开始 -->
    <el-form ref="formRef" :model="formModel" :rules="rules" @submit.prevent="handleSubmit" label-width="120px"
      label-position="left">
      <el-row :gutter="20">
        <!-- 第一列 -->
        <el-col :span="8">
          <el-form-item label="模型名称" prop="modelName">
            <el-select v-model="formModel.modelName" placeholder="请选择模型名称">
              <el-option v-for="model in modelOptions" :key="model" :label="model" :value="model"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item required label="训练阶段" prop="trainingPhase">
            <el-select v-model="formModel.trainingPhase" placeholder="请选择训练阶段">
              <el-option label="SFT" value="sft"></el-option>
              <el-option label="Pretrain" value="pretrain"></el-option>
              <!-- 根据需要添加更多选项 -->
            </el-select>
          </el-form-item>
        </el-col>
        <el-col v-if="formModel.trainingPhase === 'pretrain'" :span="8">
          <el-form-item required label="JSON Keys" prop="jsonKeys">
            <el-input v-model="formModel.jsonKeys" placeholder="请输入 JSON Keys"></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item required label="原始数据路径" prop="sourcePath">
            <el-input clearable v-model="formModel.sourcePath" placeholder="请输入原始数据路径">
              <template #append>
                <PathSelector @selection-confirmed="setSourcePath" />
              </template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item required label="保存路径" prop="savePath">
            <el-input clearable v-model="formModel.savePath" placeholder="请输入数据集保存路径">
              <template #append>
                <PathSelector @selection-confirmed="setSavePath" />
              </template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <div style="padding: 20px">
        <el-text style="color: grey">
          说明：预处理数据，需先将数据集下载到PFS或本地磁盘
        </el-text>
      </div>
      <!-- 提交按钮 -->
      <el-row>
        <el-col :span="24" class="text-center">
          <el-form-item>
            <el-button type="primary" @click="handleSubmit">立即执行</el-button>
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

interface TrainingOptions {
  modelName: string;
  trainingPhase: string;
  sourcePath: string;
  savePath: string;
  jsonKeys: string;
}

// 定义响应式的表单模型
const formModel: TrainingOptions = reactive({
  modelName: "llama2-7b",
  trainingPhase: "sft",
  sourcePath: "",
  savePath: "",
  datasetUrl: "",
  jsonKeys: "",
});

const msg = ref("数据预处理");

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

const setSourcePath = (path: string) => {
  formModel.sourcePath = path;
};

const setSavePath = (path: string) => {
  formModel.savePath = path;
};

// 定义表单验证规则
const rules: FormRules = {
  modelName: [{ required: true, message: "请选择模型名称", trigger: "blur" }],
  sourcePath: [{ required: true, message: "请输入原始数据路径", trigger: "blur" }],
  savePath: [{ required: true, message: "请输入保存路径", trigger: "blur" }],
  jsonKeys: [{ required: true, message: "请输入 JSON Keys", trigger: "blur" }],
  trainingPhase: [{ required: true, message: "请选择训练阶段", trigger: "blur" }],
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
