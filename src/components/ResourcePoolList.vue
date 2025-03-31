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
          v-model="searchKeyword"
          placeholder="输入资源池名称搜索"
          class="search-input"
          clearable
          @clear="handleSearchClear"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-button
          type="primary"
          :loading="isLoading"
          @click="fetchResourcePools"
          :icon="Refresh"
          >刷新</el-button
        >
      </div>
      
      <el-table
        highlight-current-row
        :data="filteredResourcePools"
        :border="parentBorder"
        style="width: 100%"
        v-loading="isLoading"
      >
        <el-table-column label="资源池名称/ID" min-width="180">
          <template #default="scope">
            <div>
              <div>
                <el-tooltip
                  :content="scope.row.metadata.name"
                  placement="top"
                  :show-after="500"
                  :hide-after="0"
                >
                  <el-link 
                    type="primary" 
                    :underline="false"
                    @click="showDetailDrawer(scope.row)"
                    class="pool-name"
                  >
                    {{ scope.row.metadata.name }}
                  </el-link>
                </el-tooltip>
              </div>
              <div class="resource-id">
                <el-text size="small">{{ scope.row.metadata.id }}</el-text>
                <el-button
                  type="primary"
                  link
                  size="small"
                  class="copy-button"
                  @click.stop="copyToClipboard(scope.row.metadata.id)"
                >
                  <el-icon><CopyDocument /></el-icon>
                </el-button>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" prop="status.phase" width="100" />
        <el-table-column label="GPU数量" width="120">
          <template #default="scope">
            <span v-if="scope.row.status?.gpuCount">{{ scope.row.status.gpuCount.used }}/{{ scope.row.status.gpuCount.total }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="节点数量" width="120">
          <template #default="scope">
            <span v-if="scope.row.status?.nodeCount">{{ scope.row.status.nodeCount.used }}/{{ scope.row.status.nodeCount.total }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="metadata.createdAt" min-width="180" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="scope">
            <el-button 
              type="primary" 
              link 
              size="small" 
              @click.stop="showDetailDrawer(scope.row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 资源池详情抽屉 -->
      <el-drawer
        v-model="drawerVisible"
        title="资源池详情"
        size="50%"
        :with-header="true"
        direction="rtl"
        destroy-on-close
      >
        <div v-if="currentResourcePoolDetail" class="drawer-content" v-loading="drawerLoading">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="资源池名称">
              <el-tooltip
                :content="currentResourcePoolDetail.metadata.name"
                placement="top"
                :show-after="500"
                :hide-after="0"
              >
                <div class="detail-name">{{ currentResourcePoolDetail.metadata.name }}</div>
              </el-tooltip>
            </el-descriptions-item>
            <el-descriptions-item label="资源池ID">
              <div style="display: flex; align-items: center;">
                {{ currentResourcePoolDetail.metadata.id }}
                <el-button
                  type="primary"
                  link
                  size="small"
                  class="copy-button"
                  @click="copyToClipboard(currentResourcePoolDetail.metadata.id)"
                >
                  <el-icon><CopyDocument /></el-icon>
                </el-button>
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ currentResourcePoolDetail.metadata.createdAt || '-' }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ currentResourcePoolDetail.metadata.updatedAt || '-' }}</el-descriptions-item>
            <el-descriptions-item label="K8s版本">{{ currentResourcePoolDetail.spec?.k8sVersion || '-' }}</el-descriptions-item>
            <el-descriptions-item label="所属区域">{{ currentResourcePoolDetail.spec?.region || '-' }}</el-descriptions-item>
            <el-descriptions-item label="创建者">{{ currentResourcePoolDetail.spec?.createdBy || '-' }}</el-descriptions-item>
            <el-descriptions-item label="禁止删除">
              <el-tag :type="currentResourcePoolDetail.spec?.forbidDelete ? 'danger' : 'success'">
                {{ currentResourcePoolDetail.spec?.forbidDelete ? '是' : '否' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="描述" :span="2">{{ currentResourcePoolDetail.spec?.description || '暂无描述' }}</el-descriptions-item>
          </el-descriptions>
          
          <div v-if="currentResourcePoolDetail.spec?.associatedPfsId" style="margin-top: 20px">
            <h4>关联信息</h4>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="关联PFS ID">{{ currentResourcePoolDetail.spec?.associatedPfsId || '无' }}</el-descriptions-item>
              <el-descriptions-item label="关联Cprom IDs">
                <el-tag v-for="(id, index) in currentResourcePoolDetail.spec?.associatedCpromIds" :key="index" style="margin-right: 5px">
                  {{ id }}
                </el-tag>
                <span v-if="!currentResourcePoolDetail.spec?.associatedCpromIds?.length">无</span>
              </el-descriptions-item>
            </el-descriptions>
          </div>
          
          <div style="margin-top: 20px" v-if="currentResourcePoolDetail.status?.nodeCount || currentResourcePoolDetail.status?.gpuCount">
            <h4>资源使用情况</h4>
            <el-row :gutter="20">
              <el-col :span="12" v-if="currentResourcePoolDetail.status?.nodeCount">
                <el-card shadow="never">
                  <template #header>
                    <div class="card-header">
                      <span>节点使用</span>
                      <span class="usage-rate">
                        <span :class="getUsageRateClass(currentResourcePoolDetail?.status?.nodeCount?.used, currentResourcePoolDetail?.status?.nodeCount?.total, true)">
                          {{currentResourcePoolDetail?.status?.nodeCount?.used || 0}}/{{currentResourcePoolDetail?.status?.nodeCount?.total || 0}}
                        </span>
                      </span>
                    </div>
                  </template>
                  <el-progress 
                    :percentage="Math.round(((currentResourcePoolDetail?.status?.nodeCount?.used || 0) / (currentResourcePoolDetail?.status?.nodeCount?.total || 1)) * 100)" 
                    :format="() => `${currentResourcePoolDetail?.status?.nodeCount?.used || 0}/${currentResourcePoolDetail?.status?.nodeCount?.total || 0}`"
                    :status="getProgressStatus(currentResourcePoolDetail?.status?.nodeCount?.used, currentResourcePoolDetail?.status?.nodeCount?.total, true)"
                  />
                </el-card>
              </el-col>
              <el-col :span="12" v-if="currentResourcePoolDetail.status?.gpuCount">
                <el-card shadow="never">
                  <template #header>
                    <div class="card-header">
                      <span>GPU使用</span>
                      <span class="usage-rate">
                        <span :class="getUsageRateClass(currentResourcePoolDetail?.status?.gpuCount?.used, currentResourcePoolDetail?.status?.gpuCount?.total)">
                          {{currentResourcePoolDetail?.status?.gpuCount?.used || 0}}/{{currentResourcePoolDetail?.status?.gpuCount?.total || 0}}
                        </span>
                      </span>
                    </div>
                  </template>
                  <el-progress 
                    :percentage="Math.round(((currentResourcePoolDetail?.status?.gpuCount?.used || 0) / (currentResourcePoolDetail?.status?.gpuCount?.total || 1)) * 100)" 
                    :format="() => `${currentResourcePoolDetail?.status?.gpuCount?.used || 0}/${currentResourcePoolDetail?.status?.gpuCount?.total || 0}`"
                    :status="getProgressStatus(currentResourcePoolDetail?.status?.gpuCount?.used, currentResourcePoolDetail?.status?.gpuCount?.total)"
                  />
                </el-card>
              </el-col>
            </el-row>
          </div>
          
          <div style="margin-top: 20px" v-if="currentResourcePoolDetail.status?.gpuDetail && currentResourcePoolDetail.status.gpuDetail.length > 0">
            <h4>GPU详情</h4>
            <el-table :data="currentResourcePoolDetail.status.gpuDetail" border>
              <el-table-column label="GPU类型" prop="gpuDescriptor" />
              <el-table-column label="总数" prop="total" />
              <el-table-column label="已使用" prop="used" />
              <el-table-column label="使用率" width="180">
                <template #default="scope">
                  <div class="usage-container">
                    <el-progress 
                      :percentage="Math.round((scope.row.used / scope.row.total) * 100 || 0)" 
                      :format="() => `${scope.row.used}/${scope.row.total}`"
                      :status="getProgressStatus(scope.row.used, scope.row.total)"
                    />
                    <span class="usage-rate table-usage-rate">
                      <span :class="getUsageRateClass(scope.row.used, scope.row.total)">
                        {{scope.row.used}}/{{scope.row.total}}
                      </span>
                    </span>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
          
          <div style="margin-top: 20px" v-if="currentResourcePoolDetail.status?.phase">
            <h4>运行状态</h4>
            <el-tag 
              :type="currentResourcePoolDetail.status.phase === 'running' ? 'success' : 'warning'">
              {{ currentResourcePoolDetail.status.phase }}
            </el-tag>
          </div>
          
          <!-- 资源池队列信息 -->
          <div style="margin-top: 20px">
            <h4>队列信息</h4>
            <div v-loading="queueLoading">
              <el-empty v-if="resourceQueueList.length === 0" description="暂无队列信息" />
              <div v-else class="queue-list">
                <el-card v-for="queue in resourceQueueList" :key="queue.name" class="queue-card" shadow="hover">
                  <template #header>
                    <div class="queue-card-header">
                      <div class="queue-title">
                        <el-tooltip
                          :content="queue.name"
                          placement="top"
                          :show-after="500"
                          :hide-after="0"
                        >
                          <span class="queue-name">{{ queue.name }}</span>
                        </el-tooltip>
                        <el-tag size="small" :type="queue.state === 'Open' ? 'success' : 'warning'" style="margin-left: 8px">
                          {{ queue.state }}
                        </el-tag>
                      </div>
                      <div class="queue-actions">
                        <el-tag size="small" type="info" style="margin-right: 8px">{{ queue.queueType }}</el-tag>
                        <el-tag size="small" :type="queue.reclaimable ? 'success' : 'info'" style="margin-right: 8px">
                          可回收: {{ queue.reclaimable ? '是' : '否' }}
                        </el-tag>
                        <el-tag size="small" :type="queue.preemptable ? 'success' : 'info'">
                          可抢占: {{ queue.preemptable ? '是' : '否' }}
                        </el-tag>
                      </div>
                    </div>
                  </template>
                  
                  <el-descriptions :column="2" border>
                    <el-descriptions-item label="调度策略">{{ queue.queueingStrategy }}</el-descriptions-item>
                    <el-descriptions-item label="创建时间">{{ queue.createdTime }}</el-descriptions-item>
                    <el-descriptions-item label="父队列">{{ queue.parentQueue }}</el-descriptions-item>
                    <el-descriptions-item label="禁止超售">{{ queue.disableOversell ? '是' : '否' }}</el-descriptions-item>
                  </el-descriptions>

                  <!-- 资源信息 -->
                  <div class="resource-section">
                    <h5>资源信息</h5>
                    <el-empty 
                      v-if="!queue.capability && !queue.deserved && !queue.guarantee"
                      description="暂无资源信息"
                      :image-size="60"
                    />
                    <el-row v-else :gutter="20">
                      <el-col :span="8" v-if="queue.capability">
                        <div class="resource-card">
                          <div class="resource-title">资源容量</div>
                          <div class="resource-content">
                            <div v-for="(value, key) in queue.capability" :key="key" class="resource-item">
                              <span class="resource-label">{{ key }}:</span>
                              <span class="resource-value">{{ value }}</span>
                            </div>
                          </div>
                        </div>
                      </el-col>
                      <el-col :span="queue.capability ? 8 : 12" v-if="queue.deserved">
                        <div class="resource-card">
                          <div class="resource-title">分配资源</div>
                          <div class="resource-content">
                            <div v-for="(value, key) in queue.deserved" :key="key" class="resource-item">
                              <span class="resource-label">{{ key }}:</span>
                              <span class="resource-value">{{ value }}</span>
                            </div>
                          </div>
                        </div>
                      </el-col>
                      <el-col :span="queue.capability || queue.deserved ? 8 : 24" v-if="queue.guarantee">
                        <div class="resource-card">
                          <div class="resource-title">保证资源</div>
                          <div class="resource-content">
                            <div v-for="(value, key) in queue.guarantee" :key="key" class="resource-item">
                              <span class="resource-label">{{ key }}:</span>
                              <span class="resource-value">{{ value }}</span>
                            </div>
                          </div>
                        </div>
                      </el-col>
                    </el-row>
                  </div>

                  <!-- 任务状态 -->
                  <div class="task-status">
                    <h5>任务状态</h5>
                    <el-row :gutter="20">
                      <el-col :span="8">
                        <div class="status-card">
                          <div class="status-value">{{ queue.running || 0 }}</div>
                          <div class="status-label">运行中</div>
                        </div>
                      </el-col>
                      <el-col :span="8">
                        <div class="status-card">
                          <div class="status-value">{{ queue.inqueue || 0 }}</div>
                          <div class="status-label">排队中</div>
                        </div>
                      </el-col>
                      <el-col :span="8">
                        <div class="status-card">
                          <div class="status-value">{{ queue.pending || 0 }}</div>
                          <div class="status-label">等待中</div>
                        </div>
                      </el-col>
                    </el-row>
                  </div>

                  <!-- 节点信息 -->
                  <div v-if="queue.nodes" class="node-section">
                    <h5>节点信息</h5>
                    <div v-for="(nodeGroup, resourceType) in queue.nodes" :key="resourceType">
                      <div v-for="(node, index) in nodeGroup" :key="index" class="node-info">
                        <el-descriptions :column="2" border>
                          <el-descriptions-item label="机器规格">{{ node.machineSpec }}</el-descriptions-item>
                          <el-descriptions-item label="节点数量">{{ node.count }}</el-descriptions-item>
                          <el-descriptions-item label="节点名称" :span="2">
                            <el-tag 
                              v-for="nodeName in node.k8sNodeNames" 
                              :key="nodeName"
                              size="small"
                              style="margin-right: 5px"
                            >
                              {{ nodeName }}
                            </el-tag>
                          </el-descriptions-item>
                        </el-descriptions>
                      </div>
                    </div>
                  </div>
                </el-card>
              </div>
            </div>
          </div>
        </div>
      </el-drawer>
    </div>
  </template>
  
  <script lang="ts" setup>
  import { ref, computed, reactive } from "vue";
  import { ElMessage } from "element-plus";
  import { Refresh, CopyDocument, Search } from "@element-plus/icons-vue";
  import { useStore } from "../store"; // 确保从 vuex 导入 useStore
  import { ActionTypes } from "../store/mutation-types";
  import { ResourcePool } from "../store/types";
  import { ServeGetResourcePool, ServeGetResourceQueues } from "../api/resourcepools";


  const store = useStore();
  
  const msg = ref("资源池列表");
  const parentBorder = ref(false);
  const isLoading = ref(false);
  const currentResourcePoolDetail = ref<ResourcePool | null>(null);
  const drawerVisible = ref(false);
  const drawerLoading = ref(false);
  const searchKeyword = ref('');
  const resourceQueueList = ref<any[]>([]);
  const queueLoading = ref(false);
  
  // 从 store 中获取资源池列表
  const resourcepoolList = computed<ResourcePool[]>(
    () => store.getters.resourcepoolList
  );
  
  // 获取资源池列表的 Action
  const fetchResourcePools = async () => {
    try {
      isLoading.value = true;
      await store.dispatch(ActionTypes.FETCH_RESOURCEPOOLS);
    } catch (error) {
      console.error("Error fetching resource pools:", error);
      ElMessage.error("获取资源池失败");
    } finally {
      isLoading.value = false;
    }
  };
  
  const fetchResourcePool = async (resourcePoolId: string) => {
    try {
      drawerLoading.value = true;
      console.log("开始请求资源池详情", resourcePoolId);
      const response: any = await ServeGetResourcePool({ resourcePoolId });
      console.log("资源池详情响应", JSON.stringify(response, null, 2));
      
      // 检查响应结构
      if (response.requestId) {
        // 如果API返回的是 { data: { ... } } 结构
        currentResourcePoolDetail.value = response;
      } else {
        ElMessage.error("获取资源池详情失败：数据格式错误");
        console.error("资源池详情格式错误", response);
      }
      
      console.log("处理后的资源池详情数据", currentResourcePoolDetail.value);
    } catch (error) {
      console.error("Error fetching resource pool:", error);
      ElMessage.error("获取资源池失败");
    } finally {
      drawerLoading.value = false;
    }
  };
  
  // 显示详情抽屉
  const showDetailDrawer = async (row: ResourcePool) => {
    drawerVisible.value = true;
    if (row.metadata?.id) {
      await fetchResourcePool(row.metadata.id);
      await fetchResourceQueues(row.metadata.id);
    }
  };
  
  // 获取资源池队列信息
  const fetchResourceQueues = async (resourcePoolId: string) => {
    try {
      queueLoading.value = true;
      console.log("开始请求资源池队列信息", resourcePoolId);
      const response: any = await ServeGetResourceQueues({ resourcePoolId });
      console.log("资源池队列信息响应", JSON.stringify(response, null, 2));
      
      if (response && Array.isArray(response.resourceQueues)) {
        resourceQueueList.value = response.resourceQueues;
      } else {
        resourceQueueList.value = [];
        console.warn("资源池队列信息格式不符合预期", response);
      }
    } catch (error) {
      console.error("Error fetching resource queues:", error);
      resourceQueueList.value = [];
      ElMessage.error("获取资源池队列信息失败");
    } finally {
      queueLoading.value = false;
    }
  };
  
  // 复制ID到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      ElMessage.success('ID已复制到剪贴板');
    }).catch(err => {
      console.error('复制失败:', err);
      ElMessage.error('复制失败');
    });
  };
  
  // 初始加载资源池数据
  fetchResourcePools();

  // 从资源对象中获取XPU值
  const getXpuValue = (resourceObj: any): string => {
    if (!resourceObj) return '-';
    
    // 查找XPU资源
    const xpuKey = Object.keys(resourceObj).find(key => key.includes('xpu'));
    if (xpuKey) {
      return `${xpuKey}: ${resourceObj[xpuKey]}`;
    }
    
    // 如果没有XPU，返回第一个资源
    const firstKey = Object.keys(resourceObj)[0];
    if (firstKey) {
      return `${firstKey}: ${resourceObj[firstKey]}`;
    }
    
    return '-';
  };

  // 根据使用率返回进度条状态
  const getProgressStatus = (used: number | undefined, total: number | undefined, isNode = false): '' | 'success' | 'warning' | 'exception' => {
    if (used === undefined || total === undefined || total === 0) {
      return '';
    }
    const percentage = Math.round((used / total) * 100);
    
    // 节点使用特殊处理：节点全部使用是正常状态，部分使用为警告状态
    if (isNode) {
      return used === total ? 'success' : 'warning';
    }
    
    // 其他资源使用率判断
    if (percentage <= 80) {
      return 'success';
    } else if (percentage <= 100) {
      return 'warning';
    } else {
      return 'exception';
    }
  };

  // 根据使用率返回进度条状态的类名
  const getUsageRateClass = (used: number | undefined, total: number | undefined, isNode = false): string => {
    if (used === undefined || total === undefined || total === 0) {
      return '';
    }
    const percentage = Math.round((used / total) * 100);
    
    // 节点使用特殊处理：节点全部使用是正常状态，部分使用为警告状态
    if (isNode) {
      return used === total ? 'usage-rate-success' : 'usage-rate-warning';
    }
    
    // 其他资源使用率判断
    if (percentage <= 80) {
      return 'usage-rate-success';
    } else if (percentage <= 100) {
      return 'usage-rate-warning';
    } else {
      return 'usage-rate-exception';
    }
  };

  const filteredResourcePools = computed(() => {
    if (!searchKeyword.value) {
      return resourcepoolList.value;
    }
    return resourcepoolList.value.filter(pool =>
      pool.metadata.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
    );
  });

  const handleSearchClear = () => {
    searchKeyword.value = '';
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
  .detail-card {
    margin-top: 20px;
    margin-bottom: 20px;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .drawer-content {
    padding: 20px;
  }

  .resource-id {
    margin-top: 5px;
    font-size: 12px;
    color: #909399;
    display: flex;
    align-items: center;
  }

  .copy-button {
    margin-left: 5px;
    padding: 2px;
    height: auto;
  }

  .copy-button .el-icon {
    font-size: 14px;
  }

  .pool-name {
    width: 300px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
  }

  .detail-name {
    max-width: 100%;
    white-space: normal;
    overflow: visible;
    word-break: break-word;
    display: inline-block;
  }

  .usage-container {
    display: flex;
    align-items: center;
  }

  .usage-container .el-progress {
    flex: 1;
    margin-right: 5px;
  }

  .usage-rate {
    margin-left: 10px;
    font-weight: bold;
    color: #606266;
  }

  .table-usage-rate {
    margin-left: 5px;
    white-space: nowrap;
    min-width: 40px;
  }

  .usage-rate-success {
    color: #67C23A;
  }

  .usage-rate-warning {
    color: #E6A23C;
  }

  .usage-rate-exception {
    color: #F56C6C;
  }

  .operation-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .search-input {
    width: 300px;
  }
  
  .queue-name {
    width: 120px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
  }

  .queue-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .queue-card {
    margin-bottom: 20px;
  }

  .queue-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .queue-title {
    display: flex;
    align-items: center;
  }

  .queue-actions {
    display: flex;
    align-items: center;
  }

  .resource-section {
    margin-top: 20px;
    margin-bottom: 40px;
  }

  .resource-card {
    background-color: #f5f7fa;
    padding: 15px;
    border-radius: 4px;
    height: 100%;
  }

  .resource-title {
    font-weight: bold;
    margin-bottom: 10px;
    color: #606266;
  }

  .resource-content {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .resource-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
  }

  .resource-label {
    color: #606266;
  }

  .resource-value {
    color: #303133;
    font-weight: 500;
  }

  .task-status {
    margin-top: 20px;
  }

  .task-status h5,
  .resource-section h5,
  .node-section h5 {
    margin: 0 0 16px 0;
    padding: 8px 0;
    font-size: 16px;
    font-weight: 500;
    color: #303133;
    border-bottom: 1px solid #EBEEF5;
  }

  .status-card {
    text-align: center;
    padding: 15px;
    background-color: #f5f7fa;
    border-radius: 4px;
  }

  .status-value {
    font-size: 24px;
    font-weight: bold;
    color: #303133;
    margin-bottom: 5px;
  }

  .status-label {
    color: #606266;
    font-size: 13px;
  }

  .node-section {
    margin-top: 20px;
  }

  .node-info {
    margin-bottom: 15px;
  }

  .node-info:last-child {
    margin-bottom: 0;
  }
  </style>
  