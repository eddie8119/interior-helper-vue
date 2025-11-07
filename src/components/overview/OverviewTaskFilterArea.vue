<template>
  <div class="space-y-4">
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
    <!-- advanced filter -->
    <div class="advanced-filter">
      <button type="button" class="toggle-button gap-1" @click="showAdvanced = !showAdvanced">
        <span>{{
          showAdvanced ? t('label.advanced_filter.hide') : t('label.advanced_filter.show')
        }}</span>
        <ElIcon :class="['toggle-icon', showAdvanced && 'is-open']">
          <CaretBottom />
        </ElIcon>
      </button>
      <ElCollapseTransition>
        <div v-show="showAdvanced" class="advanced-panel">
          <TaskStatusDateFilter
            status-display-mode="withoutDone"
            @update:selected-status="selectedStatus = $event"
            @update:days-range="daysRange = $event"
          />
        </div>
      </ElCollapseTransition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CaretBottom } from '@element-plus/icons-vue';
import { ElCollapseTransition, ElIcon } from 'element-plus';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { TaskFilterStatus } from '@/constants/selection';
import type { ConstructionSelection } from '@/types/selection';
import type { ProjectTitle } from '@/types/project';

import Label from '@/components/core/title/Label.vue';
import TaskStatusDateFilter from '@/components/project/TaskStatusDateFilter.vue';

defineProps<{
  constructionList: ConstructionSelection[];
  projectTitleList: ProjectTitle[];
  selectedConstructionIds: string[];
  selectedProjectIds: string[];
}>();
defineEmits<{
  'toggle-construction': [id: string];
  'toggle-project': [id: string];
}>();
const selectedStatus = ref<TaskFilterStatus>('all');
const daysRange = ref<[number, number]>([0, 10]);
const showAdvanced = ref(false);

const { t } = useI18n();
</script>

<style scoped>
.filter-group {
  @apply mt-1 flex flex-wrap gap-2;
}

.advanced-filter {
  @apply border-t border-gray-200 pt-3;
}

.toggle-icon {
  @apply transition-transform duration-200;
}

.toggle-icon.is-open {
  @apply rotate-180;
}

.advanced-panel {
  @apply mt-3;
}
</style>
