<template>
  <div
    v-if="!isEditing"
    class="task-card background-color-difference group relative cursor-pointer rounded-md p-1 shadow-sm duration-200"
    :class="timeAlertStyleClasses"
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
    :errors="errors"
    :disabled-save-button="isSubmitting"
    :on-save="onUpdateTask"
    :on-cancel="cancelEditing"
  />
</template>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { computed, nextTick, toRef } from 'vue';
import { useI18n } from 'vue-i18n';

import type { TaskResponse } from '@/types/response';
import type { TaskStatus } from '@/types/task';

import TaskCardDetails from '@/components/task/TaskCardDetails.vue';
import TaskCardHeader from '@/components/task/TaskCardHeader.vue';
import TaskForm from '@/components/task/TaskForm.vue';
import StatusLabel from '@/components/ui/StatusLabel.vue';
import { useTaskTimeAlertStyle } from '@/composables/style/useTaskTimeAlertStyle';
import { useEditingStateStore } from '@/stores/editingState';
import { createTaskSchema } from '@/utils/schemas/createTaskSchema';

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
const { timeAlertStatus, timeAlertStyleClasses, timeAlertAreaClasses } =
  useTaskTimeAlertStyle(taskRef);
const editingStateStore = useEditingStateStore();
const { t } = useI18n();

const isEditing = computed(() => {
  return editingStateStore.isEditing('task', props.task.id);
});

const getInitialValues = () => ({
  title: props.task.title,
  description: props.task.description,
  materials: props.task.materials || [],
  reminderDateTime: props.task.reminderDateTime || undefined,
  endDateTime: props.task.endDateTime || undefined,
  constructionType: props.task.constructionType,
  projectId: props.task.projectId,
  status: props.task.status,
});

const { setValues, handleSubmit, errors, isSubmitting } = useForm({
  validationSchema: toTypedSchema(createTaskSchema(t)),
  initialValues: getInitialValues(),
});

// 設置初始值以建立 form context
nextTick(() => {
  setValues(getInitialValues());
});

const startEditing = () => {
  const { id, title, description, reminderDateTime, materials, endDateTime } = props.task;

  editingStateStore.startEditing('task', id);
  setValues({
    title,
    description,
    reminderDateTime: reminderDateTime || undefined,
    materials,
    endDateTime: endDateTime || undefined,
  });
};

const handleDblClick = () => {
  if (!props.readOnly) startEditing();
};

const cancelEditing = () => {
  editingStateStore.stopEditing();
};

const onUpdateTask = handleSubmit(
  async (validatedValues) => {
    // 過濾掉空的材料行
    const filteredMaterials = (validatedValues.materials || []).filter(
      (m) => m.name && m.name.trim() !== ''
    );

    const updateData = {
      ...validatedValues,
      materials: filteredMaterials,
    };

    emit('update:task', props.task.id, updateData);
    editingStateStore.stopEditing();
  },
  (errors) => {
    // 驗證失敗時的處理
    console.warn('TaskCardBase form validation failed:', errors);
  }
);

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
