<template>
  <div class="relative flex flex-col">
    <Table
      :data="fetchedOverviewProjects"
      :columns="PROJECT_COLUMNS"
      :loading="isLoadingOverviewProjects"
      :show-id-column="true"
      :show-actions="false"
      :show-search="true"
      :show-pagination="true"
      :last-update-time="overviewProjectsUpdatedAt"
      :table-height="tableHeight"
      :actions="[]"
      @edit="() => {}"
    >
      <template #type="{ row }">
        <p>{{ t(`option.projectType.${row.type}`) }}</p>
      </template>
      <template #task_done_progress="{ row }">
        <ProgressBar
          :value="row.tasks.filter((t) => t.status === TaskStatusEnum.DONE).length"
          :show-percentage="true"
          :total="row.tasks.length"
        />
      </template>
      <template #task_todo_left="{ row }">
        <p>{{ row.tasks.filter((t) => t.status === TaskStatusEnum.TODO).length }}</p>
      </template>
      <template #task_in_progress="{ row }">
        <p>{{ row.tasks.filter((t) => t.status === TaskStatusEnum.IN_PROGRESS).length }}</p>
      </template>
    </Table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import ProgressBar from '@/components/core/chart/ProgressBar.vue';
import Table from '@/components/core/table/Table.vue';
import { useProjects } from '@/composables/useProjects';
import { useResponsiveWidth } from '@/composables/useResponsiveWidth';
import { PROJECT_COLUMNS } from '@/constants/columns/project';
import { TaskStatusEnum } from '@/types/task';

const { t } = useI18n();
const { isMobile } = useResponsiveWidth();
const { fetchedOverviewProjects, isLoadingOverviewProjects, overviewProjectsUpdatedAt } =
  useProjects();

const tableHeight = computed(() =>
  isMobile.value
    ? '300px'
    : `${Math.max(0, (window.innerHeight || document.documentElement.clientHeight) - 430)}px`
);
</script>

<style lang="scss" scoped></style>
