<template>
  <!-- 編輯模式：添加新任務 -->

  <AddNewTask
    v-if="isEditing"
    :construction-id="constructionId"
    :project-id="projectId"
    @close="stopEditing"
  />

  <!-- 摺疊按鈕 -->
  <div v-if="tasks.length > 0" class="mb-2 flex w-full justify-end md:hidden">
    <CollapseButton :is-collapsed="isCollapsed" @click="toggleCollapse">
      {{ isCollapsed ? t('button.fold.expand') : t('button.fold.collapse')
      }}{{ t('label.task.task') }}
    </CollapseButton>
  </div>

  <!-- 任務列表 -->
  <Container
    v-if="!isCollapsed"
    :key="containerKey"
    group-name="tasks"
    orientation="vertical"
    :get-child-payload="getTaskPayload"
    :should-accept-drop="shouldAcceptDrop"
    :drag-begin-delay="0"
    :animation-duration="150"
    :auto-scroll-enabled="false"
    :behaviour="'move'"
    :drag-handle-selector="'.task-drag-handle'"
    class="grid grid-cols-1 gap-3"
    style="overflow: visible auto; touch-action: pan-y"
    @drop="(event) => !readOnly && handleTaskDrop(event)"
  >
    <Draggable v-for="task in tasks" :key="task.id">
      <TaskCard :task="task" :read-only="readOnly" />
    </Draggable>
  </Container>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Container, Draggable } from 'vue3-smooth-dnd';

import type { TaskResponse } from '@/types/response';

import CollapseButton from '@/components/core/button/CollapseButton.vue';
import AddNewTask from '@/components/kanbanBoard/AddNewTask.vue';
import TaskCard from '@/components/task/TaskCard.vue';
import { useResponsiveWidth } from '@/composables/ui/useResponsiveWidth';
import { useEditingStateStore } from '@/stores/editingState';

const props = defineProps<{
  constructionId: string;
  projectId: string;
  tasks: TaskResponse[];
  readOnly?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:tasks', tasks: TaskResponse[]): void;
  (e: 'task-drop', dropData: unknown): void;
  (e: 'collapse-change', value: boolean): void;
}>();

const editingStateStore = useEditingStateStore();
const { t } = useI18n();
const { isMobile } = useResponsiveWidth();

const isCollapsed = computed(() => {
  return isMobile.value ? true : false;
});

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
  emit('collapse-change', isCollapsed.value);
};

onMounted(() => {
  // emit initial state to parent so header can reflect visibility
  emit('collapse-change', isCollapsed.value);
});

// 使用計算屬性來判斷當前容器是否處於編輯狀態
const isEditing = computed(() => {
  return editingStateStore.isEditing('container', props.constructionId);
});

const containerKey = computed(() => {
  return props.tasks.map((task) => task.id).join('-');
});

// 停止編輯任務
const stopEditing = () => {
  editingStateStore.stopEditing();
};

// 獲取任務 payload
const getTaskPayload = (index: number) => {
  return props.tasks[index];
};

interface DropResult {
  removedIndex: number | null;
  addedIndex: number | null;
  payload: unknown;
}

interface SourceContainerOptions {
  groupName: string;
  [key: string]: unknown;
}

// 處理任務拖曳
const handleTaskDrop = (dropResult: DropResult) => {
  const { removedIndex, addedIndex } = dropResult;

  // 如果沒有發生任何移動，則不執行任何操作
  if (removedIndex === null && addedIndex === null) return;

  // 直接將原始的 dropResult 事件向上傳遞
  emit('task-drop', dropResult);
};

// 判斷是否接受拖曳
const shouldAcceptDrop = (sourceContainerOptions: SourceContainerOptions) => {
  // 只接受來自 'tasks' 群組的拖曳物件
  return sourceContainerOptions.groupName === 'tasks';
};
</script>

<style scoped>
.task-item {
  cursor: grab;
  transition: all 0.2s ease;
  margin-bottom: 8px;
  position: relative;
}

.task-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgb(0 0 0 / 10%);
}

.task-item:active {
  cursor: grabbing;
  transform: scale(0.98);
}

.task-ghost-drop {
  transition: all 0.3s ease;
  border: 2px dashed #60a5fa;
  background-color: rgb(96 165 250 / 10%);
  margin: 8px 0;
  border-radius: 8px;
  min-height: 60px;
}

/* 動畫效果 */
.smooth-dnd-container > .smooth-dnd-draggable-wrapper {
  transition: transform 0.25s ease;
}
</style>
