<template>
  <div class="w-full overflow-x-auto">
    <Container
      orientation="horizontal"
      drag-handle-selector=".container-drag-handle"
      :get-child-payload="getConstructionContainerPayload"
      group-name="construction-containers"
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
        />
      </Draggable>
      <!-- 添加新工程類型 -->
      <AddNewConstruction id="new-container" @add-container="addNewConstruction" />
    </Container>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { Container, Draggable } from 'vue3-smooth-dnd';

import type { TaskResponse } from '@/types/response';
import type { ConstructionSelection } from '@/types/selection';

import AddNewConstruction from '@/components/core/kanbanBoard/AddNewConstruction.vue';
import ContainerItem from '@/components/core/kanbanBoard/ContainerItem.vue';
import { useConstructionActions } from '@/composables/todo/useConstructionActions';
import {
  type ConstructionContainer,
  useDraggableConstructions,
} from '@/composables/todo/useDraggableConstructions';
import { type DraggableTask, useTaskDragAndDrop } from '@/composables/todo/useDraggableTasks';

const props = defineProps<{
  constructionContainer: ConstructionSelection[] | null;
  projectId: string;
  tasks: TaskResponse[] | null;
}>();

const emit = defineEmits<{
  (e: 'update:constructionContainer', value: ConstructionSelection[]): void;
  (e: 'update:projectAllTasks', value: DraggableTask[]): void;
}>();

// 管理容器狀態
const constructionContainers = ref<ConstructionContainer[]>([]);

// 初始化容器
const initializeConstructionContainers = () => {
  constructionContainers.value =
    props.constructionContainer?.map((item: ConstructionSelection) => ({
      id: `container-${item.id}`,
      name: item.name,
    })) || [];
};

// 監聽 props 變化以重新初始化
watch(() => props.constructionContainer, initializeConstructionContainers, { immediate: true });

// 容器更新回調
const onContainerUpdate = (newContainers: ConstructionContainer[]) => {
  emit(
    'update:constructionContainer',
    newContainers.map((c, index) => ({
      id: parseInt(c.id.replace('container-', '')) || index,
      name: c.name,
    }))
  );
};

// 拖曳邏輯
const { getConstructionContainerPayload, onConstructionContainerDrop } = useDraggableConstructions(
  constructionContainers,
  onContainerUpdate
);

// 容器操作邏輯
const { deleteConstruction, addNewConstruction, updateConstructionName } = useConstructionActions(
  constructionContainers,
  onContainerUpdate
);

// 為任務列表創建一個本地的、可排序的副本
const localTasks = ref<DraggableTask[]>([]);

watch(
  () => props.tasks,
  (newTasks: TaskResponse[] | null) => {
    if (newTasks) {
      // 為每個任務分配 order 屬性，以便排序
      const taskMap: { [key: string]: DraggableTask[] } = {};
      newTasks.forEach((task: TaskResponse) => {
        const constructionType = task.constructionType || 'uncategorized';
        if (!taskMap[constructionType]) {
          taskMap[constructionType] = [];
        }
        taskMap[constructionType].push(task as DraggableTask);
      });

      const processedTasks: DraggableTask[] = [];
      Object.values(taskMap).forEach((group: DraggableTask[]) => {
        group
          .sort(
            (a: DraggableTask, b: DraggableTask) => (a.order ?? Infinity) - (b.order ?? Infinity)
          )
          .forEach((task: DraggableTask, index: number) => {
            task.order = index;
            processedTasks.push(task);
          });
      });
      localTasks.value = processedTasks;
    } else {
      localTasks.value = [];
    }
  },
  { immediate: true, deep: true }
);

// 根據工程類型過濾任務
const filterTasksByConstructionType = (constructionName: string) => {
  // 找到對應的 construction id
  const construction = props.constructionContainer?.find((c) => c.name === constructionName);
  const constructionId = construction?.id;

  return localTasks.value
    .filter((task: DraggableTask) => task.constructionType === constructionId)
    .sort((a: DraggableTask, b: DraggableTask) => (a.order ?? 0) - (b.order ?? 0));
};

// 處理任務任務拖曳
const { handleTaskDrop } = useTaskDragAndDrop(localTasks, (updatedTasks: DraggableTask[]) => {
  emit('update:projectAllTasks', updatedTasks);
});

// 初始化
onMounted(() => {
  initializeConstructionContainers();
});
</script>

<style scoped></style>
