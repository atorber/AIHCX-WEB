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
      :disabled="resourcePoolId === ''"
      type="primary"
      :loading="isLoading"
      @click="getJobs"
      :icon="Refresh"
      >刷新</el-button
    >
    <el-select
      v-model="resourcePoolId"
      placeholder="Select"
      style="width: 240px"
      @change="getJobs"
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
      <!-- <el-table-column label="开始时间" prop="runningAt" /> -->
      <el-table-column label="结束时间" prop="finishedAt" />
    </el-table>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { Refresh } from "@element-plus/icons-vue";

const resourcePoolId = ref("");

const msg = ref("任务列表");
const parentBorder = ref(false);
const childBorder = ref(false);
const tableData: any[] = [];
const jobList = ref(tableData);
const isLoading = ref(false);
const resourcepoolsData: any[] = [];
const resourcepoolList = ref(resourcepoolsData);

const getResourcepools = () => {
  const ak = localStorage.getItem("ak") || "";
  const sk = localStorage.getItem("sk") || "";
  const region = localStorage.getItem("region") || "bj";
  if (!ak || !sk || !region) {
    console.info("ak, sk, region is required");
    ElMessage.warning("在系统设置中配置API Key");
  } else {
    // isLoading.value = true;
    fetch(
      `https://6d6q5xfg0drsm.cfc-execute.bj.baidubce.com/api/v1/resourcepools?ak=${ak}&sk=${sk}&host=aihc.${region}.baidubce.com`
    )
      .then((res) => res.json())
      .then((data) => {
        // console.log(data);
        const { result } = data;
        // console.log(result);
        const { resourcePools } = result;
        // console.log(resourcePools);
        resourcepoolList.value = resourcePools;
        isLoading.value = false;
        resourcePoolId.value = resourcePools[0].metadata.id;
        getJobs(resourcePoolId.value);
      });
  }
};
getResourcepools();

const getJobs = (id: string) => {
  const ak = localStorage.getItem("ak") || "";
  const sk = localStorage.getItem("sk") || "";
  const region = localStorage.getItem("region") || "bj";
  if (!ak || !sk || !region) {
    console.info("ak, sk, region is required");
    ElMessage.warning("在系统设置中配置API Key");
  } else {
    isLoading.value = true;
    fetch(
      `https://6d6q5xfg0drsm.cfc-execute.bj.baidubce.com/api/v1/aijobs?ak=${ak}&sk=${sk}&host=aihc.${region}.baidubce.com&resourcePoolId=${id}`
    )
      .then((res) => res.json())
      .then((data) => {
        // console.log(data);
        const { result } = data;
        const { jobs } = result;
        // console.log(jobs);
        jobList.value = jobs;
        isLoading.value = false;
      });
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
