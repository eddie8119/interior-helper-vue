<template>
  <div
    v-if="!isEditing"
    class="task-card background-color-difference group relative cursor-pointer rounded-md p-1 shadow-sm duration-200"
    :class="timeAlertLineClasses"
    @dblclick="handleDblClick"
  >
    <!-- 提醒訊息 -->
    <div v-if="timeAlertStatus !== 'none'" class="absolute bottom-[6px] right-[6px]">
      <StatusLabel :show-index="timeAlertStatus" :class-label="timeAlertAreaClasses" />
    </div>
    <TaskCardHeader
      :task="task"
      :read-only="readOnly"
      :show-router="showRouter"
      @edit="startEditing"
      @delete="$emit('delete', $event)"
      @update:status="handleTaskStatusChange"
    />
    <TaskCardDetails :task="task" />
  </div>

  <TaskForm
    v-else
    :initial-data="task"
    :show-more="true"
    :construction-id="task.constructionType"
    :errors="{}"
    :on-save="onUpdateTask"
    :on-cancel="cancelEditing"
  />
</template>

<script setup lang="ts">
import { useForm } from 'vee-validate';
import { computed, toRef } from 'vue';

import type { TaskResponse } from '@/types/response';
import type { TaskStatus } from '@/types/task';

import TaskForm from '@/components/kanbanBoard/TaskForm.vue';
import TaskCardDetails from '@/components/task/TaskCardDetails.vue';
import TaskCardHeader from '@/components/task/TaskCardHeader.vue';
import StatusLabel from '@/components/ui/StatusLabel.vue';
import { useTaskTimeAlert } from '@/composables/useTaskTimeAlert';
import { useEditingStateStore } from '@/stores/editingState';

const props = withDefaults(
  defineProps<{
    task: TaskResponse;
    readOnly?: boolean;
    showRouter?: boolean;
  }>(),
  {
    showRouter: false,
  }
);

const emit = defineEmits<{
  (e: 'update:task', taskId: string, patch: Partial<TaskResponse>): void;
  (e: 'delete', taskId: string): void;
}>();

const taskRef = toRef(props, 'task');
const { timeAlertStatus, timeAlertLineClasses, timeAlertAreaClasses } = useTaskTimeAlert(taskRef);
const editingStateStore = useEditingStateStore();

const isEditing = computed(() => {
  return editingStateStore.isEditing('task', props.task.id);
});
const { values, setValues } = useForm<Partial<TaskResponse>>();

const startEditing = () => {
  const { id, title, description, reminderDateTime, materials, endDateTime } = props.task;

  editingStateStore.startEditing('task', id);
  setValues({
    title,
    description,
    reminderDateTime,
    materials,
    endDateTime,
  });
};

const handleDblClick = () => {
  if (!props.readOnly) startEditing();
};

const cancelEditing = () => {
  editingStateStore.stopEditing();
};

const onUpdateTask = async () => {
  emit('update:task', props.task.id, values);
  editingStateStore.stopEditing();
};

const handleTaskStatusChange = (status: TaskStatus) => {
  if (props.readOnly) return;
  emit('update:task', props.task.id, { ...props.task, status });
};
</script>

<style scoped>
.task-card {
  transition: all 0.2s ease;
}

.task-card:hover {
  box-shadow:
    0 4px 6px -1px rgb(0 0 0 / 10%),
    0 2px 4px -1px rgb(0 0 0 / 6%);
}
</style>
