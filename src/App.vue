<template>
  <el-config-provider namespace="ep">
    <BaseHeader />
    <div class="flex main-container">
      <!-- <BaseSide /> -->
      <el-menu
        default-active="5"
        class="el-menu-vertical-demo"
        @open="handleOpen"
        @close="handleClose"
        @select="handSelect"
      >
        <el-menu-item index="5">
          <el-icon>
            <setting />
          </el-icon>
          <template #title>权重转换与切分</template>
        </el-menu-item>
        <el-menu-item index="6">
          <el-icon>
            <setting />
          </el-icon>
          <template #title>数据预处理</template>
        </el-menu-item>
        <el-menu-item index="7">
          <el-icon>
            <setting />
          </el-icon>
          <template #title>AIAK训练任务</template>
        </el-menu-item>
        <el-menu-item index="2">
          <el-icon><icon-menu /></el-icon>
          <template #title>All-in-one任务</template>
        </el-menu-item>
        <el-menu-item disabled index="4">
          <el-icon>
            <setting />
          </el-icon>
          <template #title>并行策略搜索</template>
        </el-menu-item>
        <el-menu-item index="8">
          <el-icon>
            <setting />
          </el-icon>
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
        <ConvertCheckpoint msg="AIHCX" v-if="currentKey == '5'" />
        <PreprocessData msg="AIHCX" v-if="currentKey == '6'" />
        <Training msg="AIHCX" v-if="currentKey == '7'" />
        <JobList msg="AIHCX" v-if="currentKey == '8'" />
        <Settings msg="AIHCX" v-if="currentKey == '9'" />
        <!-- <Logos my="4" /> -->
        <!-- <HelloWorld msg="Hello Vue 3 + Element Plus + Vite" /> -->
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
