<template>
  <el-config-provider namespace="ep">
    <BaseHeader />
    <div class="flex main-container">
      <!-- <BaseSide /> -->
      <el-menu default-active="5" class="el-menu-vertical-demo" @open="handleOpen" @close="handleClose"
        @select="handSelect">
        <!-- <el-sub-menu index="0-0">
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
        </el-sub-menu> -->
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
        <el-menu-item index="9">
          <el-icon>
            <setting />
          </el-icon>
          <template #title>系统设置</template>
        </el-menu-item>
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
        <div v-else>
          <Logos my="4" />
          <h1>Comeing soon...</h1>
        </div>
        <!-- <HelloWorld v-else msg="Hello Vue 3 + Element Plus + Vite" /> -->
      </div>
    </div>
  </el-config-provider>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const currentKey = ref("5");

const handleOpen = (key: string, keyPath: string[]) => {
  // console.log("handleOpen", key, keyPath);
};
const handleClose = (key: string, keyPath: string[]) => {
  // console.log("handleClose", key, keyPath);
};

const handSelect = (key: string, keyPath: string[]) => {
  // console.log("handSelect", key, keyPath);
  currentKey.value = key;
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
