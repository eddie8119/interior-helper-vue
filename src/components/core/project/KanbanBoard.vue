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
      <Draggable v-for="(container, index) in tasks" :key="container.id">
        <ContainerItem
          :id="container.id"
          :construction-name="container.name"
          @delete-container="deleteConstruction(index)"
          @add-task="handleAddTask(container.id)"
          @update:construction-name="updateConstructionName(index, $event)"
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

import AddNewConstruction from '@/components/core/kanbanBoard/AddNewConstruction.vue';
import ContainerItem from '@/components/core/kanbanBoard/ContainerItem.vue';
import { useConstructionActions } from '@/composables/useConstructionActions';
import { useTaskActions } from '@/composables/useTaskActions';
import { useDraggableConstructions } from '@/composables/useDraggableConstructions';

const props = defineProps<{
  constructionContainer: string[] | undefined;
}>();

const emit = defineEmits<{
  (e: 'update:constructionContainer', value: string[]): void;
}>();

// 使用 useDraggableConstructions composable 管理容器拖拽功能
const {
  tasks,
  initializeConstructionContainer,
  getConstructionContainerPayload,
  onConstructionContainerDrop,
  updateConstructionContainer,
} = useDraggableConstructions(props, emit);

// 監聽 props 變化
watch(
  () => props.constructionContainer,
  () => {
    initializeConstructionContainer();
  },
  { immediate: true }
);

// Construction容器的操作
const { deleteConstruction, addNewConstruction, updateConstructionName } = useConstructionActions(
  tasks,
  updateConstructionContainer
);
// Task容器的操作
const { addNewTask, deleteTask, updateTask } = useTaskActions(
  tasks,
  updateTaskContainer
);

// 處理添加任務的方法
const handleAddTask = (containerId: string) => {
  // 目前只是一個佔位符方法，可以在實現任務管理功能時擴展
  console.log(`添加任務到容器: ${containerId}`);
};

// 初始化
onMounted(() => {
  initializeConstructionContainer();
});
</script>

<style scoped></style>
