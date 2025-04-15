<template>
    <div style="text-align: center;">
      <el-button plain type="text" @click="openDialog">选择</el-button>
      <el-dialog v-model="dialogVisible" title="选择路径" width="800px" @close="resetSelection">
        <el-tree
          :props="treeProps"
          :load="loadNode"
          lazy
          highlight-current
          @node-click="handleNodeClick"
          :default-expand-all="false"
          class="path-tree"
        />
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="closeDialog">取消</el-button>
            <el-button type="primary" @click="confirmSelection" :disabled="!selectedNode">
              确定
            </el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import { ElMessage } from 'element-plus';
  import { getDirs } from '../utils/util';
  // 定义 emit
const emit = defineEmits<{
  (event: 'selection-confirmed', name: string): void
}>()

  type TreeLoadData = (node: any, resolve: (children: any[]) => void) => void;
  
  interface TreeData {
    name: string;
    leaf?: boolean;
  }
  
  const treeProps = {
    label: 'name',
    children: 'zones',
    isLeaf: 'leaf',
  };
  
  // 状态变量
  const dialogVisible = ref(false);
  const selectedNode = ref<TreeData | null>(null);
  
  // 打开对话框
  const openDialog = () => {
    dialogVisible.value = true;
  };
  
  // 关闭对话框
  const closeDialog = () => {
    dialogVisible.value = false;
  };
  
  // 重置选中节点
  const resetSelection = () => {
    selectedNode.value = null;
  };
  
  // 处理节点点击事件
  const handleNodeClick = (data: TreeData) => {
    selectedNode.value = data;
    console.info('选中节点:', data.name);
  };
  
  // 加载树节点数据
  const loadNode: TreeLoadData = (node: any, resolve: (data: TreeData[]) => void) => {
    const path = node.level === 0 ? '/' : node.data.name;
  
    getDirs(path)
      .then((dirs) => {
        const children = dirs.map((item) => ({
          name: path === '/' ? `/${item.label}` : `${path}/${item.label}`,
          leaf: item.leaf,
        }));
        resolve(children);
      })
      .catch((error) => {
        console.error('加载节点失败:', error);
        ElMessage.error('加载目录失败，请稍后重试。');
        resolve([]);
      });
  };
  
  // 确认选择
  const confirmSelection = () => {
    if (selectedNode.value) {
      // 这里可以根据需求触发事件或执行其他逻辑
      ElMessage.success(`已选择路径: ${selectedNode.value.name}`);
      closeDialog();
      // 示例：触发自定义事件，将选中的路径传递出去
      emit('selection-confirmed', selectedNode.value.name);
    } else {
      ElMessage.warning('请选择一个路径。');
    }
  };
  </script>
  
  <style scoped>
  .dialog-footer {
    text-align: right;
  }
  
  .path-tree {
    max-height: 500px;
    overflow-y: auto;
  }
  
  /* 优化按钮间距 */
  .el-button {
    margin: 4px;
  }
  
  .el-button + .el-button {
    margin-left: 0;
    margin: 4px;
  }
  
  /* 优化表单和布局间距 */
  .el-form {
    width: 100%;
    padding: 20px;
  }
  
  .el-row {
    margin: 0;
  }
  
  /* 优化展示框样式 */
  .box-card {
    width: 100%;
    padding: 20px;
    word-break: break-word;
    white-space: pre-wrap;
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