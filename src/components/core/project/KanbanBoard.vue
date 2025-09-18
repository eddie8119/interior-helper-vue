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
import { onMounted, ref, watch } from 'vue';
import { Container, Draggable } from 'vue3-smooth-dnd';

import { taskApi } from '@/api/task';
import AddNewConstruction from '@/components/core/kanbanBoard/AddNewConstruction.vue';
import ContainerItem from '@/components/core/kanbanBoard/ContainerItem.vue';
import { useConstructionActions } from '@/composables/todo/useConstructionActions';
import { useDraggableConstructions } from '@/composables/todo/useDraggableConstructions';
import { useTaskLocalStorage } from '@/composables/todo/useTaskLocalStorage';
import type { TaskResponse } from '@/types/response';
import { setupBeforeUnloadHandler } from '@/utils/storage/taskStorage';

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

// 任務相關資料
const fetchedTasks = ref<TaskResponse[] | null>(null);
const { localTasks, hasChanges, initLocalTasks, saveToLocalStorage } = useTaskLocalStorage(
  props.projectId,
  fetchedTasks
);

// 獲取任務數據
const fetchTasks = async () => {
  try {
    const response = await taskApi.getTasksByProjectId(props.projectId);
    if (response.success && response.data) {
      fetchedTasks.value = response.data;
      // 初始化本地任務數據
      initLocalTasks();
    }
  } catch (error) {
    console.error('獲取任務數據失敗:', error);
  }
};

// 保存任務數據到服務器
const saveTasksToServer = async () => {
  if (hasChanges.value && localTasks.value) {
    try {
      await taskApi.updateProjectTasks({}, props.projectId);
      // 重置更改狀態
      hasChanges.value = false;
    } catch (error) {
      console.error('保存任務數據失敗:', error);
    }
  }
};

// 設置頁面關閉時的處理函數
const beforeUnloadHandler = setupBeforeUnloadHandler(hasChanges, props.projectId, localTasks);
window.addEventListener('beforeunload', beforeUnloadHandler);

// 在組件卸載前移除事件監聽器
onMounted(() => {
  return () => {
    window.removeEventListener('beforeunload', beforeUnloadHandler);

    // 在組件卸載前嘗試保存數據
    saveTasksToServer();
  };
});

// 初始化
onMounted(() => {
  initializeConstructionContainers();
  fetchTasks();
});

// 定期保存任務數據
const autoSaveInterval = setInterval(() => {
  if (hasChanges.value) {
    saveTasksToServer();
  }
}, 60000); // 每分鐘保存一次

// 清除定時器
onMounted(() => {
  return () => {
    clearInterval(autoSaveInterval);
  };
});
</script>

<style scoped></style>
