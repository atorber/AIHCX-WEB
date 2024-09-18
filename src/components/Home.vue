<template>
  <div style="padding: 20px; max-width: 1200px; margin: 0 auto; text-align: left;">
    <h1 color="$ep-color-primary">{{ msg }}</h1>

    <!-- 表单开始 -->
    <el-form @submit.prevent="handleSubmit" label-width="120px">
      <el-row :gutter="20">
        <!-- 第一列 -->
        <el-col :span="8">
          <el-form-item label="模型名称" prop="modelName">
            <el-select v-model="modelName" placeholder="请选择模型名称">
              <el-option v-for="model in modelOptions" :key="model" :label="model" :value="model">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item required label="副本数" prop="replicas">
            <el-input v-model="replicas" type="number" placeholder="请输入副本数"></el-input>
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item required label="版本" prop="version">
            <el-input v-model="version" placeholder="请输入版本"></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="训练阶段" prop="trainingPhase">
            <el-select v-model="trainingPhase" placeholder="请选择训练阶段">
              <el-option label="SFT" value="sft"></el-option>
              <el-option label="Pretrain" value="pretrain"></el-option>
              <!-- 根据需要添加更多选项 -->
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item label="TP" prop="tp">
            <el-input v-model="tp" type="number" placeholder="请输入 TP 值"></el-input>
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item label="PP" prop="pp">
            <el-input v-model="pp" type="number" placeholder="请输入 PP 值"></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="数据集名称" prop="datasetName">
            <el-select v-model="datasetName" placeholder="请选择数据集名称">
              <el-option v-for="dataset in datasetOptions" :key="dataset" :label="dataset" :value="dataset">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item required label="镜像" prop="image">
            <el-input v-model="image" placeholder="请输入镜像地址"></el-input>
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item required label="挂载路径" prop="mountPath">
            <el-input v-model="mountPath" placeholder="请输入挂载路径"></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="模型 URL" prop="modelUrl">
            <el-input v-model="modelUrl" placeholder="请输入模型 URL"></el-input>
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item label="数据集 URL" prop="datasetUrl">
            <el-input v-model="datasetUrl" placeholder="请输入数据集 URL"></el-input>
          </el-form-item>
        </el-col>

        <el-col v-if="trainingPhase == 'pretrain'" :span="8">
          <el-form-item label="JSON Keys" prop="jsonKeys">
            <el-input v-model="jsonKeys" placeholder="请输入 JSON Keys"></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 提交按钮 -->
      <el-row>
        <el-col :span="24" class="text-center">
          <el-form-item>
            <el-button type="primary" @click="handleSubmit">生成执行命令</el-button>
            <el-button v-if="generatedParams" type="primary" @click="copyToClipboard">复制到剪切板</el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <!-- 表单结束 -->

    <!-- 生成的参数展示 -->
    <el-card v-if="generatedParams" class="box-card" style="margin-top: 20px;">
      <div slot="header" class="clearfix">
        <el-button style="float: right; padding: 3px 0" type="primary" size="small"
          @click="copyToClipboard">复制到剪切板</el-button>
      </div>
      <pre class="pre-wrap">{{ generatedParams }}</pre>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { ElMessage } from "element-plus";
import { generateAiakParameter } from './aiak-parms';

// 定义表单字段
const modelName = ref("llama2-70b");
const replicas = ref("4");
const version = ref("v1");
const trainingPhase = ref("sft");
const tp = ref("");
const pp = ref("");
const datasetName = ref("alpaca_zh-llama3-train");
const image = ref("registry.baidubce.com/aihc-aiak/aiak-training-llm:ubuntu22.04-cu12.3-torch2.2.0-py310-bccl1.2.7.2_v2.1.1.5_release");
const mountPath = ref("/workspace/pfs");
const modelUrl = ref("");
const datasetUrl = ref("");
const jsonKeys = ref("");

// 定义其他变量
const count = ref(0);
const input = ref("element-plus");
const curDate = ref("");
const value1 = ref(true);

// 链接配置路径
const chainJobConfigPath = ref("/Users/luyuchao/Documents/GitHub/bce-sdk-python/sample/aihc");

// 显示消息
const toast = () => {
  ElMessage.success("Hello");
};

// 定义生成的参数
const generatedParams = ref("");

// 定义模型选项
const modelOptions = [
  "llama2-7b", "llama2-13b", "llama2-70b",
  "llama3-8b", "llama3-70b",
  "qwen2-0.5b", "qwen2-1.5b", "qwen2-7b", "qwen2-72b",
  "baichuan2-7b", "baichuan2-13b",
  "qwen-1.8b", "qwen-7b", "qwen-14b", "qwen-72b",
  "qwen1.5-0.5b", "qwen1.5-1.8b", "qwen1.5-4b",
  "qwen1.5-7b", "qwen1.5-14b", "qwen1.5-32b", "qwen1.5-72b"
];

// 定义数据集选项
const pretrainDatasets = ["pile_llama_test", "WuDaoCorpus2.0_base_sample"];
const sftDatasets = ["alpaca_zh-llama3-train", "alpaca_zh-llama3-valid"];

// 计算当前数据集选项
const datasetOptions = computed(() => {
  if (trainingPhase.value === "pretrain") {
    return pretrainDatasets;
  } else if (trainingPhase.value === "sft") {
    return sftDatasets;
  } else {
    return [];
  }
});

// 监听 trainingPhase 变化，重置 datasetName
watch(trainingPhase, (newPhase) => {
  if (newPhase === "pretrain") {
    datasetName.value = pretrainDatasets[0];
  } else if (newPhase === "sft") {
    datasetName.value = sftDatasets[0];
  } else {
    datasetName.value = "";
  }
});

// 提交表单
const handleSubmit = () => {
  const aiakJobConfig = {
    "MODEL_NAME": modelName.value,
    "REPLICAS": replicas.value,
    "VERSION": version.value,
    "TRAINING_PHASE": trainingPhase.value,
    "TP": tp.value,
    "PP": pp.value,
    "DATASET_NAME": datasetName.value,
    "IMAGE": image.value,
    "MOUNT_PATH": mountPath.value,
    "MODEL_URL": modelUrl.value,
    "DATASET_URL": datasetUrl.value,
    "JSON_KEYS": jsonKeys.value
  };

  try {
    const job_sh = generateAiakParameter(chainJobConfigPath.value, aiakJobConfig);
    console.log(job_sh);
    generatedParams.value = job_sh; // 格式化显示
    ElMessage.success("参数已生成并显示在页面上");
  } catch (error) {
    ElMessage.error("生成参数时出错，请检查输入");
    console.error(error);
  }
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