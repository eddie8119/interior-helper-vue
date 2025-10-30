<template>
  <div class="space-y-3">
    <!-- Project Filters -->
    <div>
      <Label :label="t('label.project.project') + ':'" />
      <div class="flex flex-wrap">
        <ElButton
          v-for="p in projectTitleList"
          :key="p.id"
          :type="selectedProjectIds.includes(p.id) ? 'default' : 'primary'"
          :plain="selectedProjectIds.includes(p.id)"
          class="filter-btn"
          round
          @click="$emit('toggle-project', p.id)"
        >
          {{ p.title }}
        </ElButton>
      </div>
    </div>
    <!-- Construction Filters -->
    <div>
      <Label :label="t('label.construction') + ':'" />
      <div class="flex flex-wrap">
        <ElButton
          v-for="c in constructionList"
          :key="c.id"
          :type="selectedConstructionIds.includes(c.id) ? 'default' : 'primary'"
          :plain="selectedConstructionIds.includes(c.id)"
          class="filter-btn"
          round
          @click="$emit('toggle-construction', c.id)"
        >
          {{ c.name }}
        </ElButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import type { ConstructionSelection } from '@/types/selection';

import Label from '@/components/core/title/Label.vue';

defineProps<{
  constructionList: ConstructionSelection[];
  projectTitleList: Array<{ id: string; title: string }>;
  selectedConstructionIds: string[];
  selectedProjectIds: string[];
}>();

defineEmits<{
  'toggle-construction': [id: string];
  'toggle-project': [id: string];
}>();

const { t } = useI18n();
</script>

<style scoped>
.filter-btn.el-button {
  padding: 10px 20px;
  font-size: 16px;
}
</style>
