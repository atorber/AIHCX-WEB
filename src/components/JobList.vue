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
    <!-- 刷新 -->
    <el-button
      :disabled="!resourcePoolId"
      type="primary"
      :loading="isLoading"
      @click="refreshJobs"
      :icon="Refresh"
      >刷新</el-button
    >
    <el-select
      v-model="resourcePoolId"
      placeholder="Select"
      style="width: 240px"
      @change="refreshJobs"
    >
      <el-option
        v-for="item in resourcepoolList"
        :key="item.metadata.id"
        :label="item.metadata.name"
        :value="item.metadata.id"
      >
        <span style="float: left">{{ item.metadata.name }}</span>
        <span
          style="
            float: right;
            color: var(--el-text-color-secondary);
            font-size: 13px;
          "
        >
          {{ item.metadata.id }}
        </span>
      </el-option>
    </el-select>
    <el-table
      highlight-current-row
      :data="jobList"
      :border="parentBorder"
      style="width: 100%"
      v-loading="isLoading"
    >
      <el-table-column type="expand">
        <template #default="props">
          <div m="4">
            <div>
              <el-row :gutter="20">
                <el-col :span="8">任务名称: {{ props.row.name }}</el-col>
                <el-col :span="8">运行状态: {{ props.row.status }}</el-col>
                <el-col :span="8">优先级: {{ props.row.priority }}</el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="8">
                  <div class="grid-content ep-bg-purple">
                    资源池ID: {{ props.row.resourcePoolId }}
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="grid-content ep-bg-purple">
                    队列: {{ props.row.queue }}
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="grid-content ep-bg-purple">
                    创建时间: {{ props.row.createdAt }}
                  </div>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="24">镜像地址：{{ props.row.image }}</el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="2">执行命令：</el-col>
                <el-col :span="22">
                  <el-card class="box-card" style="margin-top: 20px">
                    <pre class="pre-wrap">{{ props.row.command }}</pre>
                  </el-card></el-col
                >
              </el-row>
            </div>
            <h3>环境变量</h3>
            <el-table :data="props.row.envs" :border="childBorder">
              <el-table-column label="键" prop="name" />
              <el-table-column label="值" prop="value" />
            </el-table>

            <h3>标签</h3>
            <el-table :data="props.row.labels" :border="childBorder">
              <el-table-column label="键" prop="key" />
              <el-table-column label="值" prop="value" />
            </el-table>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="任务名称" prop="name" />
      <el-table-column label="状态" prop="status" />
      <el-table-column label="优先级" prop="priority" />
      <el-table-column label="资源池ID" prop="resourcePoolId" />
      <el-table-column label="队列" prop="queue" />
      <el-table-column label="创建时间" prop="createdAt" />
      <el-table-column label="结束时间" prop="finishedAt" />
    </el-table>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import axios from "axios";
import { ElMessage } from "element-plus";
import { Refresh } from "@element-plus/icons-vue";
import { useStore } from "../store"; // 确保从 vuex 导入 useStore
import { ActionTypes } from "../store/mutation-types";
import { ResourcePool, Job } from "../store/types";

const store = useStore();

const resourcePoolId = ref("");
const msg = ref("任务列表");
const parentBorder = ref(false);
const childBorder = ref(false);
const isLoading = ref(false);

// 从 store 中获取 jobList
const jobList = computed<Job[]>(() => store.getters.jobList);
const resourcepoolList = computed<ResourcePool[]>(
  () => store.getters.resourcepoolList
);

// 获取资源池列表的 Action
const fetchResourcePools = async () => {
  try {
    isLoading.value = true;
    await store.dispatch(ActionTypes.FETCH_RESOURCEPOOLS);
    if (resourcepoolList.value.length > 0) {
      resourcePoolId.value = resourcepoolList.value[0].metadata.id;
      refreshJobs();
    }
  } catch (error) {
    console.error("Error fetching resource pools:", error);
    ElMessage.error("获取资源池失败");
  } finally {
    isLoading.value = false;
  }
};

// 刷新任务列表
const refreshJobs = async () => {
  if (resourcePoolId.value) {
    try {
      isLoading.value = true;
      await store.dispatch(ActionTypes.FETCH_JOBS, resourcePoolId.value);
    } catch (error) {
      console.error("Error refreshing jobs:", error);
      ElMessage.error("刷新任务失败");
    } finally {
      isLoading.value = false;
    }
  }
};

fetchResourcePools();

// 统一获取 API Key 和 Region
const getAPIConfig = () => {
  const ak = localStorage.getItem("ak") || "";
  const sk = localStorage.getItem("sk") || "";
  const region = localStorage.getItem("region") || "bj";
  if (!ak || !sk || !region) {
    ElMessage.warning("在系统设置中配置API Key");
    return null;
  }
  return { ak, sk, region };
};

const copyJob = (id: string) => {
  const apiConfig = getAPIConfig();
  if (!apiConfig) return;
  const { ak, sk, region } = apiConfig;
  const body = {
    queue: "default",
    priority: "normal",
    jobFramework: "PyTorchJob",
    name: "test-api-llama2-7b-4",
    jobSpec: {
      command: "sleep 3d",
      image:
        "registry.baidubce.com/aihc-aiak/aiak-megatron:ubuntu20.04-cu11.8-torch1.14.0-py38_v1.2.7.12_release",
      replicas: 1,
      resources: [
        {
          name: "baidu.com/a800_80g_cgpu",
          quantity: 8,
        },
      ],
      enableRDMA: true,
      envs: [
        {
          name: "CUDA_DEVICE_MAX_CONNECTIONS",
          value: "1",
        },
      ],
    },
    datasources: [
      {
        type: "pfs",
        name: "pfs-oYQuh4",
        sourcePath: "/",
        mountPath: "/mnt/cluster",
      },
    ],
  };
  try {
    axios.post(
      `https://6d6q5xfg0drsm.cfc-execute.bj.baidubce.com/api/v1/aijobs`,
      body,
      {
        params: {
          resourcePoolId: id,
        },
        headers: {
          ak,
          sk,
          apihost: `aihc.${region}.baidubce.com`,
        },
      }
    );
  } catch (error) {
    console.error("Error copying job:", error);
    ElMessage.error("复制任务失败");
  }
};
</script>

<style>
.el-row {
  margin-bottom: 20px;
}
.el-row:last-child {
  margin-bottom: 0;
}
.el-col {
  border-radius: 4px;
  min-height: 48px;
  line-height: 36px;
  padding: 20px;
  margin-bottom: 20px;
}

.grid-content {
  border-radius: 4px;
  min-height: 36px;
}
</style>
