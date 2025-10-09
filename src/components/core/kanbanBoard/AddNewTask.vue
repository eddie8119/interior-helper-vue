<template>
  <div class="flex flex-col space-y-3">
    <!-- 使用可重用的 TaskForm 組件 -->
    <TaskForm
      ref="taskFormRef"
      :construction-id="props.constructionId"
      :errors="errors"
      :error-message="errorMessage"
      :on-save="onAddTask"
      :disabled-save-button="isSubmitting"
      :on-cancel="onClose"
      :save-button-text="t('button.add')"
    />
  </div>
</template>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { CreateTaskSchema } from '@/utils/schemas/createTaskSchema';

import { taskApi } from '@/api/task';
import TaskForm from '@/components/core/kanbanBoard/TaskForm.vue';
import { useTaskContext } from '@/context/useTaskContext';
import { createTaskSchema } from '@/utils/schemas/createTaskSchema';

const { t } = useI18n();
const { addNewTask } = useTaskContext();

const props = defineProps<{
  constructionId: string;
  projectId: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

// 任務表單組件引用
const taskFormRef = ref<InstanceType<typeof TaskForm> | null>(null);
const errorMessage = ref<string>('');

const getInitialValues = (): CreateTaskSchema => ({
  title: '',
  description: '',
  materials: [],
  reminderDatetime: undefined,
  constructionType: props.constructionId,
  projectId: props.projectId,
  status: 'todo',
});

const { isSubmitting, handleSubmit, errors, resetForm } = useForm({
  validationSchema: toTypedSchema(createTaskSchema),
  initialValues: getInitialValues(),
});

// 提交狀態
const onAddTask = handleSubmit(async (values: CreateTaskSchema) => {
  if (!taskFormRef.value) return;

  // 清除任何材料驗證錯誤
  taskFormRef.value.clearMaterialErrors();

  // 過濾掉空的材料行
  const filteredMaterials = (values.materials || []).filter((m) => m.name && m.name.trim() !== '');

  const newTask: CreateTaskSchema = {
    ...values,
    materials: filteredMaterials,
  };

  try {
    const { success, message, data } = await taskApi.createTask(newTask, props.projectId);
    if (!success) {
      errorMessage.value = message ?? '';
      return;
    }
    if (success) {
      addNewTask(data);
      onClose();
    }
  } catch (error) {
    console.error('Failed to add task:', error);
  }
});

// 關閉表單
const onClose = () => {
  // 關閉時統一重置，避免再次打開時殘留 touched/errors
  resetForm({ values: getInitialValues() });
  taskFormRef.value?.clearMaterialErrors();
  emit('close');
};
</script>

<style scoped></style>
