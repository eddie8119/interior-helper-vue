<template>
  <div :class="['flex-shrink-0', isExpanded ? 'w-full min-w-[300px]' : 'w-[200px]']">
    <!-- Collapsed View -->
    <div
      v-if="!isExpanded"
      class="card-color-difference flex min-h-[120px] cursor-pointer flex-col justify-between rounded-lg p-4 transition-all hover:shadow-md"
      @click="toggleExpand"
    >
      <div class="mb-2 text-xs font-medium text-gray-500">
        {{ formatTime(task.reminderDatetime || task.endDate) }}
      </div>
      <div class="mb-3 line-clamp-2 text-sm font-semibold text-gray-900">
        {{ task.title }}
      </div>
      <div class="flex items-center justify-between">
        <div class="flex gap-1">
          <span v-if="task.materials && task.materials.length > 0" class="text-xs text-gray-500">
            📦
          </span>
          <span v-if="task.description" class="text-xs text-gray-500">📝</span>
        </div>
        <button type="button" class="rounded p-1 hover:bg-gray-100" @click.stop="toggleExpand">
          <ElIcon class="text-gray-600"><ArrowRight /></ElIcon>
        </button>
      </div>
    </div>

    <!-- Expanded View -->
    <div v-else class="card-color-difference w-full min-w-[300px] rounded-lg p-4 shadow-md">
      <div class="mb-3 flex items-start justify-between">
        <button type="button" class="rounded p-1 hover:bg-gray-100" @click="toggleExpand">
          <ElIcon class="text-gray-600"><ArrowLeft /></ElIcon>
        </button>
      </div>

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
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue';
import { ElIcon } from 'element-plus';
import { ref } from 'vue';

import type { TaskResponse } from '@/types/response';

import TaskCardBase from '@/components/task/TaskCardBase.vue';
import { formatTime } from '@/utils/dateUtils';

const props = defineProps<{
  task: TaskResponse;
  expanded: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:expanded', value: boolean): void;
  (e: 'update:task', taskId: string, patch: Partial<TaskResponse>): void;
  (e: 'delete', taskId: string): void;
}>();

const isExpanded = ref(props.expanded);

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
  emit('update:expanded', isExpanded.value);
};

const handleUpdateTask = (taskId: string, patch: Partial<TaskResponse>) => {
  emit('update:task', taskId, patch);
};

const handleDeleteTask = (taskId: string) => {
  emit('delete', taskId);
};
</script>

<style scoped></style>
