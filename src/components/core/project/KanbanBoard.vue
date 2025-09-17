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
          :construction-name="container.name"
          :project-id="projectId"
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
import { onMounted, watch } from 'vue';
import { Container, Draggable } from 'vue3-smooth-dnd';

import AddNewConstruction from '@/components/core/kanbanBoard/AddNewConstruction.vue';
import ContainerItem from '@/components/core/kanbanBoard/ContainerItem.vue';
import { useConstructionActions } from '@/composables/useConstructionActions';
import { useDraggableConstructions } from '@/composables/useDraggableConstructions';

const props = defineProps<{
  constructionContainer: string[] | undefined;
  projectId: string;
}>();

const emit = defineEmits<{
  (e: 'update:constructionContainer', value: string[]): void;
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
