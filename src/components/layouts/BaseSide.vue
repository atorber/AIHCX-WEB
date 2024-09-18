<template>
  <el-menu default-active="2" class="el-menu-vertical-demo" @open="handleOpen" @close="handleClose">
    <el-menu-item index="2">
      <el-icon><icon-menu /></el-icon>
      <template #title>训练执行命令</template>
    </el-menu-item>
    <!-- <el-sub-menu index="1">
      <template #title>
        <el-icon>
          <location />
        </el-icon>
        <span>Navigator One</span>
      </template>
      <el-menu-item-group>
        <template #title><span>Group One</span></template>
        <el-menu-item index="1-1">item one</el-menu-item>
        <el-menu-item index="1-2">item two</el-menu-item>
      </el-menu-item-group>
      <el-menu-item-group title="Group Two">
        <el-menu-item index="1-3">item three</el-menu-item>
      </el-menu-item-group>
      <el-sub-menu index="1-4">
        <template #title><span>item four</span></template>
        <el-menu-item index="1-4-1">item one</el-menu-item>
      </el-sub-menu>
    </el-sub-menu>
    <el-menu-item index="3" disabled>
      <el-icon>
        <document />
      </el-icon>
      <template #title>Navigator Three</template>
    </el-menu-item> -->
    <el-menu-item disabled index="4">
      <el-icon>
        <setting />
      </el-icon>
      <template #title>并行策略搜索</template>
    </el-menu-item>
    <el-menu-item index="5">
      <el-icon>
        <setting />
      </el-icon>
      <template #title>权重转换与切分</template>
    </el-menu-item>
    <el-menu-item disabled index="6">
      <el-icon>
        <setting />
      </el-icon>
      <template #title>数据预处理</template>
    </el-menu-item>
  </el-menu>
</template>

<script lang="ts" setup>
import { ref } from "vue";
// import {
//   Location,
//   Document,
//   Menu as IconMenu,
//   Setting,
// } from "@element-plus/icons-vue";
const currentKey = ref('')
const isCollapse = ref(true);
const handleOpen = (key: string, keyPath: string[]) => {
  console.log('handleOpen', key, keyPath);
  currentKey.value = key
};
const handleClose = (key: string, keyPath: string[]) => {
  console.log('handleClose', key, keyPath);
};
</script>
