<template>
  <div class="relative flex flex-col">
    <Table
      :data="fetchedProjects"
      :columns="PROJECT_COLUMNS"
      :loading="isLoadingProjects"
      :show-id-column="true"
      :show-actions="false"
      :show-search="true"
      :show-pagination="true"
      :last-update-time="projectsUpdatedAt"
      :actions="[]"
      max-height="calc(100vh - 360px)"
      @edit="() => {}"
    >
      <template #type="{ row }">
        <p>{{ t(`project.type.${row.type}`) }}</p>
      </template>
    </Table>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';

import { useI18n } from 'vue-i18n';

import StatusShow from '@/components/core/StatusShow.vue';
import Table from '@/components/core/table/Table.vue';
import { useProjects } from '@/composables/useProjects';
import { PROJECT_COLUMNS } from '@/constants/columns/project';

const { t } = useI18n();

const { fetchedProjects, isLoadingProjects, projectsUpdatedAt } = useProjects();
</script>

<style lang="scss" scoped></style>
