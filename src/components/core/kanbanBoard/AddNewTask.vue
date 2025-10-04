<template>
  <div class="flex flex-col space-y-3">
    <!-- 使用可重用的 TaskForm 組件 -->
    <TaskForm ref="taskFormRef" :construction-name="constructionName" :errors="errors" />

    <!-- 按鈕區域 -->
    <div class="flex justify-between">
      <button
        class="rounded-md bg-gray-200 px-3 py-1 text-gray-700 hover:bg-gray-300"
        @click="onClose"
      >
        {{ t('button.cancel') }}
      </button>
      <button
        class="rounded-md bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
        :disabled="isSubmitting"
        @click="onAddTask"
      >
        {{ t('button.add') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { CreateTaskSchema } from '@/utils/schemas/createTaskSchema';

import TaskForm from '@/components/core/kanbanBoard/TaskForm.vue';
import { createTaskSchema } from '@/utils/schemas/createTaskSchema';
import { useTaskContext } from '@/context/useTaskContext';

const { t } = useI18n();
const { addNewTask } = useTaskContext();

const props = defineProps<{
  constructionName: string;
  projectId: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

// 任務表單組件引用
const taskFormRef = ref<InstanceType<typeof TaskForm> | null>(null);

// 使用 vee-validate 和 zod 進行表單驗證
const { isSubmitting, handleSubmit, errors, setValues } = useForm({
  validationSchema: toTypedSchema(createTaskSchema),
  initialValues: {
    title: '',
    description: '',
    materials: [],
    reminderDatetime: undefined,
    constructionType: props.constructionName,
    projectId: props.projectId,
    status: 'todo',
  },
});

// 提交狀態
const onAddTask = handleSubmit(async (values) => {
  if (!taskFormRef.value) return;

  // 清除任何材料驗證錯誤
  taskFormRef.value.clearMaterialErrors();

  // 過濾掉空的材料行
  const filteredMaterials = (values.materials || []).filter((m) => m.name && m.name.trim() !== '');

  const newTask: CreateTaskSchema = {
    ...values,
    materials: filteredMaterials,
  };

  addNewTask(newTask);

  setValues({
    title: '',
    description: '',
    materials: [],
    reminderDatetime: undefined,
    status: 'todo',
  });

  taskFormRef.value.focusInput();
});

// 關閉表單
const onClose = () => {
  emit('close');
};
</script>

<style scoped></style>
