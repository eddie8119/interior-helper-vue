<template>
  <div
    v-if="!isEditing"
    class="task-card group cursor-pointer rounded-md bg-white p-1 shadow-sm duration-200"
    @dblclick="handleDblClick"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <DragHandle v-if="!readOnly" :size="4" handle-class="task-drag-handle" />
        <H3Title :title="task.title" class="ml-2" />
      </div>
      <div class="flex items-center gap-2">
        <router-link
          v-if="showRouter"
          class="toggle-button"
          :to="`/todo/project/${task.projectId}`"
          >{{ t('button.leave_for') }}</router-link
        >
        <TaskStatusDropdown
          :read-only="readOnly"
          :status="task.status"
          @update:status="handleTaskStatusChange"
        />
        <button
          v-if="!readOnly"
          class="rounded-full bg-blue-100 p-1 hover:bg-blue-200"
          @click="startEditing"
        >
          <EditIcon :size="'h-4 w-4'" />
        </button>
        <TrashButton
          v-if="!readOnly"
          class="invisible group-hover:visible"
          @click="$emit('delete', task.id)"
        />
      </div>
    </div>
    <!-- 任務描述 -->
    <div class="task-details grid grid-cols-1 gap-5 p-2">
      <p v-if="showDescription" class="text-lg">{{ task.description }}</p>

      <!-- 任務材料 -->
      <div v-if="showMaterials && task.materials && task.materials.length > 0">
        <Label :label="t('label.materials') + ':'" />
        <MaterialList :materials="task.materials" />
      </div>

      <!-- 任務提醒 -->
      <div v-if="task.reminderDatetime" class="flex items-center text-gray-500">
        <DateIcon />
        <p class="mr-2">{{ t('label.reminder') }}</p>
        <span>{{ formatDate(task.reminderDatetime) }}</span>
      </div>
    </div>
  </div>
  <div v-else class="rounded-md border p-2">
    <TaskForm
      :initial-data="task"
      :show-more="true"
      :construction-id="task.constructionType"
      :errors="{}"
      :on-save="onUpdateTask"
      :on-cancel="cancelEditing"
    />
  </div>
</template>

<script setup lang="ts">
import { useForm } from 'vee-validate';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { TaskResponse } from '@/types/response';
import type { TaskStatus } from '@/types/task';

import H3Title from '@/components/core/title/H3Title.vue';
import Label from '@/components/core/title/Label.vue';
import TaskForm from '@/components/kanbanBoard/TaskForm.vue';
import DateIcon from '@/components/ui/DateIcon.vue';
import DragHandle from '@/components/ui/DragHandle.vue';
import EditIcon from '@/components/ui/EditIcon.vue';
import MaterialList from '@/components/ui/MaterialList.vue';
import TaskStatusDropdown from '@/components/ui/TaskStatusDropdown.vue';
import TrashButton from '@/components/ui/TrashButton.vue';
import { useTaskCardFilter } from '@/context/useTaskCardFilter';

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

const { t } = useI18n();
const { showDescription, showMaterials } = useTaskCardFilter();

const isEditing = ref(false);
const { values, setValues } = useForm<Partial<TaskResponse>>();

const startEditing = () => {
  setValues({
    title: props.task.title,
    description: props.task.description,
    reminderDatetime: props.task.reminderDatetime,
    materials: props.task.materials,
  });
  isEditing.value = true;
};

const handleDblClick = () => {
  if (!props.readOnly) startEditing();
};

const cancelEditing = () => {
  isEditing.value = false;
};

const onUpdateTask = async () => {
  emit('update:task', props.task.id, values);
  isEditing.value = false;
};

const handleTaskStatusChange = (status: TaskStatus) => {
  if (props.readOnly) return;
  emit('update:task', props.task.id, { ...props.task, status });
};

// 格式化日期
const formatDate = (dateString: string | Date | number | null) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
};
</script>

<style scoped>
.task-card {
  transition: all 0.2s ease;
}

.task-card:hover {
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.task-details > *:not(:last-child)::after {
  content: '';
  display: block;
  border-bottom: 1px solid var(--tw-color-gray-200, #e5e7eb);
  margin-top: 1rem;
}
</style>
