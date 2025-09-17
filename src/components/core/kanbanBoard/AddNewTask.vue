<template>
  <div class="flex flex-col space-y-3">
    <!-- 使用可重用的 TaskForm 組件 -->
    <TaskForm
      ref="taskFormRef"
      :construction-name="constructionName"
      @update:task-data="updateTaskData"
    />

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

import type { TaskData } from '@/types/task';

import TaskForm from '@/components/core/kanbanBoard/TaskForm.vue';
import { createTaskSchema } from '@/utils/schemas/createTaskSchema';

const { t } = useI18n();

const props = defineProps<{
  constructionName: string;
}>();

const { constructionName } = props;

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'add-task', task: TaskData): void;
}>();

// 任務表單組件引用
const taskFormRef = ref<InstanceType<typeof TaskForm> | null>(null);

// 使用 vee-validate 和 zod 進行表單驗證
const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(createTaskSchema),
});

// 當前任務數據
const taskData = ref<TaskData>({
  title: '',
  description: '',
  materials: [],
  reminderDatetime: null,
  type: constructionName,
  order: undefined,
});

// 更新任務數據
const updateTaskData = (newTaskData: TaskData) => {
  taskData.value = newTaskData;
};

// 提交狀態
const isSubmitting = ref(false);

// 關閉表單
const onClose = () => {
  emit('close');
};

// 添加新任務
const onAddTask = handleSubmit(async () => {
  isSubmitting.value = true;

  try {
    // 驗證材料
    if (taskFormRef.value && !taskFormRef.value.validateMaterials()) {
      isSubmitting.value = false;
      return;
    }

    // 過濾空材料
    const filteredMaterials = taskData.value.materials.filter((m) => m.name.trim() !== '');

    // 創建任務對象
    const newTask: TaskData = {
      title: taskData.value.title.trim(),
      description: taskData.value.description.trim(),
      materials: filteredMaterials,
      reminderDatetime: taskData.value.reminderDatetime,
      type: constructionName,
      order: 1,
    };

    emit('add-task', newTask);

    // 重置表單
    taskData.value = {
      title: '',
      description: '',
      materials: [],
      reminderDatetime: null,
      type: constructionName,
      order: undefined,
    };

    // 聚焦回輸入框
    taskFormRef.value?.focusInput();
  } finally {
    isSubmitting.value = false;
  }
});
</script>

<style scoped></style>
