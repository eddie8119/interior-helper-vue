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
      <Draggable v-for="(container, index) in localConstructionContainer" :key="container.id">
        <ConstructionContainerItem
          :id="container.id"
          :project-id="projectId"
          :construction-name="container.name"
          :filtered-tasks="filteredTasks(container.id)"
          @delete-container="deleteConstruction(index)"
          @update:construction-name="updateConstructionName(index, $event)"
          @task-drop="handleTaskDrop($event, container.id)"
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
import ConstructionContainerItem from '@/components/core/kanbanBoard/ConstructionContainerItem.vue';
import { useConstructionActions } from '@/composables/todo/useConstructionActions';
import { useDraggableConstructions } from '@/composables/todo/useDraggableConstructions';
import { type DraggableTask, useTaskDragAndDrop } from '@/composables/todo/useDraggableTasks';
import { filterTasksByConstruction } from '@/utils/todo/taskUtils';

const props = defineProps<{
  constructionContainer: ConstructionSelection[] | null;
  projectId: string;
  tasks: TaskResponse[] | null;
}>();

const emit = defineEmits<{
  (e: 'update:constructionContainer', value: ConstructionSelection[]): void;
  (e: 'update:projectAllTasks', value: DraggableTask[]): void;
}>();

// amount of editing 都會使用本地副本
const localConstructionContainer = ref<ConstructionSelection[]>([]);
const localTasks = ref<DraggableTask[]>([]);

const initializelocalConstructionContainer = () => {
  localConstructionContainer.value = [...(props.constructionContainer || [])];
};

watch(() => props.constructionContainer, initializelocalConstructionContainer, { immediate: true });

onMounted(() => {
  initializelocalConstructionContainer();
});

// 容器更新回調
const onContainerUpdate = (newContainers: ConstructionSelection[]) => {
  emit('update:constructionContainer', newContainers);
};

// usecomposable
// 容器操作邏輯
const { deleteConstruction, addNewConstruction, updateConstructionName } = useConstructionActions(
  localConstructionContainer,
  onContainerUpdate
);
// 拖曳邏輯
const { getConstructionContainerPayload, onConstructionContainerDrop } = useDraggableConstructions(
  localConstructionContainer,
  onContainerUpdate
);
// 處理任務任務拖曳 (放在localTasks之後)
const { handleTaskDrop } = useTaskDragAndDrop(localTasks, (updatedTasks: DraggableTask[]) => {
  emit('update:projectAllTasks', updatedTasks);
});

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

// 使用工具函數過濾任務
const filteredTasks = (constructionId: number) => {
  return filterTasksByConstruction(localTasks.value, constructionId);
};
</script>

<style scoped></style>
