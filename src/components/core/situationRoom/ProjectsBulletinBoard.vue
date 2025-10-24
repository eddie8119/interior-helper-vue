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
      :table-height="'300px'"
      :actions="[]"
      @edit="() => {}"
    >
      <template #type="{ row }">
        <p>{{ t(`option.projectType.${row.type}`) }}</p>
      </template>
      <template #task_progress="{ row }">
        <ProgressBar
          :value="row.tasks.filter((t) => t.status === 'done').length"
          :show-percentage="true"
          :total="row.tasks.length"
        />
      </template>
    </Table>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import ProgressBar from '@/components/core/chart/ProgressBar.vue';
import Table from '@/components/core/table/Table.vue';
import { useProjects } from '@/composables/useProjects';
import { PROJECT_COLUMNS } from '@/constants/columns/project';

const { t } = useI18n();

const { fetchedOverviewProjects, isLoadingOverviewProjects, overviewProjectsUpdatedAt } =
  useProjects();
</script>

<style lang="scss" scoped></style>
