<template>
  <div class="w-full overflow-x-auto">
    <Container
      orientation="horizontal"
      drag-handle-selector=".container-drag-handle"
      :get-child-payload="getConstructionContainerPayload"
      class="flex overflow-x-auto pt-4"
      @drop="onConstructionContainerDrop"
    >
      <!-- 工程類型容器 -->
      <Draggable v-for="(container, index) in constructionContainers" :key="container.id">
        <ContainerItem
          :id="container.id"
          :project-id="projectId"
          :construction-name="container.name"
          :filtered-tasks="filterTasksByConstructionType(container.name)"
          @delete-container="deleteConstruction(index)"
          @update:construction-name="updateConstructionName(index, $event)"
          @task-drop="handleTaskDrop($event, container.name)"
          @add-task="addNewTask($event, container.name)"
        />
      </Draggable>

      <!-- 添加新工程類型按鈕 -->
      <Draggable>
        <AddNewConstruction id="new-container" @add-container="addNewConstruction" />
      </Draggable>
    </Container>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { Container, Draggable } from 'vue3-smooth-dnd';

import type { TaskResponse } from '@/types/response';

import AddNewConstruction from '@/components/core/kanbanBoard/AddNewConstruction.vue';
import ContainerItem from '@/components/core/kanbanBoard/ContainerItem.vue';
import { useConstructionActions } from '@/composables/todo/useConstructionActions';
import { useDraggableConstructions } from '@/composables/todo/useDraggableConstructions';

const props = defineProps<{
  constructionContainer: string[] | null;
  projectId: string;
  tasks: TaskResponse[] | null;
}>();

const emit = defineEmits<{
  (e: 'update:constructionContainer', value: string[]): void;
  (e: 'update:projectAllTasks', value: TaskResponse[]): void;
}>();

//  管理容器拖拽功能
const {
  constructionContainers,
  initializeConstructionContainers,
  getConstructionContainerPayload,
  onConstructionContainerDrop,
  updateConstructionContainer,
} = useDraggableConstructions(props, emit);

// 監聽 props 變化
watch(
  () => props.constructionContainer,
  () => {
    initializeConstructionContainers();
  },
  { immediate: true }
);

// Construction容器的操作
const { deleteConstruction, addNewConstruction, updateConstructionName } = useConstructionActions(
  constructionContainers,
  updateConstructionContainer
);

// 根據工程類型過濾任務
const filterTasksByConstructionType = (constructionName: string) => {
  if (!props.tasks) return [];

  return props.tasks.filter((task: TaskResponse) => task.constructionType === constructionName);
};

// 處理任務拖曳事件
const handleTaskDrop = (dropResult: any, targetConstructionType: string) => {
  // 確保有任務數據
  if (!props.tasks) return;

  // 創建全部任務的副本
  let allTasks = [...props.tasks];

  // 如果是來自 ContainerBody 的更新事件
  if (dropResult.updatedTasks) {
    // 找出變更的任務
    const sourceTask = dropResult.sourceTask;
    const updatedTasks = dropResult.updatedTasks;

    if (sourceTask) {
      // 跨容器拖曳場景：先刪除原始任務，再添加更新後的任務
      allTasks = allTasks.filter((task) => task.id !== sourceTask.id);
    }

    // 將更新後的任務添加到全部任務中
    updatedTasks.forEach((updatedTask: TaskResponse) => {
      // 確保任務的 constructionType 正確
      updatedTask.constructionType = targetConstructionType;

      // 如果任務已存在，則替換；否則添加
      const existingTaskIndex = allTasks.findIndex((task) => task.id === updatedTask.id);
      if (existingTaskIndex !== -1) {
        allTasks[existingTaskIndex] = updatedTask;
      } else {
        allTasks.push(updatedTask);
      }
    });

    // 通知父組件更新所有任務
    emit('update:projectAllTasks', allTasks);
    return;
  }

  // 如果是直接的拖曳事件
  const { removedIndex, addedIndex, payload } = dropResult;

  if (removedIndex === null && addedIndex === null) return;

  // 找到被拖曳的任務
  const taskToUpdate = allTasks.find((task) => task.id === payload.id);
  if (taskToUpdate) {
    // 更新任務的工程類型
    const updatedTask = {
      ...taskToUpdate,
      constructionType: targetConstructionType,
    };

    // 更新任務列表
    allTasks = allTasks.map((task) => (task.id === payload.id ? updatedTask : task));

    // 通知父組件更新任務
    emit('update:projectAllTasks', allTasks);
  }
};

// 添加新任務
const addNewTask = (taskData: any, constructionType: string) => {
  if (!props.tasks) return;

  // 創建新任務

  // 更新任務列表
  // const updatedTasks = [...props.tasks, newTask as TaskResponse];
  // emit('update:projectAllTasks', updatedTasks);
};

// 初始化
onMounted(() => {
  initializeConstructionContainers();
});
</script>

<style scoped></style>
