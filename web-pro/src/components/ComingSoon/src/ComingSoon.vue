<script setup lang="ts">
defineOptions({
  name: 'ComingSoon'
})
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[300px]">
    <div class="text-4xl mb-4">🚀</div>
    <div class="text-xl font-medium text-gray-600">功能开发中...</div>
    <div class="text-sm text-gray-400 mt-2">努力开发中，敬请期待</div>
  </div>
</template>

<style scoped>
.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.min-h-\[300px\] {
  min-height: 300px;
}

.text-4xl {
  font-size: 2.25rem;
  line-height: 2.5rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.text-xl {
  font-size: 1.25rem;
  line-height: 1.75rem;
}

.font-medium {
  font-weight: 500;
}

.text-gray-600 {
  color: rgb(75 85 99);
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.text-gray-400 {
  color: rgb(156 163 175);
}

.mt-2 {
  margin-top: 0.5rem;
}
</style>
