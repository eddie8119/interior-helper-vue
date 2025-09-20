<template>
  <!-- 沒有任務，顯示空容器提示 -->
  <!-- <div
    v-if="tasks.length === 0"
    class="flex h-[100px] items-center justify-center rounded-md border border-gray-200 bg-white"
  >
    <span class="text-gray-400">尚無施作項目</span>
  </div> -->
  <!-- 任務列表 -->
  <Container
    group-name="tasks"
    orientation="vertical"
    :get-child-payload="getTaskPayload"
    @drop="handleTaskDrop"
    :should-accept-drop="shouldAcceptDrop"
    :drag-begin-delay="0"
    :animation-duration="150"
    :auto-scroll-enabled="true"
    :behaviour="'move'"
    class="task-container"
  >
    <!-- 任務列表 -->
    <Draggable v-for="task in tasks" :key="task.id">
      <TaskCard :task="task" @update:status="updateTaskStatus" />
    </Draggable>
  </Container>
  <!-- 編輯模式：添加新任務 -->
  <div v-show="isEditing">
    <AddNewTask
      :construction-name="constructionName"
      :project-id="projectId"
      @add-task="handleAddNewTask"
      @close="stopEditing"
    />
  </div>
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
  id: string;
  constructionName: string;
  projectId: string;
  tasks: TaskResponse[];
}>();

const emit = defineEmits<{
  (e: 'add-task', newTaskData: CreateTaskSchema): void;
  (e: 'update:tasks', tasks: TaskResponse[]): void;
  (e: 'task-drop', dropData: any): void;
}>();

const editingStateStore = useEditingStateStore();

// 使用計算屬性來判斷當前容器是否處於編輯狀態
const isEditing = computed(() => {
  return editingStateStore.isEditing('container', props.id);
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
const updateTaskStatus = (taskId: string, status: string) => {
  const updatedTasks = props.tasks.map((task: TaskResponse) => {
    if (task.id === taskId) {
      return { ...task, status };
    }
    return task;
  });

  emit('update:tasks', updatedTasks);
};

// 處理添加新任務
const handleAddNewTask = (newTaskData: CreateTaskSchema) => {
  emit('add-task', newTaskData);
  stopEditing();
};
</script>

<style scoped>
.task-container {
  min-height: 100px;
  padding: 8px 0;
}

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

/* 動態空位效果樣式 */
.task-ghost {
  opacity: 0.5;
  background-color: #f3f4f6;
  transform: scale(0.98);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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

/* 空白區域動畫 */
.smooth-dnd-container.vertical > .smooth-dnd-drop-preview-default-class {
  border: 2px dashed #60a5fa;
  background-color: rgba(96, 165, 250, 0.1);
  margin: 8px 0;
  border-radius: 8px;
  min-height: 60px;
}
</style>
