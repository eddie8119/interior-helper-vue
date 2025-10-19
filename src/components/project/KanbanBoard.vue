<template>
  <KanbanFilterBar
    @update:selected-status="selectedStatus = $event"
    @update:days-range="daysRange = $event"
  />
  <div class="w-full overflow-auto">
    <Container
      orientation="horizontal"
      :drag-handle-selector="readOnly ? '' : '.container-drag-handle'"
      :get-child-payload="readOnly ? undefined : getConstructionContainerPayload"
      :group-name="readOnly ? undefined : 'construction-containers'"
      class="flex pt-4"
      style="overflow-x: auto; overflow-y: visible"
      @drop="onConstructionContainerDrop"
    >
      <!-- 工程類型容器 -->
      <Draggable v-for="(container, index) in localConstructionContainer" :key="container.id">
        <ConstructionContainerItem
          :construction-id="container.id"
          :project-id="projectId"
          :construction-name="container.name"
          :tasks="filteredTasks(container.id)"
          :days-range="daysRange"
          :read-only="readOnly"
          @delete-container="deleteConstruction(index)"
          @update:construction-name="updateConstructionName(index, $event)"
          @task-drop="handleTaskDrop($event, container.id)"
        />
      </Draggable>
      <!-- 添加新工程類型 -->
      <AddNewConstruction v-if="!readOnly" id="new-container" @add-container="addNewConstruction" />
    </Container>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { Container, Draggable } from 'vue3-smooth-dnd';

import type { TaskFilterStatus } from '@/constants/selection';
import type { TaskResponse } from '@/types/response';
import type { ConstructionSelection } from '@/types/selection';

import { taskApi } from '@/api/task';
import AddNewConstruction from '@/components/kanbanBoard/AddNewConstruction.vue';
import ConstructionContainerItem from '@/components/kanbanBoard/ConstructionContainerItem.vue';
import KanbanFilterBar from '@/components/project/KanbanFilterBar.vue';
import { useConstructionActions } from '@/composables/todo/useConstructionActions';
import { useDraggableConstructions } from '@/composables/todo/useDraggableConstructions';
import { type DraggableTask, useTaskDragAndDrop } from '@/composables/todo/useDraggableTasks';
import { useTaskOperations } from '@/composables/todo/useTaskOperations';
import { provideTaskCardFilter } from '@/context/useTaskCardFilter';
import { provideTaskContext } from '@/context/useTaskContext';
import { filterTasksByConstruction, processTasksWithOrder } from '@/utils/todo/taskUtils';

const props = defineProps<{
  constructionContainer: ConstructionSelection[] | null;
  projectId: string;
  tasks: TaskResponse[] | null;
  readOnly?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:constructionContainer', value: ConstructionSelection[]): void;
  (e: 'update:projectAllTasks', value: TaskResponse[]): void;
}>();

// 狀態管理
const localConstructionContainer = ref<ConstructionSelection[]>([]);
const localTasks = ref<TaskResponse[]>([]);
const selectedStatus = ref<TaskFilterStatus>('all');
const daysRange = ref<[number, number]>([0, 10]);

// Context 提供
provideTaskCardFilter();

const onContainerUpdate = (newContainers: ConstructionSelection[]) => {
  emit('update:constructionContainer', newContainers);
};

const onTaskUpdate = (newTasks: TaskResponse[]) => {
  emit('update:projectAllTasks', newTasks);
};

// ==================== Composables ====================
// 工程容器操作
const { deleteConstruction, addNewConstruction, updateConstructionName } = useConstructionActions(
  localConstructionContainer,
  onContainerUpdate
);

// 任務操作
const { deleteTask, addNewTask, updateTask } = useTaskOperations(localTasks, onTaskUpdate);

// 拖曳邏輯
const { getConstructionContainerPayload, onConstructionContainerDrop } = useDraggableConstructions(
  localConstructionContainer,
  onContainerUpdate
);

const { handleTaskDrop } = useTaskDragAndDrop(localTasks, onTaskUpdate);

// ==================== 數據初始化與同步 ====================
// 初始化工程容器
watch(
  () => props.constructionContainer,
  (newContainers: ConstructionSelection[] | null) => {
    localConstructionContainer.value = [...(newContainers || [])];
  },
  { immediate: true }
);

// 初始化任務並處理排序
watch(
  () => props.tasks,
  (newTasks: TaskResponse[] | null) => {
    localTasks.value = processTasksWithOrder(newTasks as DraggableTask[] | null);
  },
  { immediate: true, deep: true }
);

// 提供任務上下文給子組件
provideTaskContext({
  deleteTask,
  addNewTask,
  updateTask,
});

// ==================== 計算屬性與過濾 ====================
// 按狀態過濾任務
const filteredTasksByStatus = computed(() => {
  if (selectedStatus.value === 'all') {
    return localTasks.value;
  }
  return localTasks.value.filter((task: TaskResponse) => task.status === selectedStatus.value);
});

// 按工程類型過濾任務
const filteredTasks = (constructionId: string) => {
  return filterTasksByConstruction(filteredTasksByStatus.value, constructionId);
};

// 組件卸載前保存任務數據
onBeforeUnmount(() => {
  if (localTasks.value.length) {
    taskApi.updateProjectTasksWithBeacon(localTasks.value, props.projectId);
  }
});
</script>

<style scoped></style>
