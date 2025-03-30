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
                        <span :class="getUsageRateClass(currentResourcePoolDetail?.status?.nodeCount?.used, currentResourcePoolDetail?.status?.nodeCount?.total)">
                          {{
                            Math.round(
                              ((currentResourcePoolDetail?.status?.nodeCount?.used || 0) /
                                (currentResourcePoolDetail?.status?.nodeCount?.total || 1)) *
                                100
                            )
                          }}%
                        </span>
                      </span>
                    </div>
                  </template>
                  <el-progress 
                    :percentage="Math.round(((currentResourcePoolDetail?.status?.nodeCount?.used || 0) / (currentResourcePoolDetail?.status?.nodeCount?.total || 1)) * 100)" 
                    :format="() => `${currentResourcePoolDetail?.status?.nodeCount?.used || 0}/${currentResourcePoolDetail?.status?.nodeCount?.total || 0}`"
                    :status="getProgressStatus(currentResourcePoolDetail?.status?.nodeCount?.used, currentResourcePoolDetail?.status?.nodeCount?.total)"
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
                          {{
                            Math.round(
                              ((currentResourcePoolDetail?.status?.gpuCount?.used || 0) /
                                (currentResourcePoolDetail?.status?.gpuCount?.total || 1)) *
                                100
                            )
                          }}%
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
                        {{ Math.round((scope.row.used / scope.row.total) * 100 || 0) }}%
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
  import { ServeGetResourcePool } from "../api/resourcepools";


  const store = useStore();
  
  const msg = ref("资源池列表");
  const parentBorder = ref(false);
  const isLoading = ref(false);
  const currentResourcePoolDetail = ref<ResourcePool | null>(null);
  const drawerVisible = ref(false);
  const drawerLoading = ref(false);
  const searchKeyword = ref('');
  
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

  // 根据使用率返回进度条状态
  const getProgressStatus = (used: number | undefined, total: number | undefined): '' | 'success' | 'warning' | 'exception' => {
    if (used === undefined || total === undefined || total === 0) {
      return '';
    }
    const percentage = Math.round((used / total) * 100);
    if (percentage <= 80) {
      return 'success';
    } else if (percentage <= 100) {
      return 'warning';
    } else {
      return 'exception';
    }
  };

  // 根据使用率返回进度条状态的类名
  const getUsageRateClass = (used: number | undefined, total: number | undefined): string => {
    if (used === undefined || total === undefined || total === 0) {
      return '';
    }
    const percentage = Math.round((used / total) * 100);
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
    max-width: 180px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
  }

  .detail-name {
    max-width: 180px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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
  </style>
  