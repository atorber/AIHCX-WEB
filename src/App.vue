<template>
  <el-config-provider namespace="ep">
    <BaseHeader @show-docs="handleShowDocs" @reset-view="handleResetView" />
    <div class="flex main-container">
      <!-- <BaseSide /> -->
      <el-menu v-if="currentKey !== 'docs'" :default-active="currentKey" class="el-menu-vertical-demo" @open="handleOpen" @close="handleClose"
        @select="handSelect">
        <el-menu-item index="16">
          <el-icon>
            <setting />
          </el-icon>
          <template #title>应用市场</template>
        </el-menu-item>
        <el-sub-menu index="0-0">
          <template #title>
            <el-icon><ElementPlus /></el-icon>自定义训练
          </template>
          <el-menu-item index="11">
            <template #title>下载数据</template>
          </el-menu-item>
          <el-menu-item index="15">
            <template #title>上传文件</template>
          </el-menu-item>
          <el-menu-item index="12">
            <template #title>权重转换与切分</template>
          </el-menu-item>
          <el-menu-item index="13">
            <template #title>数据预处理</template>
          </el-menu-item>
          <el-menu-item index="14">
            <template #title>数据导出</template>
          </el-menu-item>
          <el-menu-item index="10">
            <template #title>训练参数编辑器</template>
          </el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="0-1">
          <template #title>
            <el-icon><SwitchFilled /></el-icon>启动命令生成
          </template>
          <el-menu-item index="5">
          <template #title>权重转换与切分</template>
        </el-menu-item>
        <el-menu-item index="6">
          <template #title>数据预处理</template>
        </el-menu-item>
        <el-menu-item index="7">
          <template #title>训练任务</template>
        </el-menu-item>
        <el-menu-item index="2">
          <template #title>单机任务</template>
        </el-menu-item>
        </el-sub-menu>
        <el-menu-item index="8">
          <el-icon><List /></el-icon>
          <template #title>任务列表</template>
        </el-menu-item>
        <el-menu-item index="17">
          <el-icon><List /></el-icon>
          <template #title>资源队列</template>
        </el-menu-item>
        <el-menu-item index="9">
          <el-icon>
            <setting />
          </el-icon>
          <template #title>系统设置</template>
        </el-menu-item>
        <el-sub-menu index="0-2">
          <template #title>
            <el-icon><ElementPlus /></el-icon>组件示例
          </template>
          <el-menu-item index="18">
            <template #title>动态表单</template>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
      <div w="full" py="4">
        <Home msg="AIHCX" v-if="currentKey == '2'" />
        <ConvertCheckpoint msg="AIHCX" v-else-if="currentKey == '5'" />
        <PreprocessData msg="AIHCX" v-else-if="currentKey == '6'" />
        <Training msg="AIHCX" v-else-if="currentKey == '7'" />
        <JobList msg="AIHCX" v-else-if="currentKey == '8'" />
        <Settings msg="AIHCX" v-else-if="currentKey == '9'" />
        <TrainingCustom msg="AIHCX" v-else-if="currentKey == '10'" />
        <DownloadData msg="AIHCX" v-else-if="currentKey == '11'" />
        <ConvertCheckpointCustom msg="AIHCX" v-else-if="currentKey == '12'" />
        <PreprocessDataCustom msg="AIHCX" v-else-if="currentKey == '13'" />
        <UploadData msg="AIHCX" v-else-if="currentKey == '15'" />
        <ExportData msg="AIHCX" v-else-if="currentKey == '14'" />
        <Market msg="AIHCX" v-else-if="currentKey == '16'" />
        <ResourcePoolList msg="AIHCX" v-else-if="currentKey == '17'" />
        <DynamicFormExample msg="AIHCX" v-else-if="currentKey == '18'" />
        <div v-else-if="currentKey == 'docs'" class="w-full h-full">
          <iframe src="http://127.0.0.1:8000/docs/" class="w-full h-full border-none"></iframe>
        </div>
        <div v-else>
          <Logos my="4" />
          <h1>Comeing soon...</h1>
        </div>
      </div>
    </div>
  </el-config-provider>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const currentKey = ref(localStorage.getItem('currentMenuKey') || "5");
const showDocs = ref(false);

const handleOpen = (key: string, keyPath: string[]) => {
  // console.log("handleOpen", key, keyPath);
};
const handleClose = (key: string, keyPath: string[]) => {
  // console.log("handleClose", key, keyPath);
};

const handSelect = (key: string, keyPath: string[]) => {
  // console.log("handSelect", key, keyPath);
  currentKey.value = key;
  localStorage.setItem('currentMenuKey', key);
};

const handleShowDocs = () => {
  showDocs.value = true;
  currentKey.value = 'docs';
};

const handleResetView = () => {
  showDocs.value = false;
  currentKey.value = '2'; // 重置为默认页面
  localStorage.setItem('currentMenuKey', '2');
};
</script>

<style>
#app {
  text-align: center;
  color: var(--ep-text-color-primary);
}

.main-container {
  height: calc(100vh - var(--ep-menu-item-height) - 3px);
}
</style>
