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
          @delete-container="deleteConstruction(index)"
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
import { onMounted, ref, watch } from 'vue';
import { Container, Draggable } from 'vue3-smooth-dnd';

import type { TaskResponse } from '@/types/response';

import AddNewConstruction from '@/components/core/kanbanBoard/AddNewConstruction.vue';
import ContainerItem from '@/components/core/kanbanBoard/ContainerItem.vue';
import { useConstructionActions } from '@/composables/todo/useConstructionActions';
import { useDraggableConstructions } from '@/composables/todo/useDraggableConstructions';
import { setupBeforeUnloadHandler } from '@/utils/storage/taskStorage';

const props = defineProps<{
  constructionContainer: string[] | null;
  projectId: string;
  tasks: TaskResponse[] | null;
}>();

const emit = defineEmits<{
  (e: 'update:constructionContainer', value: string[]): void;
  (e: 'update:taskContainer', value: TaskResponse[]): void;
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

// 初始化
onMounted(() => {
  initializeConstructionContainers();
});
</script>

<style scoped></style>
