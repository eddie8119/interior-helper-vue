<template>
  <div class="panel-container h-full space-y-4">
    <!-- Project Filters -->
    <div>
      <Label :label="t('label.project.project') + t('label.filter') + ':'" />
      <div class="filter-group">
        <button
          v-for="p in projectTitleList"
          :key="p.id"
          type="button"
          :class="['normal-button', selectedProjectIds.includes(p.id) && 'is-active']"
          @click="$emit('toggle-project', p.id)"
        >
          {{ p.title }}
        </button>
      </div>
    </div>

    <!-- Construction Filters -->
    <div>
      <Label :label="t('label.construction') + t('label.filter') + ':'" />
      <div class="filter-group">
        <button
          v-for="c in constructionList"
          :key="c.id"
          type="button"
          :class="['normal-button', selectedConstructionIds.includes(c.id) && 'is-active']"
          @click="$emit('toggle-construction', c.id)"
        >
          {{ c.name }}
        </button>
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
.filter-group {
  @apply mt-2 flex flex-wrap gap-2;
}
</style>
