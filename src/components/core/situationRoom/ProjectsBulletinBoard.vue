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
      :actions="[]"
      max-height="calc(100vh - 360px)"
      @edit="() => {}"
    >
      <template #type="{ row }">
        <p>{{ t(`project.type.${row.type}`) }}</p>
      </template>
      <template #ph_measurement_value="{ row }">
        <!-- <ProgressBar :value="row.ph ?? 0" :observation-type="props.observationType" /> -->
      </template>
    </Table>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
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
