<template>
  <section class="relative flex flex-col">
    <div class="absolute bottom-5 right-[16px] z-10 mb-3 flex justify-end">
      <BatchDownloadExcelArea :projects="projects" :tasks="tasks" />
    </div>
    <Table
      :data="projects"
      :columns="PROJECT_COLUMNS"
      :loading="isLoading"
      :show-id-column="true"
      :show-actions="false"
      :show-search="true"
      :show-pagination="true"
      :last-update-time="lastUpdated"
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
      <template #floorPlanUrls="{ row }">
        <FloorPlanPreviewIcon :floor-plan-urls="row.floorPlanUrls" :project-id="row.id" />
      </template>
      <template #download_excel="{ row }">
        <DownloadExcelArea :project="row" :tasks="tasks" />
      </template>
    </Table>
  </section>
</template>

<script setup lang="ts">
import { computed, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { ProjectResponse, TaskResponse } from '@/types/response';

import ProgressBar from '@/components/core/chart/ProgressBar.vue';
import Table from '@/components/core/table/Table.vue';
import FloorPlanPreviewIcon from '@/components/project/FloorPlanPreviewIcon.vue';
import BatchDownloadExcelArea from '@/components/projects/BatchDownloadExcelArea.vue';
import DownloadExcelArea from '@/components/projects/DownloadExcelArea.vue';
import { useResponsiveWidth } from '@/composables/ui/useResponsiveWidth';
import { PROJECT_COLUMNS } from '@/constants/columns/project';
import { TaskStatusEnum } from '@/types/task';

defineProps<{
  tasks: TaskResponse[] | undefined;
  projects: ProjectResponse[] | undefined;
  isLoading: boolean;
  lastUpdated: Ref<number, number>;
}>();

const { t } = useI18n();
const { isMobile } = useResponsiveWidth();

const tableHeight = computed(() =>
  isMobile.value
    ? '300px'
    : `${Math.max(0, (window.innerHeight || document.documentElement.clientHeight) - 430)}px`
);
</script>

<style lang="scss" scoped></style>
