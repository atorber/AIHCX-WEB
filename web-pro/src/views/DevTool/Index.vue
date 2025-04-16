<script setup lang="ts">
import { ContentWrap } from '@/components/ContentWrap'
import { useI18n } from '@/hooks/web/useI18n'
import { ref } from 'vue/dist/vue.esm-bundler'
import { ComingSoon } from '@/components/ComingSoon'
defineOptions({
  name: 'Menu2'
})

const { t } = useI18n()

const text = ref('')
</script>

<template>
  <ContentWrap :title="t('router.devTool')">
    <ComingSoon />
  </ContentWrap>
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
