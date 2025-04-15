<template>
  <div style="
      padding: 0px 20px;
      max-width: 1200px;
      margin: 0 auto;
      text-align: left;
    ">
    <h1 color="$ep-color-primary" style="font-size: 24px; font-weight: 600; margin-bottom: 8px;">任务命令&参数生成器</h1>
    <div style="color: var(--el-text-color-regular); font-size: 14px; margin-bottom: 24px;">
      表单化填写任务信息，一键生成任务CLI命令和OpenAPI请求参数
    </div>
    
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px" style="margin: 20px">
      <!-- 基本信息 -->
      <div class="section-title">
        基本信息
      </div>

      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="任务名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入任务名称" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="资源池" prop="resourcePoolId">
            <el-select v-model="formData.resourcePoolId" placeholder="请选择资源池" style="width: 100%"
              @change="onResourcePoolChange">
              <el-option v-for="pool in resourcePools" :key="pool.id" :label="pool.name" :value="pool.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="队列" prop="queue">
            <el-select v-model="formData.queue" placeholder="请选择队列" style="width: 100%" :loading="queuesLoading"
              @change="onQueueChange">
              <el-option v-for="queue in queues" :key="queue.id" :label="queue.name" :value="queue.name" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="优先级">
            <el-select v-model="formData.priority" placeholder="请选择优先级" style="width: 100%">
              <el-option label="高" value="high" />
              <el-option label="中" value="normal" />
              <el-option label="低" value="low" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 资源配置 -->
      <div class="section-title">
        资源配置
      </div>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="副本数" prop="jobSpec.replicas">
            <el-input-number v-model="formData.jobSpec.replicas" :min="1" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="GPU资源">
            <el-select v-model="formData.jobSpec.resources[0].name" placeholder="请选择GPU型号" style="width: 100%">
              <el-option v-for="gpu in gpus" :key="gpu.id" :label="gpu.name" :value="gpu.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="GPU数量">
            <el-input-number v-model="formData.jobSpec.resources[0].quantity" :min="1" :max="8" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="CPU资源">
            <el-input-number v-model="formData.jobSpec.resources[1].quantity" :min="1" placeholder="CPU核数"
              style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="内存资源">
            <el-input-number v-model="formData.jobSpec.resources[2].quantity" :min="1" placeholder="内存大小(GB)"
              style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 数据源配置 -->
      <div class="section-title">
        数据源
      </div>

      <el-form-item label="数据源">
        <el-button type="primary" style="margin-bottom: 16px" @click="addDataSource">
          添加数据源
        </el-button>

        <div v-for="(ds, index) in formData.datasources" :key="index" class="config-item">
          <el-row :gutter="24" style="margin-bottom: 16px">
            <el-col :span="6">
              <el-form-item label="类型" label-width="60px" style="margin-bottom: 0">
                <el-select v-model="ds.type" placeholder="请选择类型">
                  <el-option label="PFS" value="pfs" />
                  <el-option label="HostPath" value="hostPath" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="名称" label-width="60px" style="margin-bottom: 0">
                <el-input v-model="ds.name" placeholder="数据源名称" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="源路径" label-width="60px" style="margin-bottom: 0">
                <el-input v-model="ds.sourcePath" placeholder="/" />
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-form-item label="挂载路径" label-width="70px" style="margin-bottom: 0">
                <el-input v-model="ds.mountPath" placeholder="容器内" />
              </el-form-item>
            </el-col>
            <el-col :span="2" style="display: flex; align-items: center; justify-content: flex-end">
              <el-button type="danger" link @click="removeDataSource(index)">
                删除
              </el-button>
            </el-col>
          </el-row>
        </div>
      </el-form-item>

      <!-- 启动配置 -->
      <div class="section-title">
        启动配置
      </div>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="镜像地址" prop="jobSpec.image">
            <el-input v-model="formData.jobSpec.image" placeholder="请输入镜像地址，需要包含tag" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="私有镜像用户名">
            <el-input v-model="formData.jobSpec.imageConfig.username" placeholder="私有镜像仓库用户名" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="私有镜像密码">
            <el-input v-model="formData.jobSpec.imageConfig.password" type="password" placeholder="私有镜像仓库密码"
              show-password />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="环境变量">
        <el-button type="primary" style="margin-bottom: 16px" @click="addEnv">
          添加环境变量
        </el-button>
        <div v-if="formData.jobSpec.envs.length > 0" style="width: 100%;">
          <div v-for="(env, index) in formData.jobSpec.envs" :key="index" class="config-item">
            <el-row :gutter="24" style="margin-bottom: 16px">
              <el-col :span="10">
                <el-form-item label="变量名" label-width="60px" style="margin-bottom: 0">
                  <el-input v-model="env.name" placeholder="变量名" />
                </el-form-item>
              </el-col>
              <el-col :span="10">
                <el-form-item label="变量值" label-width="60px" style="margin-bottom: 0">
                  <el-input v-model="env.value" placeholder="变量值" />
                </el-form-item>
              </el-col>
              <el-col :span="4" style="display: flex; align-items: center; justify-content: flex-end">
                <el-button type="danger" link @click="removeEnv(index)">
                  删除
                </el-button>
              </el-col>
            </el-row>
          </div>
        </div>
      </el-form-item>

      <el-form-item label="启动命令" prop="jobSpec.command" required>
        <el-input v-model="formData.jobSpec.command" type="textarea" :rows="8" placeholder="请输入启动命令" />
      </el-form-item>

      <!-- 高级配置 -->
      <div class="section-title">
        高级配置
      </div>

      <div class="config-section">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开启RDMA">
              <el-switch v-model="formData.jobSpec.enableRDMA" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="开启BCCL">
              <el-switch v-model="formData.enableBccl" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="开启容错">
              <el-switch v-model="formData.faultTolerance" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="formData.faultTolerance" :gutter="20">
          <el-col :span="8">
            <el-form-item label="开启hang检测">
              <el-switch v-model="formData.faultToleranceConfig.enabledHangDetection" />
            </el-form-item>
          </el-col>
          <el-col v-if="formData.faultToleranceConfig.enabledHangDetection" :span="8">
            <el-form-item label="超时时间">
              <el-input-number v-model="formData.faultToleranceConfig.hangDetectionTimeoutMinutes" :min="1"
                style="width: 100%" placeholder="请输入超时时间(分钟)" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="Tensorboard">
              <el-switch v-model="formData.tensorboardConfig.enableTensorboard" />
            </el-form-item>
          </el-col>
          <el-col v-if="formData.tensorboardConfig.enableTensorboard" :span="16">
            <el-form-item label="日志路径">
              <el-input v-model="formData.tensorboardConfig.logPath" placeholder="请输入Tensorboard日志路径" />
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <el-form-item>
        <el-button type="info" @click="showRequestParams('json')">
          生成JSON请求参数
        </el-button>
        <el-button type="warning" @click="showRequestParams('yaml')">
          生成YAML请求参数
        </el-button>
        <el-button type="success" @click="generateCLI">
          生成CLI命令
        </el-button>
        <el-button disabled type="primary" @click="submitForm">
          提交任务
        </el-button>
        <el-button @click="resetForm">
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <!-- CLI命令抽屉 -->
    <el-drawer v-model="cliDrawerVisible" title="CLI命令" direction="rtl" size="60%">
      <div class="section-title">
        直接传参方式
      </div>
      <div class="cli-command">
        <pre><code>{{ cliCommand }}</code></pre>
        <div class="command-actions">
          <el-button type="primary" size="small" @click="copyCLICommand('direct')">
            复制命令
          </el-button>
        </div>
      </div>
      <div class="section-title">
        JSON文件传参方式
      </div>
      <div class="cli-command">
        <pre><code>{{ cliCommandJSONFile }}</code></pre>
        <div class="command-actions">
          <el-button type="primary" size="small" @click="copyCLICommand('json')">
            复制命令
          </el-button>
        </div>
      </div>
      <div class="section-title">
        YAML文件传参方式
      </div>
      <div class="cli-command">
        <pre><code>{{ cliCommandYAMLFile }}</code></pre>
        <div class="command-actions">
          <el-button type="primary" size="small" @click="copyCLICommand('yaml')">
            复制命令
          </el-button>
        </div>
      </div>
      <template #footer>
        <div style="flex: auto">
          <el-button @click="cliDrawerVisible = false">
            关闭
          </el-button>
        </div>
      </template>
    </el-drawer>

    <!-- 请求参数抽屉 -->
    <el-drawer v-model="requestParamsDrawerVisible" :title="requestParamsTitle" direction="rtl" size="60%">
      <div class="request-params">
        <pre>
      <code v-if="requestParamsTitle === 'YAML请求参数'" class="language-yaml">{{ requestParams }}</code>
      <code v-else class="language-json">{{ requestParams }}</code>
    </pre>
      </div>
      <template #footer>
        <div style="flex: auto">
          <el-button type="primary" @click="copyRequestParams">
            复制参数
          </el-button>
          <el-button type="success" @click="saveRequestParams">
            保存为文件
          </el-button>
          <el-button @click="requestParamsDrawerVisible = false">
            关闭
          </el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, nextTick, computed } from 'vue';
import { ElMessage, FormInstance } from 'element-plus';
import yaml from 'js-yaml';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import { ServeGetResourceQueues, ServeGetResourcePools } from '../api/resourcePools';
import { useStore } from "../store"; // 确保从 vuex 导入 useStore
import { ActionTypes } from "../store/mutation-types";
import { ResourcePool, Job } from "../store/types";
const store = useStore();
const formRef = ref<FormInstance>();

const resourcepoolList = computed<ResourcePool[]>(() => store.getters.resourcepoolList);
const resourcePools = ref<{ id: string; name: string }[]>([]);
const resourcePoolsLoading = ref(false);

const gpus = ref<{ id: string; name: string; quantity: number }[]>([]);
const gpusLoading = ref(false);

const queues = ref<{ id: string; name: string; gpus: any }[]>([]);
const queuesLoading = ref(false);

const formData = reactive({
  resourcePoolId: '',
  name: '',
  queue: 'default',
  jobFramework: 'PyTorchJob',
  jobSpec: {
    image: '',
    imageConfig: {
      username: '',
      password: '',
    },
    replicas: 1,
    command: '',
    resources: [
      { name: '', quantity: 1 },
      { name: 'cpu', quantity: 1 },
      { name: 'memory', quantity: 1 },
    ],
    envs: [] as { name: string; value: string }[],
    enableRDMA: false,
  },
  datasources: [] as { type: string; name: string; sourcePath: string; mountPath: string }[],
  enableBccl: false,
  faultTolerance: false,
  faultToleranceConfig: {
    enabledHangDetection: false,
    hangDetectionTimeoutMinutes: 30,
  },
  tensorboardConfig: {
    enableTensorboard: false,
    logPath: '',
  },
  priority: 'normal',
  labels: [],
});

const updateResourcePools = async () => {
  resourcePoolsLoading.value = true;
  const pools = resourcepoolList.value;
  resourcePools.value = pools.map((pool) => ({
    id: pool.metadata.id,
    name: pool.metadata.name,
  }));
  console.log('resourcePools', resourcePools.value);
  if (resourcePools.value.length > 0) {
    formData.resourcePoolId = resourcePools.value[0].id;
  }
  resourcePoolsLoading.value = false;
};

updateResourcePools();

const updateQueueList = async (resourcePoolId: string) => {
  if (!resourcePoolId) return;
  queuesLoading.value = true;
  try {
    const res: any = await ServeGetResourceQueues({ resourcePoolId });
    console.log('res', res);
    const queueList = res.resourceQueues || [];
    queues.value = queueList.map((queue: any) => ({
      id: queue.name,
      name: queue.name,
      gpus: queue.allocated || queue.capability || {},
    }));
    // 如果队列列表不为空，设置默认选中第一个队列
    if (queues.value.length > 0) {
      formData.queue = queues.value[0].name;
      gpus.value = getGpuList(queues.value[0].gpus);
      console.log('gpus.value', gpus.value);
      if (gpus.value.length > 0) {
        formData.jobSpec.resources[0].name = gpus.value[0].id;
      }
    }
    console.log('queues', queues.value);
  } catch (error) {
    console.error('获取队列列表失败:', error);
    ElMessage.error('获取队列列表失败');
  } finally {
    queuesLoading.value = false;
  }
};

const getGpuList = (allocated: any): { id: string; name: string; quantity: number }[] => {
  console.log('allocated', allocated);
  if (!allocated) return [];
  return Object.keys(allocated)
    .filter((key) => key.startsWith('kunlunxin.com') || key.startsWith('baidu.com'))
    .map((key) => ({
      name: key,
      id: key,
      quantity: allocated[key] || 0,
    }));
};

const onResourcePoolChange = async (poolId: string) => {
  console.log('poolId', poolId);
  formData.queue = '';
  await updateQueueList(poolId);
};

const onQueueChange = async (queue: string) => {
  console.log('queue', queue);
  const queueItem = queues.value.find((q) => q.name === queue);
  console.log('queueItem', queueItem);
  gpus.value = getGpuList(queueItem?.gpus);
  console.log('gpus.value', gpus.value);
  if (gpus.value.length > 0) {
    formData.jobSpec.resources[0].name = gpus.value[0].id;
  }
};

const rules = {
  resourcePoolId: [{ required: true, message: '请选择资源池', trigger: 'change' }],
  name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  'jobSpec.image': [{ required: true, message: '请输入镜像地址', trigger: 'blur' }],
  'jobSpec.replicas': [{ required: true, message: '请输入副本数', trigger: 'blur' }],
  'jobSpec.command': [{ required: true, message: '请输入启动命令', trigger: 'blur' }],
  'jobSpec.resources.0.quantity': [{ required: true, message: '请选择GPU数量', trigger: 'blur' }],
  'jobSpec.resources.1.quantity': [{ required: true, message: '请输入CPU核数', trigger: 'blur' }],
  'jobSpec.resources.2.quantity': [{ required: true, message: '请输入内存大小', trigger: 'blur' }],
};

const addDataSource = () => {
  formData.datasources.push({
    type: 'pfs',
    name: '',
    sourcePath: '/',
    mountPath: '',
  });
};

const removeDataSource = (index: number) => {
  formData.datasources.splice(index, 1);
};

const addEnv = () => {
  formData.jobSpec.envs.push({
    name: '',
    value: '',
  });
};

const removeEnv = (index: number) => {
  formData.jobSpec.envs.splice(index, 1);
};

const submitForm = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    // TODO: 调用创建训练任务的API
    ElMessage.success('提交成功');
  } catch (error) {
    ElMessage.error('表单验证失败');
  }
};

const resetForm = () => {
  if (!formRef.value) return;
  formRef.value.resetFields();
};

const cliDrawerVisible = ref(false);
const requestParamsDrawerVisible = ref(false);
const cliCommand = ref('');
const cliCommandJSONFile = ref('');
const cliCommandYAMLFile = ref('');
const requestParams = ref('');
const requestParamsTitle = ref('请求参数');

const showRequestParams = async (format: 'json' | 'yaml') => {
  if (!formRef.value) return;

  try {
    // 先校验表单
    await formRef.value.validate();

    const paramsToShare = {
      name: formData.name,
      queue: formData.queue,
      jobFramework: formData.jobFramework,
      jobSpec: {
        image: formData.jobSpec.image,
        imageConfig: {
          username: formData.jobSpec.imageConfig.username,
          password: formData.jobSpec.imageConfig.password,
        },
        replicas: formData.jobSpec.replicas,
        command: formData.jobSpec.command,
        resources: formData.jobSpec.resources,
        envs: formData.jobSpec.envs,
        enableRDMA: formData.jobSpec.enableRDMA,
      },
      datasources: formData.datasources,
      enableBccl: formData.enableBccl,
      faultTolerance: formData.faultTolerance,
      faultToleranceConfig: formData.faultToleranceConfig,
      tensorboardConfig: formData.tensorboardConfig,
      priority: formData.priority,
      labels: formData.labels,
    };

    if (format === 'yaml') {
      requestParamsTitle.value = 'YAML请求参数';
      requestParams.value = yaml.dump(paramsToShare, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
        noCompatMode: true,
      });
    } else {
      requestParamsTitle.value = 'JSON请求参数';
      requestParams.value = JSON.stringify(paramsToShare, null, 2);
    }

    requestParamsDrawerVisible.value = true;
    // 等待DOM更新后执行高亮
    await nextTick();
    const codeBlocks = document.querySelectorAll('pre code');
    codeBlocks.forEach((block) => {
      hljs.highlightElement(block as HTMLElement);
    });
  } catch (error: any) {
    if (error.message) {
      ElMessage.error(`生成请求参数失败: ${error.message}`);
    } else {
      ElMessage.error('请填写所有必填项后再生成请求参数');
    }
    console.error('生成请求参数失败:', error);
  }
};

const copyRequestParams = async () => {
  try {
    await navigator.clipboard.writeText(requestParams.value);
    ElMessage.success('请求参数已复制到剪贴板');
  } catch (error) {
    ElMessage.error('复制失败');
    console.error('复制失败:', error);
  }
};

const generateCLI = async () => {
  if (!formRef.value) return;

  try {
    // 先校验表单
    await formRef.value.validate();

    // 构建命令参数
    const params = [];

    // 基本参数
    params.push(`--name "${formData.name}"`);
    params.push(`--queue "${formData.queue}"`);
    params.push(`--framework "${formData.jobFramework}"`);
    params.push(`--priority "${formData.priority}"`);

    // JobSpec参数
    params.push(`--image "${formData.jobSpec.image}"`);
    if (formData.jobSpec.imageConfig.username && formData.jobSpec.imageConfig.password) {
      params.push(`--image-username "${formData.jobSpec.imageConfig.username}"`);
      params.push(`--image-password "${formData.jobSpec.imageConfig.password}"`);
    }
    params.push(`--replicas ${formData.jobSpec.replicas}`);
    params.push(`--command "${formData.jobSpec.command}"`);

    // 资源配置
    formData.jobSpec.resources.forEach((res) => {
      if (res.name === 'baidu.com/a800_80g_cgpu') {
        params.push(`--gpu-type "${res.name}"`);
        params.push(`--gpu-count ${res.quantity}`);
      } else if (res.name === 'cpu') {
        params.push(`--cpu ${res.quantity}`);
      } else if (res.name === 'memory') {
        params.push(`--memory ${res.quantity}`);
      }
    });

    // 数据源配置
    formData.datasources.forEach((ds) => {
      params.push(`--data-source "${ds.type}:${ds.name}:${ds.sourcePath}:${ds.mountPath}"`);
    });

    // 环境变量
    formData.jobSpec.envs.forEach((env) => {
      params.push(`--env "${env.name}=${env.value}"`);
    });

    // 功能开关
    if (formData.jobSpec.enableRDMA) params.push('--enable-rdma');
    if (formData.enableBccl) params.push('--enable-bccl');
    if (formData.faultTolerance) {
      params.push('--enable-fault-tolerance');
      if (formData.faultToleranceConfig.enabledHangDetection) {
        params.push('--enable-hang-detection');
        params.push(`--hang-detection-timeout ${formData.faultToleranceConfig.hangDetectionTimeoutMinutes}`);
      }
    }
    if (formData.tensorboardConfig.enableTensorboard) {
      params.push('--enable-tensorboard');
      params.push(`--tensorboard-log-path "${formData.tensorboardConfig.logPath}"`);
    }

    // 生成完整命令
    cliCommand.value = `aihc job create ${params.join(' ')}`;
    cliCommandJSONFile.value = `aihc job create --file ${formData.name}.json`;
    cliCommandYAMLFile.value = `aihc job create --file ${formData.name}.yaml`;
    cliDrawerVisible.value = true;
    // 等待DOM更新后执行高亮
    await nextTick();
    const codeBlocks = document.querySelectorAll('pre code');
    codeBlocks.forEach((block: any) => {
      hljs.highlightElement(block);
    });
  } catch (error: any) {
    if (error.message) {
      ElMessage.error(`生成CLI命令失败: ${error.message}`);
    } else {
      ElMessage.error('请填写所有必填项后再生成CLI命令');
    }
    console.error('生成CLI命令失败:', error);
  }
};

const copyCLICommand = async (type: 'direct' | 'json' | 'yaml') => {
  try {
    let commandToCopy = '';
    switch (type) {
      case 'direct':
        commandToCopy = cliCommand.value;
        break;
      case 'json':
        commandToCopy = cliCommandJSONFile.value;
        break;
      case 'yaml':
        commandToCopy = cliCommandYAMLFile.value;
        break;
    }
    await navigator.clipboard.writeText(commandToCopy);
    ElMessage.success('命令已复制到剪贴板');
  } catch (error) {
    ElMessage.error('复制失败');
    console.error('复制失败:', error);
  }
};

const saveRequestParams = () => {
  try {
    const extension = requestParamsTitle.value === 'YAML请求参数' ? 'yaml' : 'json';
    const fileName = `${formData.name || 'request_params'}.${extension}`;
    const blob = new Blob([requestParams.value], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    ElMessage.success('文件保存成功');
  } catch (error) {
    ElMessage.error('文件保存失败');
    console.error('保存文件失败:', error);
  }
};
</script>

<style scoped>
.layout-container-demo {
  background-color: var(--el-bg-color);
}

.el-header {
  position: relative;
  background-color: var(--el-color-primary-light-7);
  color: var(--el-text-color-primary);
}

.el-main {
  padding: 0;
  min-height: 768px;
}

.toolbar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  right: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin: 24px 0 16px;
  color: var(--el-text-color-primary);
  border-bottom: 1px solid var(--el-border-color-light);
  padding-bottom: 8px;
  text-align: left;
  padding-left: 8px;
}

.sub-section-title {
  font-size: 14px;
  font-weight: 500;
  margin: 16px 0 12px;
  color: var(--el-text-color-regular);
  padding-left: 8px;
  border-left: 3px solid var(--el-color-primary);
}

.config-section {
  margin: 16px 0;
  padding: 16px;
  background-color: var(--el-fill-color-blank);
  border-radius: 4px;
  /* border: 1px solid var(--el-border-color-lighter); */
}

.config-item {
  margin: 8px 0;
  padding: 16px;
  background-color: var(--el-fill-color-blank);
  border-radius: 4px;
  border: 1px solid var(--el-border-color-lighter);
}

:deep(.el-select),
:deep(.el-input),
:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-form-item__label) {
  font-weight: normal;
  color: var(--el-text-color-regular);
}

:deep(.el-button) {
  padding: 8px 16px;
}

:deep(.el-button.el-button--danger.is-link) {
  height: 32px;
  padding: 8px;
}

:deep(.el-form-item.is-required > .el-form-item__label::before) {
  margin-right: 2px;
}

.cli-command,
.request-params {
  background-color: var(--el-fill-color-darker);
  border-radius: 4px;
  padding: 16px;
  margin: 8px 0;
  text-align: left;
}

.cli-command pre,
.request-params pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.cli-command code,
.request-params code {
  font-family: Monaco, Menlo, Consolas, "Courier New", monospace;
  font-size: 14px;
  line-height: 1.5;
  color: var(--el-text-color-regular);
}

/* JSON 样式 */
:deep(.language-json) {
  color: #24292e;
}

:deep(.language-json .token.string) {
  color: #032f62;
}

:deep(.language-json .token.number) {
  color: #005cc5;
}

:deep(.language-json .token.boolean) {
  color: #005cc5;
}

:deep(.language-json .token.null) {
  color: #005cc5;
}

:deep(.language-json .token.keyword) {
  color: #d73a49;
}

/* YAML 样式 */
:deep(.language-yaml) {
  color: #24292e;
}

:deep(.language-yaml .token.string) {
  color: #032f62;
}

:deep(.language-yaml .token.number) {
  color: #005cc5;
}

:deep(.language-yaml .token.boolean) {
  color: #005cc5;
}

:deep(.language-yaml .token.keyword) {
  color: #d73a49;
}

:deep(.language-yaml .token.punctuation) {
  color: #24292e;
}

:deep(.language-yaml .token.comment) {
  color: #6a737d;
}

:deep(.language-yaml .token.property) {
  color: #6f42c1;
}

:deep(.el-drawer__body) {
  padding: 20px;
}

:deep(.el-drawer__footer) {
  padding: 20px;
  border-top: 1px solid var(--el-border-color-lighter);
}

:deep(.el-drawer__header) {
  text-align: left;
  padding: 20px;
  margin-bottom: 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

:deep(.el-drawer__title) {
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

:deep(.hljs) {
  background: transparent;
  padding: 0;
}

:deep(.hljs-string) {
  color: #032f62;
}

:deep(.hljs-number) {
  color: #005cc5;
}

:deep(.hljs-literal) {
  color: #005cc5;
}

:deep(.hljs-keyword) {
  color: #d73a49;
}

:deep(.hljs-comment) {
  color: #6a737d;
}

:deep(.hljs-attr) {
  color: #6f42c1;
}

:deep(.hljs-punctuation) {
  color: #24292e;
}

.command-actions {
  margin-top: 8px;
  text-align: right;
}
</style>
