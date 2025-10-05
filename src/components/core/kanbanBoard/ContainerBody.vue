<template>
  <!-- 編輯模式：添加新任務 -->
  <div v-show="isEditing" class="mb-6 rounded-md border border-dashed border-brand-primary p-1">
    <AddNewTask :construction-id="constructionId" :project-id="projectId" @close="stopEditing" />
  </div>
  <!-- 任務列表 -->
  <Container
    group-name="tasks"
    orientation="vertical"
    :get-child-payload="getTaskPayload"
    :should-accept-drop="shouldAcceptDrop"
    :drag-begin-delay="0"
    :animation-duration="150"
    :auto-scroll-enabled="true"
    :behaviour="'move'"
    :drag-handle-selector="'.task-drag-handle'"
    class="max-h-[330px] overflow-y-auto"
    @drop="handleTaskDrop"
  >
    <!-- 任務列表 -->
    <Draggable v-for="task in tasks" :key="task.id">
      <TaskCard :task="task" @update:status="updateTaskStatus" />
    </Draggable>
  </Container>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Container, Draggable } from 'vue3-smooth-dnd';

import type { TaskResponse } from '@/types/response';
import type { CreateTaskSchema } from '@/utils/schemas/createTaskSchema';

import AddNewTask from '@/components/core/kanbanBoard/AddNewTask.vue';
import TaskCard from '@/components/core/kanbanBoard/TaskCard.vue';
import { useEditingStateStore } from '@/stores/editingState';

const props = defineProps<{
  constructionId: string;
  projectId: string;
  tasks: TaskResponse[];
}>();

const emit = defineEmits<{
  (e: 'update:tasks', tasks: TaskResponse[]): void;
  (e: 'task-drop', dropData: any): void;
}>();

const editingStateStore = useEditingStateStore();

// 使用計算屬性來判斷當前容器是否處於編輯狀態
const isEditing = computed(() => {
  return editingStateStore.isEditing('container', props.constructionId);
});

// 停止編輯任務
const stopEditing = () => {
  editingStateStore.stopEditing();
};

// 獲取任務 payload
const getTaskPayload = (index: number) => {
  return props.tasks[index];
};

// 處理任務拖曳
const handleTaskDrop = (dropResult: any) => {
  const { removedIndex, addedIndex } = dropResult;

  // 如果沒有發生任何移動，則不執行任何操作
  if (removedIndex === null && addedIndex === null) return;

  // 直接將原始的 dropResult 事件向上傳遞
  emit('task-drop', dropResult);
};

// 判斷是否接受拖曳
const shouldAcceptDrop = (sourceContainerOptions: any) => {
  // 只接受來自 'tasks' 群組的拖曳物件
  return sourceContainerOptions.groupName === 'tasks';
};

// 更新任務狀態
const updateTaskStatus = (taskId: string, status: 'todo' | 'in_progress' | 'done') => {
  const updatedTasks = props.tasks.map((task: TaskResponse) => {
    if (task.id === taskId) {
      return { ...task, status };
    }
    return task;
  });

  emit('update:tasks', updatedTasks);
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
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.task-item:active {
  cursor: grabbing;
  transform: scale(0.98);
}
.task-ghost-drop {
  transition: all 0.3s ease;
  border: 2px dashed #60a5fa;
  background-color: rgba(96, 165, 250, 0.1);
  margin: 8px 0;
  border-radius: 8px;
  min-height: 60px;
}

/* 動畫效果 */
.smooth-dnd-container > .smooth-dnd-draggable-wrapper {
  transition: transform 0.25s ease;
}
</style>
