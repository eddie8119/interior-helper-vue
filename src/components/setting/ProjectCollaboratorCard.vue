<template>
  <div
    class="group relative flex h-44 flex-col justify-between overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
  >
    <div class="flex items-center gap-2">
      <h3 class="line-clamp-1 text-base font-semibold">{{ project.title }}</h3>
      <ElTag v-if="isOwner" type="success" size="small">{{ t('label.owner') }}</ElTag>
      <ElTag v-else type="info" size="small">{{ t('label.collaborator_role') }}</ElTag>
    </div>

    <div class="mt-1 text-sm text-gray-600">
      <span v-if="collaboratorCount !== undefined">
        {{ t('label.collaborator_count', { count: collaboratorCount }) }}
      </span>
    </div>

    <button
      type="button"
      class="absolute bottom-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 transition hover:bg-gray-100"
      @click.stop="handleExpand"
      aria-label="expand"
    >
      <ArrowRight />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';

import type { ProjectResponse } from '@/types/response';

const props = defineProps<{
  project: ProjectResponse;
  isOwner: boolean;
  collaboratorCount?: number;
}>();

const emit = defineEmits<{
  expand: [projectId: string];
}>();

const { t } = useI18n();

const handleExpand = () => {
  emit('expand', props.project.id);
};
</script>
