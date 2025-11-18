<template>
  <div
    :class="['min-w-0', isExpanded ? 'w-full basis-full' : 'w-[140px] flex-shrink-0 md:w-[150px]']"
  >
    <!-- Collapsed View -->
    <div
      v-if="!isExpanded"
      class="flex min-h-[120px] cursor-pointer flex-col justify-between rounded-lg bg-primary-card p-4 transition-all hover:shadow-md"
      role="button"
      tabindex="0"
      :aria-expanded="isExpanded"
      @click="toggleExpand"
      @keydown.enter.prevent="toggleExpand"
      @keydown.space.prevent="toggleExpand"
    >
      <header class="flex items-center justify-between">
        <div class="mb-2 font-medium text-gray-500">
          <time v-if="dueAt" :datetime="dueISO">
            {{ formatTime(dueAt) }}
          </time>
          <span v-else class="text-xs text-gray-400"
            >{{ t('common.no') }}{{ t('label.end_date_time') }}</span
          >
        </div>

        <button
          type="button"
          class="h-6 w-6 rounded bg-black-100 hover:bg-gray-100"
          aria-label="Expand task card"
          @click.stop="toggleExpand"
        >
          <ElIcon class="text-gray-600"><ArrowRight /></ElIcon>
        </button>
      </header>

      <H2Title
        :title="task.title + ' - ' + projectName"
        :class-name="'dark:text-primaryDark-text'"
      />
      <div v-if="task.description" class="w-full overflow-hidden text-ellipsis whitespace-nowrap">
        {{ task.description }}
      </div>
      <span v-if="task.materials && task.materials.length > 0" class="text-gray-500"> 📦 </span>
      <div class="mt-2 flex justify-end">
        <TaskStatusDropdown :read-only="true" :status="task.status" />
      </div>
    </div>

    <!-- Expanded View -->
    <div v-else class="w-full rounded-lg bg-primary-card p-4 shadow-md">
      <header class="mb-3 flex items-start justify-between">
        <button
          type="button"
          class="h-6 w-6 rounded bg-black-100 hover:bg-gray-100"
          aria-label="Collapse task card"
          @click="toggleExpand"
        >
          <ElIcon class="text-gray-600"><Close /></ElIcon>
        </button>
      </header>

      <!-- Full Task Card Content -->
      <TaskCardBase
        :task="task"
        :read-only="false"
        @update:task="handleUpdateTask"
        @delete="handleDeleteTask"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight, Close } from '@element-plus/icons-vue';
import { ElIcon } from 'element-plus';
import { computed, onDeactivated, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { ProjectTitle } from '@/types/project';
import type { TaskResponse } from '@/types/response';

import H2Title from '@/components/core/title/H2Title.vue';
import TaskCardBase from '@/components/task/TaskCardBase.vue';
import TaskStatusDropdown from '@/components/ui/TaskStatusDropdown.vue';
import { useProjectTitleList } from '@/context/useProjectTitleList';
import { formatTimeOnly as formatTime } from '@/utils/date';

const props = defineProps<{
  task: TaskResponse;
  expanded: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:expanded', value: boolean): void;
  (e: 'update:task', taskId: string, patch: Partial<TaskResponse>): void;
  (e: 'delete', taskId: string): void;
}>();

const { t } = useI18n();

const isExpanded = ref(props.expanded);

// Get project title from context
const { projectTitleList } = useProjectTitleList();

const projectName = computed(() => {
  const project = projectTitleList.value.find((p: ProjectTitle) => p.id === props.task.projectId);
  return project?.title ?? props.task.projectId;
});

// Metadata for due/reminder time used in template semantics
const dueAt = computed(() => props.task.reminderDateTime || props.task.endDateTime || null);
const dueISO = computed(() => (dueAt.value ? new Date(dueAt.value).toISOString() : ''));

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
  emit('update:expanded', isExpanded.value);
};

onDeactivated(() => {
  if (isExpanded.value) {
    isExpanded.value = false;
    emit('update:expanded', false);
  }
});

const handleUpdateTask = (taskId: string, patch: Partial<TaskResponse>) => {
  emit('update:task', taskId, patch);
};

const handleDeleteTask = (taskId: string) => {
  emit('delete', taskId);
};
</script>

<style scoped></style>
