<template>
  <el-config-provider namespace="ep">
    <BaseHeader />
    <div class="flex main-container">
      <!-- <BaseSide /> -->
      <el-menu default-active="2" class="el-menu-vertical-demo" @open="handleOpen" @close="handleClose"
        @select="handSelect">
        <el-menu-item index="2">
          <el-icon><icon-menu /></el-icon>
          <template #title>快捷执行命令</template>
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
      </el-menu>
      <div w="full" py="4">
        <Home msg="AIHCX" v-if="currentKey == '2'" />
        <ConvertCheckpoint msg="AIHCX" v-if="currentKey == '5'" />
        <PreprocessData msg="AIHCX" v-if="currentKey == '6'" />
        <Training msg="AIHCX" v-if="currentKey == '7'" />
        <!-- <Logos my="4" /> -->
        <!-- <HelloWorld msg="Hello Vue 3 + Element Plus + Vite" /> -->
      </div>
    </div>
  </el-config-provider>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const currentKey = ref('2')

const handleOpen = (key: string, keyPath: string[]) => {
  console.log('handleOpen', key, keyPath);
};
const handleClose = (key: string, keyPath: string[]) => {
  console.log('handleClose', key, keyPath);
};

const handSelect = (key: string, keyPath: string[]) => {
  console.log('handSelect', key, keyPath);
  currentKey.value = key
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
