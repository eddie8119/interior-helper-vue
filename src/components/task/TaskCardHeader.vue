<template>
  <div class="flex items-center justify-between">
    <div class="flex items-center">
      <DragHandle v-if="!readOnly" :size="4" handle-class="task-drag-handle" />

      <router-link
        v-if="showRouter"
        class="toggle-button"
        :to="{ path: `/todo/project/${task.projectId}`, query: { taskTitle: task.title } }"
      >
        <H3Title :title="task.title" class="blue-text ml-2 underline underline-offset-1" />
      </router-link>
      <H3Title v-else :title="task.title" class="ml-2" />
    </div>
    <div class="flex items-center gap-2">
      <button
        v-if="!readOnly"
        class="invisible rounded-full bg-blue-100 p-1 hover:bg-blue-200 group-hover:visible"
        @click="$emit('edit')"
      >
        <EditIcon :size="'h-4 w-4'" />
      </button>
      <TrashButton
        v-if="!readOnly"
        class="invisible group-hover:visible"
        @click="$emit('delete', task.id)"
      />
      <TaskStatusDropdown
        :read-only="readOnly"
        :status="task.status"
        @update:status="$emit('update:status', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TaskResponse } from '@/types/response';
import type { TaskStatus } from '@/types/task';

import H3Title from '@/components/core/title/H3Title.vue';
import DragHandle from '@/components/ui/DragHandle.vue';
import EditIcon from '@/components/ui/EditIcon.vue';
import TaskStatusDropdown from '@/components/ui/TaskStatusDropdown.vue';
import TrashButton from '@/components/ui/TrashButton.vue';

defineProps<{
  task: TaskResponse;
  readOnly?: boolean;
  showRouter?: boolean;
}>();

defineEmits<{
  (e: 'edit'): void;
  (e: 'delete', taskId: string): void;
  (e: 'update:status', status: TaskStatus): void;
}>();
</script>
