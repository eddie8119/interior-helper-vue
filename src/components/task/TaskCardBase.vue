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
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <DragHandle v-if="!readOnly" :size="4" handle-class="task-drag-handle" />
        <H2Title :title="task.title" class="ml-2" />
      </div>
      <div class="flex items-center gap-2">
        <router-link
          v-if="showRouter"
          class="toggle-button"
          :to="`/todo/project/${task.projectId}`"
          >{{ t('button.leave_for') + t('project.project') }}</router-link
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
      <template v-if="hasDescription">
        <p class="text-color-difference text-lg">
          {{ descriptionText }}
        </p>
        <div v-if="showDescriptionDivider" class="divider-line" />
      </template>

      <!-- 任務材料 -->
      <template v-if="hasMaterials">
        <div>
          <Label :label="t('label.materials') + ':'" />
          <MaterialList :materials="materialsList" />
        </div>
        <div v-if="showMaterialsDivider" class="divider-line" />
      </template>

      <!-- 任務提醒 -->
      <div v-if="hasReminder" class="flex items-center text-gray-500">
        <DateIcon />
        <p class="mr-2">{{ t('label.reminder') }}</p>
        <span>{{ formatDate(reminderDateTime) }}</span>
      </div>
      <div v-if="hasEndDateTime" class="flex items-center text-gray-500">
        <DateIcon />
        <p class="mr-2">{{ t('label.end') }}</p>
        <span>{{ formatDate(endDateTime) }}</span>
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
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { UpdateTimeType } from '@/types/common';
import type { TaskResponse } from '@/types/response';
import type { TaskStatus } from '@/types/task';

import H2Title from '@/components/core/title/H2Title.vue';
import Label from '@/components/core/title/Label.vue';
import TaskForm from '@/components/kanbanBoard/TaskForm.vue';
import DateIcon from '@/components/ui/DateIcon.vue';
import DragHandle from '@/components/ui/DragHandle.vue';
import EditIcon from '@/components/ui/EditIcon.vue';
import MaterialList from '@/components/ui/MaterialList.vue';
import StatusLabel from '@/components/ui/StatusLabel.vue';
import TaskStatusDropdown from '@/components/ui/TaskStatusDropdown.vue';
import TrashButton from '@/components/ui/TrashButton.vue';
import { useTaskTimeAlert } from '@/composables/useTaskTimeAlert';
import { useTaskCardFilter } from '@/context/useTaskCardFilter';
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

const { t } = useI18n();
const { showDescription, showMaterials } = useTaskCardFilter();
const { timeAlertStatus, timeAlertLineClasses, timeAlertAreaClasses } = useTaskTimeAlert(
  props.task
);
const editingStateStore = useEditingStateStore();

const isEditing = ref(false);
const { values, setValues } = useForm<Partial<TaskResponse>>();

const descriptionText = computed(() => props.task.description?.trim() ?? '');
const materialsList = computed(() =>
  Array.isArray(props.task.materials) ? props.task.materials : []
);
const reminderDateTime = computed<UpdateTimeType>(() => props.task.reminderDateTime ?? null);
const endDateTime = computed<UpdateTimeType>(() => props.task.endDateTime ?? null);

const hasDescription = computed(() => showDescription.value && descriptionText.value.length > 0);
const hasMaterials = computed(() => showMaterials.value && materialsList.value.length > 0);
const hasReminder = computed(() => Boolean(reminderDateTime.value));
const hasEndDateTime = computed(() => Boolean(endDateTime.value));

const showDescriptionDivider = computed(
  () => hasDescription.value && (hasMaterials.value || hasReminder.value)
);
const showMaterialsDivider = computed(
  () => hasMaterials.value && (hasReminder.value || hasEndDateTime.value)
);

const startEditing = () => {
  editingStateStore.startEditing('task', props.task.id);
  setValues({
    title: props.task.title,
    description: props.task.description,
    reminderDateTime: props.task.reminderDateTime,
    materials: props.task.materials,
    endDateTime: props.task.endDateTime,
  });
  isEditing.value = true;
};

const handleDblClick = () => {
  if (!props.readOnly) startEditing();
};

const cancelEditing = () => {
  editingStateStore.stopEditing();
  isEditing.value = false;
};

const onUpdateTask = async () => {
  emit('update:task', props.task.id, values);
  editingStateStore.stopEditing();
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
    0 4px 6px -1px rgb(0 0 0 / 10%),
    0 2px 4px -1px rgb(0 0 0 / 6%);
}
</style>
