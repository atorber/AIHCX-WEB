<template>
  <div
    style="
      padding: 0px 20px;
      max-width: 1200px;
      margin: 0 auto;
      text-align: left;
    "
  >
    <h1 color="$ep-color-primary">{{ msg }}</h1>

    <div style="padding: 10px 0px;">
      <el-alert title="单机训练命令将权重转换、数据预处理、启动训练任务集成在一个命令里，对于多机任务前两个步骤会执行多次" type="error" />
    </div>

    <!-- 表单开始 -->
    <el-form
      ref="formRef"
      :model="formModel"
      :rules="rules"
      @submit.prevent="handleSubmit"
      label-width="120px"
      label-position="left"
    >
      <el-row :gutter="20">
        <!-- 第一列 -->
        <el-col :span="8">
          <el-form-item label="模型名称" prop="modelName">
            <el-select
              v-model="formModel.modelName"
              placeholder="请选择模型名称"
            >
              <el-option
                v-for="model in modelOptions"
                :key="model"
                :label="model"
                :value="model"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="训练阶段" prop="trainingPhase">
            <el-select
              v-model="formModel.trainingPhase"
              placeholder="请选择训练阶段"
            >
              <el-option label="SFT" value="sft"></el-option>
              <el-option label="Pretrain" value="pretrain"></el-option>
              <!-- 根据需要添加更多选项 -->
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item required label="版本" prop="version">
            <el-input
              v-model="formModel.version"
              placeholder="请输入版本，允许数字、字母、中划线"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="数据集名称" prop="datasetName">
            <el-select
              v-model="formModel.datasetName"
              placeholder="请选择数据集名称"
            >
              <el-option
                v-for="dataset in datasetOptions"
                :key="dataset"
                :label="dataset"
                :value="dataset"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item required label="镜像" prop="image">
            <el-input
              v-model="formModel.image"
              placeholder="请输入镜像地址"
            ></el-input>
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item required label="挂载路径" prop="mountPath">
            <el-input
              v-model="formModel.mountPath"
              placeholder="请输入挂载路径"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="副本数" prop="replicas">
            <el-input-number
              v-model="formModel.replicas"
              :min="1"
              placeholder="请输入训练机数"
              style="width: 100%"
            ></el-input-number>
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item label="TP" prop="tp">
            <el-input-number
              v-model="formModel.tp"
              :min="1"
              placeholder="请输入 TP 值，必须为正整数"
              style="width: 100%"
            ></el-input-number>
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item label="PP" prop="pp">
            <el-input-number
              v-model="formModel.pp"
              :min="1"
              placeholder="请输入 PP 值，必须为正整数"
              style="width: 100%"
            ></el-input-number>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="模型 URL" prop="modelUrl">
            <el-input
              v-model="formModel.modelUrl"
              placeholder="请输入模型 URL，以bos:/开头"
            ></el-input>
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item label="数据集 URL" prop="datasetUrl">
            <el-input
              v-model="formModel.datasetUrl"
              placeholder="请输入数据集 URL，以bos:/开头"
            ></el-input>
          </el-form-item>
        </el-col>

        <el-col v-if="formModel.trainingPhase === 'pretrain'" :span="8">
          <el-form-item required label="JSON Keys" prop="jsonKeys">
            <el-input
              v-model="formModel.jsonKeys"
              placeholder="请输入 JSON Keys"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <div style="padding: 20px">
        <el-text style="color: grey">
          参数说明：<br />
          - 模型名称：必选<br />
          - 训练阶段：必选，支持选择pretrain和sft<br />
          - 版本：必填，本次训练的备注标识，通过版本可以区分训练任务<br />
          - 数据集名称：可选，使用预置的测试数据集<br />
          - 镜像：必填，AIAK镜像地址，支持2.1.1.5以上<br />
          - 挂载路径：必填，挂载的PFS路径<br />
          - 副本数：选填，根据模型参数选择，一般7b 1实例、13b 2实例、70b
          4实例，不填写时默认使用AIAK推荐机数<br />
          - TP：选填，张量并行切分策略，不填写时默认使用AIAK推荐切分策略<br />
          - PP：选填，流水线并行切分策略，不填写时默认使用AIAK推荐切分策略<br />
          -
          模型URL：选填，HF格式模型权重的BOS存储地址，填写时会使用填写的地址覆盖默认地址<br />
          -
          数据集URL：选填，数据集的BOS存储地址，填写时会使用填写的地址覆盖默认测试数据集地址<br />
        </el-text>
      </div>
      <!-- 提交按钮 -->
      <el-row>
        <el-col :span="24" class="text-center">
          <el-form-item>
            <el-button type="primary" @click="handleSubmit"
              >生成执行命令</el-button
            >
            <el-button @click="handleReset">重置</el-button>
            <!-- <el-button v-if="generatedParams" type="primary" @click="copyToClipboard">
              复制到剪切板
            </el-button> -->
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <!-- 表单结束 -->

    <!-- 生成的参数展示 -->
    <el-card v-if="generatedParams" class="box-card" style="margin-top: 20px">
      <div class="clearfix">
        <el-button
          style="float: right; padding: 3px 0"
          type="primary"
          size="small"
          @click="copyToClipboard"
        >
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
import { generateAiakParameter, timeStr, getReplicas } from "./aiak-parms";

// 定义响应式的表单模型
const formModel = reactive({
  modelName: "llama2-7b",
  replicas: 1,
  version: timeStr(),
  trainingPhase: "sft",
  tp: undefined as number | undefined,
  pp: undefined as number | undefined,
  datasetName: "alpaca_zh-llama3-train",
  image:
    "registry.baidubce.com/aihc-aiak/aiak-training-llm:ubuntu22.04-cu12.3-torch2.2.0-py310-bccl1.2.7.2_v2.1.1.5_release",
  mountPath: "/workspace/pfs",
  modelUrl: "",
  datasetUrl: "",
  jsonKeys: "text",
});

const msg = ref("单机训练执行命令生成");

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

// 计算当前数据集选项
const datasetOptions = computed(() => {
  if (formModel.trainingPhase === "pretrain") {
    return pretrainDatasets;
  } else if (formModel.trainingPhase === "sft") {
    return sftDatasets;
  } else {
    return [];
  }
});

// 监听 trainingPhase 变化，重置 datasetName
watch(
  () => formModel.trainingPhase,
  (newPhase) => {
    if (newPhase === "pretrain") {
      formModel.datasetName = pretrainDatasets[0];
    } else if (newPhase === "sft") {
      formModel.datasetName = sftDatasets[0];
    } else {
      formModel.datasetName = "";
    }
  }
);

watch(
  () => formModel.modelName,
  (newName) => {
    formModel.replicas = getReplicas(newName);
  }
);

// 定义表单验证规则
const rules: FormRules = {
  modelName: [{ required: true, message: "请选择模型名称", trigger: "blur" }],
  replicas: [
    { required: false, message: "请输入训练机数", trigger: "blur" },
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
      const aiakJobConfig = {
        MODEL_NAME: formModel.modelName,
        REPLICAS: formModel.replicas,
        VERSION: formModel.version,
        TRAINING_PHASE: formModel.trainingPhase,
        TP: formModel.tp,
        PP: formModel.pp,
        DATASET_NAME: formModel.datasetName,
        IMAGE: formModel.image,
        MOUNT_PATH: formModel.mountPath,
        MODEL_URL: formModel.modelUrl,
        DATASET_URL: formModel.datasetUrl,
        JSON_KEYS: formModel.jsonKeys,
      };

      try {
        const job_sh = generateAiakParameter(aiakJobConfig);
        console.log(job_sh);
        generatedParams.value = job_sh; // 格式化显示
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
    formModel.version = timeStr(); // 重置版本号
    ElMessage.success("表单已重置");
  }
};
</script>

<style>
.ep-button {
  margin: 4px;
}

.ep-button + .ep-button {
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
