<template>
  <div class="w-full overflow-x-auto">
    <Container
      orientation="horizontal"
      @drop="onContainerDrop"
      drag-handle-selector=".container-drag-handle"
      :get-child-payload="getContainerPayload"
      class="flex overflow-x-auto pt-4"
    >
      <!-- 工程類型容器 -->
      <Draggable v-for="(container, index) in containers" :key="container.id">
        <ContainerItem
          :id="container.id"
          :name="container.name"
          :is-default="isDefaultContainer(index)"
          @delete-container="deleteContainer(index)"
          @add-task="handleAddTask(container.id)"
          @update:name="updateContainerName(index, $event)"
        />
      </Draggable>

      <!-- 添加新工程類型按鈕 -->
      <Draggable>
        <AddNewContainer @add-container="addNewContainer" />
      </Draggable>
    </Container>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { Container, Draggable } from 'vue3-smooth-dnd';
import ContainerItem from '@/components/core/kanbanBoard/ContainerItem.vue';
import AddNewContainer from '@/components/core/kanbanBoard/AddNewContainer.vue';
import { useContainerActions } from '@/composables/useContainerActions';
import { useDraggableContainers } from '@/composables/useDraggableContainers';

const props = defineProps<{
  constructionContainer: string[] | undefined;
}>();

const emit = defineEmits<{
  (e: 'update:constructionContainer', value: string[]): void;
}>();

// 使用 useDraggableContainers composable 管理容器拖拽功能
const {
  containers,
  initializeContainers,
  getContainerPayload,
  onContainerDrop,
  updateConstructionContainer,
} = useDraggableContainers(props, emit);

// 監聽 props 變化
watch(
  () => props.constructionContainer,
  () => {
    initializeContainers();
  },
  { immediate: true }
);

// 判斷是否為默認容器（不可刪除）
const isDefaultContainer = (index: number) => {
  return props.constructionContainer ? index < (props.constructionContainer.length || 0) : false;
};

// 容器的操作
const { deleteContainer, addNewContainer, updateContainerName } = useContainerActions(
  containers,
  updateConstructionContainer
);

// 處理添加任務的方法
const handleAddTask = (containerId: string) => {
  // 目前只是一個佔位符方法，可以在實現任務管理功能時擴展
  console.log(`添加任務到容器: ${containerId}`);
};

// 初始化
onMounted(() => {
  initializeContainers();
});
</script>

<style scoped></style>
