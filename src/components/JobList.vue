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
    <!-- 操作栏 -->
    <div class="operation-bar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索任务名称"
        class="search-input"
        clearable
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      
      <div class="operation-right">
        <el-button
          :disabled="!resourcePoolId"
          type="primary"
          :loading="isLoading"
          @click="refreshJobs"
          :icon="Refresh"
        >刷新</el-button>
        
        <el-select
          v-model="resourcePoolId"
          placeholder="Select"
          style="width: 240px"
          @change="handleResourcePoolChange"
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
      </div>
    </div>
    <el-table
      highlight-current-row
      :data="jobList"
      :border="parentBorder"
      style="width: 100%"
      v-loading="isLoading"
      row-key="jobId"
      @expand-change="handleExpand"
    >
    <el-table-column type="expand">
        <template #default="props">
          <div v-loading="loadingPodDetails[props.row.jobId]" class="pod-list-container">
            <el-table
              v-if="podDetails[props.row.jobId]?.length"
              :data="podDetails[props.row.jobId]"
              style="width: 100%"
              :border="true"
              size="small"
              class="pod-table"
            >
              <el-table-column type="index" label="序号" width="60" />
              <el-table-column label="Pod名称" prop="objectMeta.name" />
              <el-table-column label="Pod IP" prop="PodIP" />
              <el-table-column label="节点名称" prop="nodeName" />
              <el-table-column label="副本类型" prop="replicaType" />
              <el-table-column label="状态" prop="podStatus.status">
                <template #default="scope">
                  <el-tag :type="getPodStatusType(scope.row.podStatus.status)">
                    {{ scope.row.podStatus.status }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="重启次数" prop="restartCount" />
              <el-table-column label="结束时间" prop="finishedAt" />
              <el-table-column label="原因" prop="reason" />
              <el-table-column label="操作" width="120">
                <template #default="scope">
                  <el-button 
                    :disabled="scope.row.podStatus.status !== 'Running'"
                    type="primary" 
                    link 
                    @click="handleWebTerminalUrl(scope.row, { jobId: props.row.jobId })"
                  >连接终端</el-button>
                </template>
              </el-table-column>
            </el-table>
            <div v-else class="no-data">暂无Pod信息</div>
            
            <!-- 在Pod列表下方显示WebTerminal -->
            <div v-if="podDetails[props.row.jobId]?.length" class="terminal-list">
              <div v-for="pod in podDetails[props.row.jobId]" :key="pod.objectMeta.name" class="terminal-item">
                <div v-if="webshellVisible[`${props.row.jobId}-${pod.objectMeta.name}`]" class="terminal-container">
                  <div class="terminal-header">
                    <span>WebShell终端 - {{ pod.objectMeta.name }}</span>
                    <el-button 
                      type="danger" 
                      size="small" 
                      @click="closeTerminal(`${props.row.jobId}-${pod.objectMeta.name}`)"
                    >
                      关闭
                    </el-button>
                  </div>
                  <WebTerminal 
                    v-if="webshellUrl[`${props.row.jobId}-${pod.objectMeta.name}`] && webshellVisible[`${props.row.jobId}-${pod.objectMeta.name}`]" 
                    :socketUrl="webshellUrl[`${props.row.jobId}-${pod.objectMeta.name}`]"
                    :style="{ height: '400px' }"
                    @connect="handleTerminalConnect(`${props.row.jobId}-${pod.objectMeta.name}`)"
                    @disconnect="handleTerminalDisconnect(`${props.row.jobId}-${pod.objectMeta.name}`)"
                    :key="`${props.row.jobId}-${pod.objectMeta.name}-${webshellVisible[`${props.row.jobId}-${pod.objectMeta.name}`]}`"
                  />
                </div>
              </div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="任务名称/ID" min-width="180">
        <template #default="scope">
          <div>
            <div>
              <el-tooltip
                :content="scope.row.name"
                placement="top"
                :show-after="500"
                :hide-after="0"
              >
                <el-link 
                  type="primary" 
                  :underline="false"
                  @click="handleViewDetails(scope.row)"
                  class="job-name"
                >
                  {{ scope.row.name }}
                </el-link>
              </el-tooltip>
            </div>
            <div class="job-id">
              <el-text size="small">{{ scope.row.jobId || '-' }}</el-text>
              <el-button
                v-if="scope.row.jobId"
                type="primary"
                link
                size="small"
                class="copy-button"
                @click.stop="copyToClipboard(scope.row.jobId)"
              >
                <el-icon><CopyDocument /></el-icon>
              </el-button>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="status" />
      <el-table-column label="优先级" prop="priority" />
      <el-table-column label="资源池ID" prop="resourcePoolId" />
      <el-table-column label="队列" prop="queue" />
      <el-table-column label="创建时间" prop="createdAt" />
      <el-table-column label="结束时间" prop="finishedAt" />
      <el-table-column label="原因" prop="reason" />
      <el-table-column label="操作" width="120">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="handleViewDetails(scope.row)"
            >查看详情</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 分页 -->
    <div class="pagination-container" style="margin-top: 20px; display: flex; justify-content: flex-end;">
      <el-pagination
        v-if="totalCount > 0"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="totalCount"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    
    <!-- 任务详情抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      title="任务详情"
      size="50%"
      :with-header="true"
      direction="rtl"
      destroy-on-close
    >
      <div v-if="currentJob" class="drawer-content" v-loading="drawerLoading">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="任务名称">
            <div class="detail-name">{{ currentJob.name }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="任务ID">
            <div style="display: flex; align-items: center;">
              {{ currentJob.jobId || '-' }}
              <el-button
                v-if="currentJob.jobId"
                type="primary"
                link
                size="small"
                class="copy-button"
                @click="copyToClipboard(currentJob.jobId)"
              >
                <el-icon><CopyDocument /></el-icon>
              </el-button>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="运行状态">
            <el-tag :type="getStatusType(currentJob.status)">{{ currentJob.status }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="优先级">{{ currentJob.priority }}</el-descriptions-item>
          <el-descriptions-item label="资源池ID">
            <div style="display: flex; align-items: center;">
              {{ currentJob.resourcePoolId }}
              <el-button
                type="primary"
                link
                size="small"
                class="copy-button"
                @click="copyToClipboard(currentJob.resourcePoolId)"
              >
                <el-icon><CopyDocument /></el-icon>
              </el-button>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="队列">{{ currentJob.queue }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentJob.createdAt || '-' }}</el-descriptions-item>
          <el-descriptions-item label="结束时间">{{ currentJob.finishedAt || '-' }}</el-descriptions-item>
          <el-descriptions-item label="调度时间">{{ currentJob.scheduledAt || '-' }}</el-descriptions-item>
          <el-descriptions-item label="运行时间">{{ currentJob.runningAt || '-' }}</el-descriptions-item>
          <el-descriptions-item label="任务框架" v-if="currentJob.jobFramework">{{ currentJob.jobFramework }}</el-descriptions-item>
          <el-descriptions-item label="副本数" v-if="currentJob.replicas">{{ currentJob.replicas }}</el-descriptions-item>
          <el-descriptions-item label="启用RDMA" v-if="currentJob.enableRDMA !== undefined">
            <el-tag :type="currentJob.enableRDMA ? 'success' : 'info'">
              {{ currentJob.enableRDMA ? '是' : '否' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="主机网络" v-if="currentJob.hostNetwork !== undefined">
            <el-tag :type="currentJob.hostNetwork ? 'success' : 'info'">
              {{ currentJob.hostNetwork ? '是' : '否' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="启用BCCL" v-if="currentJob.enableBccl !== undefined">
            <el-tag :type="currentJob.enableBccl ? 'success' : 'info'">
              {{ currentJob.enableBccl ? '是' : '否' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="BCCL状态" v-if="currentJob.enableBcclStatus">
            <el-tag :type="getBcclStatusType(currentJob.enableBcclStatus)">
              {{ currentJob.enableBcclStatus }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="BCCL错误原因" v-if="currentJob.enableBcclErrorReason">
            {{ currentJob.enableBcclErrorReason }}
          </el-descriptions-item>
          <el-descriptions-item label="K8s UID" v-if="currentJob.k8sUID">
            <div style="display: flex; align-items: center;">
              {{ currentJob.k8sUID }}
              <el-button
                type="primary"
                link
                size="small"
                class="copy-button"
                @click="copyToClipboard(currentJob.k8sUID)"
              >
                <el-icon><CopyDocument /></el-icon>
              </el-button>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="K8s命名空间" v-if="currentJob.k8sNamespace">
            {{ currentJob.k8sNamespace }}
          </el-descriptions-item>
          <el-descriptions-item label="替换结果状态" v-if="currentJob.enableReplaceResult">
            <el-tag :type="getReplaceResultStatusType(currentJob.enableReplaceResult.status)">
              {{ currentJob.enableReplaceResult.status }}
            </el-tag>
            <span v-if="currentJob.enableReplaceResult.message" style="margin-left: 10px; color: #909399;">
              {{ currentJob.enableReplaceResult.message }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="启用容错" v-if="currentJob.enableFaultTolerance !== undefined">
            <el-tag :type="currentJob.enableFaultTolerance ? 'success' : 'info'">
              {{ currentJob.enableFaultTolerance ? '是' : '否' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
        
        <div style="margin-top: 20px" v-if="currentJob.image">
          <h4>镜像地址</h4>
          <el-card class="box-card">
            {{ currentJob.image }}
          </el-card>
        </div>
        
        <div style="margin-top: 20px" v-if="currentJob.command">
          <h4>执行命令</h4>
          <el-card class="box-card">
            <pre class="pre-wrap">{{ currentJob.command }}</pre>
          </el-card>
        </div>
        
        <div style="margin-top: 20px" v-if="currentJob.resources && currentJob.resources.length > 0">
          <h4>资源需求</h4>
          <el-table :data="currentJob.resources" border>
            <el-table-column label="资源名称" prop="name" />
            <el-table-column label="数量" prop="quantity" />
          </el-table>
        </div>

        <div style="margin-top: 20px" v-if="currentJob.datasources && currentJob.datasources.length > 0">
          <h4>数据源</h4>
          <el-table :data="currentJob.datasources" border>
            <el-table-column label="类型" prop="type" />
            <el-table-column label="名称" prop="name" />
            <el-table-column label="挂载路径" prop="mountPath" />
            <el-table-column label="源路径" prop="sourcePath" />
            <el-table-column label="选项" width="300">
              <template #default="scope">
                <div v-for="(value, key) in scope.row.options" :key="key" class="option-item">
                  <strong>{{ key }}:</strong> {{ value }}
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
        
        <div style="margin-top: 20px" v-if="currentJob.envs && currentJob.envs.length > 0">
          <h4>环境变量</h4>
          <el-table :data="currentJob.envs" border>
            <el-table-column label="键" prop="name" />
            <el-table-column label="值" prop="value" />
          </el-table>
        </div>
        
        <div style="margin-top: 20px" v-if="currentJob.labels && currentJob.labels.length > 0">
          <h4>标签</h4>
          <el-table :data="currentJob.labels" border>
            <el-table-column label="键" prop="key" />
            <el-table-column label="值" prop="value" />
          </el-table>
        </div>

        <div style="margin-top: 20px" v-if="currentJob.faultToleranceConfig">
          <h4>容错配置</h4>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="启用挂起检测">
              <el-tag :type="currentJob.faultToleranceConfig.enabledHangDetection ? 'success' : 'info'">
                {{ currentJob.faultToleranceConfig.enabledHangDetection ? '是' : '否' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="无条件容错限制">
              {{ currentJob.faultToleranceConfig.unconditionalFaultToleranceLimit }}
            </el-descriptions-item>
            <el-descriptions-item label="容错参数" v-if="currentJob.faultToleranceArgs">
              <pre class="pre-wrap">{{ currentJob.faultToleranceArgs }}</pre>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div style="margin-top: 20px" v-if="currentJob.tensorboardAddr">
          <h4>Tensorboard地址</h4>
          <el-card class="box-card">
            <el-link type="primary" :href="currentJob.tensorboardAddr" target="_blank">
              {{ currentJob.tensorboardAddr }}
            </el-link>
          </el-card>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, nextTick } from "vue";
import { ElMessage } from "element-plus";
import { Refresh, CopyDocument, Search, Loading } from "@element-plus/icons-vue";
import { useStore } from "../store"; // 确保从 vuex 导入 useStore
import { ActionTypes } from "../store/mutation-types";
import { ResourcePool, Job } from "../store/types";
import { ServeGetJob, ServeGetJobWebTerminal } from "../api/jobs";
import { MutationTypes } from "../store/mutation-types";
import WebTerminal from './WebTerminal.vue';

const store = useStore();

const resourcePoolId = ref("");
const msg = ref("任务列表");
const parentBorder = ref(false);
const childBorder = ref(false);
const isLoading = ref(false);
const drawerVisible = ref(false);
const drawerLoading = ref(false);
const currentJob = ref<Job | null>(null);

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);

const searchQuery = ref('');

// 从 store 中获取状态
const jobList = computed<Job[]>(() => store.getters.jobList);
const resourcepoolList = computed<ResourcePool[]>(() => store.getters.resourcepoolList);
const totalCount = computed(() => store.state.totalCount);
const loadingPodDetails = ref<{[key: string]: boolean}>({});
const podDetails = ref<{[key: string]: any[]}>({});

// 获取资源池列表的 Action
const fetchResourcePools = async () => {
  if (resourcepoolList.value.length > 0) {
    resourcePoolId.value = resourcepoolList.value[0].metadata.id;
    // 获取任务列表
    refreshJobs();
  } else {
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
  }
};

// 刷新任务列表
const refreshJobs = async () => {
  if (resourcePoolId.value) {
    try {
      isLoading.value = true;
      await store.dispatch(ActionTypes.FETCH_JOBS, {
        resourcePoolId: resourcePoolId.value,
        pageSize: pageSize.value,
        pageNumber: currentPage.value,
        searchQuery: searchQuery.value
      });
    } catch (error) {
      console.error("Error refreshing jobs:", error);
      ElMessage.error("刷新任务失败");
    } finally {
      isLoading.value = false;
    }
  }
};

// 处理页码变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  refreshJobs();
};

// 处理每页数量变化
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  currentPage.value = 1;
  refreshJobs();
};

// 查看任务详情
const handleViewDetails = (row: Job) => {
  currentJob.value = row; // 先设置基本信息
  drawerVisible.value = true;
  drawerLoading.value = true;
  
  // 调用API获取详细信息
  fetchJobDetails(row);
};

// 获取任务详情
const fetchJobDetails = async (job: Job) => {
  try {
    drawerLoading.value = true;
    // 从job中获取jobId，如果没有就使用name
    const jobId = job.jobId;
    if (!jobId || !resourcePoolId.value) {
      ElMessage.error('任务ID或资源池ID缺失');
      drawerLoading.value = false;
      return;
    }
    
    console.log("开始请求任务详情", jobId, resourcePoolId.value);
    const response: any = await ServeGetJob({ 
      jobId, 
      resourcePoolId: resourcePoolId.value 
    });
    
    console.log("任务详情响应", response);
    
    // 检查响应结构
    if (response && response.requestId) {
      // 更新任务详情
      currentJob.value = response;
    } else {
      ElMessage.error("获取任务详情失败：数据格式错误");
      console.error("任务详情格式错误", response);
    }
  } catch (error) {
    console.error("Error fetching job details:", error);
    ElMessage.error("获取任务详情失败");
  } finally {
    drawerLoading.value = false;
  }
};

// 获取状态对应的样式类型
const getStatusType = (status: string): 'success' | 'warning' | 'danger' | 'info' | 'primary' => {
  if (!status) return 'info';
  switch (status.toLowerCase()) {
    case 'running':
      return 'success';
    case 'pending':
      return 'warning';
    case 'failed':
      return 'danger';
    case 'completed':
      return 'info';
    default:
      return 'info';
  }
};

// 复制到剪贴板
const copyToClipboard = (text: string) => {
  const input = document.createElement('input');
  input.value = text;
  document.body.appendChild(input);
  input.select();
  document.execCommand('copy');
  document.body.removeChild(input);
  ElMessage.success('已复制到剪贴板');
};

// 处理资源池切换
const handleResourcePoolChange = () => {
  // 切换资源池时重置分页到第一页
  currentPage.value = 1;
  refreshJobs();
};

// 处理搜索
const handleSearch = () => {
  // 重置分页到第一页
  currentPage.value = 1;
  refreshJobs();
};

// 在 script 部分添加新的方法
const getBcclStatusType = (status: string): 'success' | 'warning' | 'danger' | 'info' => {
  switch (status.toLowerCase()) {
    case 'enabled':
      return 'success';
    case 'disabled':
      return 'info';
    case 'error':
      return 'danger';
    default:
      return 'info';
  }
};

const getReplaceResultStatusType = (status: string): 'success' | 'warning' | 'danger' | 'info' => {
  switch (status.toLowerCase()) {
    case 'on':
      return 'success';
    case 'off':
      return 'info';
    case 'error':
      return 'danger';
    default:
      return 'info';
  }
};

const getPodStatusType = (status: string): 'success' | 'warning' | 'danger' | 'info' => {
  switch (status.toLowerCase()) {
    case 'running':
      return 'success';
    case 'pending':
      return 'warning';
    case 'failed':
      return 'danger';
    case 'succeeded':
      return 'info';
    default:
      return 'info';
  }
};

// 修改webshell相关的状态
const webshellVisible = ref<{[key: string]: boolean}>({});
const webshellUrl = ref<{[key: string]: string}>({});

const handleWebTerminalUrl = async (row: any, scope: any) => {
  try {
    const response: any = await ServeGetJobWebTerminal({ 
      jobId: scope.jobId, 
      podName: row.objectMeta.name, 
      resourcePoolId: resourcePoolId.value 
    });

    console.log("获取WebTerminal URL请求结果", response);
    
    if (response && response.WebTerminalUrl) {
      console.log("获取WebTerminal URL成功", response.WebTerminalUrl);
      const terminalId = `${scope.jobId}-${row.objectMeta.name}`;
      // 先清除可能存在的旧连接
      if (webshellUrl.value[terminalId]) {
        delete webshellUrl.value[terminalId];
        console.log("清除旧连接", terminalId);
      } else {
        console.log("没有旧连接", terminalId);
      }
      // 等待 DOM 更新
      await nextTick();
      // 设置新的 URL
      webshellUrl.value[terminalId] = response.WebTerminalUrl;
      console.log("设置新连接", terminalId, response.WebTerminalUrl);
      // 再次等待 DOM 更新
      await nextTick();
      // 显示终端
      webshellVisible.value[terminalId] = true;
      console.log("显示终端", terminalId);
    } else {
      console.log("获取WebTerminal URL失败", response);
      ElMessage.error('获取WebTerminal URL失败');
    }
  } catch (error) {
    console.error("Error getting WebTerminal URL:", error);
    ElMessage.error("获取WebTerminal URL失败");
  }
};

// 修改 closeTerminal 方法
const closeTerminal = async (terminalId: string) => {
  try {
    // 先设置可见性为 false
    webshellVisible.value[terminalId] = false;
    // 等待 DOM 更新
    await nextTick();
    // 清除 URL
    if (webshellUrl.value[terminalId]) {
      delete webshellUrl.value[terminalId];
    }
  } catch (error) {
    console.error("Error closing terminal:", error);
  }
};

// 修改 handleTerminalDisconnect 方法
const handleTerminalDisconnect = async (terminalId: string) => {
  console.log(`终端 ${terminalId} 断开连接`);
  // 断开连接时自动关闭终端
  await closeTerminal(terminalId);
};

const handleTerminalConnect = (terminalId: string) => {
  console.log(`终端 ${terminalId} 连接成功`);
};

const handleExpand = async (row: any, expanded: boolean) => {
  if (expanded && !podDetails.value[row.jobId]) {
    try {
      loadingPodDetails.value[row.jobId] = true;
      const response: any = await ServeGetJob({ 
        jobId: row.jobId, 
        resourcePoolId: resourcePoolId.value 
      });
      
      if (response && response.requestId) {
        podDetails.value[row.jobId] = response.podList?.pods || [];
      }
    } catch (error) {
      console.error("Error fetching job details:", error);
      ElMessage.error("获取任务详情失败");
    } finally {
      loadingPodDetails.value[row.jobId] = false;
    }
  }
};

fetchResourcePools();
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

/* 详情抽屉样式 */
.drawer-content {
  padding: 20px;
}

.detail-name {
  font-weight: bold;
  font-size: 16px;
}

.box-card {
  margin-top: 10px;
}

h4 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--el-text-color-primary);
}

.pre-wrap {
  white-space: pre-wrap;
  word-break: break-word;
}

.copy-button {
  margin-left: 10px;
}

.option-item {
  margin-bottom: 5px;
}

.job-name {
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
}

.job-id {
  margin-top: 5px;
  font-size: 12px;
  color: #909399;
  display: flex;
  align-items: center;
}

/* 分页容器样式 */
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  padding: 10px 0;
}

.pagination-container .el-pagination {
  padding: 0;
  margin: 0;
}

/* 操作栏样式 */
.operation-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.operation-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-input {
  width: 300px;
}

.pod-list-container {
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 4px;
  margin: 10px;
}

.pod-table {
  background-color: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.pod-table :deep(.el-table__header) {
  background-color: #f5f7fa;
}

.pod-table :deep(.el-table__row) {
  background-color: white;
}

.pod-table :deep(.el-table__row:hover) {
  background-color: #f5f7fa;
}

.no-data {
  text-align: center;
  padding: 20px;
  color: #909399;
  font-size: 14px;
}

.terminal-list {
  margin-top: 20px;
  border-top: 1px solid #EBEEF5;
  /* padding-top: 20px; */
}

.terminal-item {
  /* margin-bottom: 20px; */
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.terminal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 10px 16px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #EBEEF5;
}

.terminal-container {
  border: 1px solid #DCDFE6;
  border-radius: 4px;
  overflow: hidden;
  height: 400px;
  background-color: white;
}

.terminal-container .terminal-header {
  background-color: #f5f7fa;
  padding: 8px 16px;
  border-bottom: 1px solid #DCDFE6;
}
</style>
