<template>
  <section class="w-full">
    <!-- 篩選器 -->
    <TaskStatusDateFilter
      @update:selected-status="selectedStatus = $event"
      @update:days-range="daysRange = $event"
    />

    <!-- 拖曳容器區域 -->
    <div class="overflow-x-auto overflow-y-visible pt-4">
      <Container
        :key="isMobile ? 'vertical' : 'horizontal'"
        :orientation="isMobile ? 'vertical' : 'horizontal'"
        :drag-handle-selector="readOnly ? '.__disabled__' : '.container-drag-handle'"
        :get-child-payload="readOnly ? undefined : getConstructionContainerPayload"
        :group-name="readOnly ? undefined : 'construction-containers'"
        :non-drag-area-selector="readOnly ? '*' : undefined"
        :should-accept-drop="() => !readOnly"
        class="grid grid-cols-1 gap-4 md:flex md:items-start"
        @drop="!readOnly && onConstructionContainerDrop($event)"
      >
        <!-- 新增工程類型 -->
        <AddNewConstruction
          v-if="!readOnly"
          id="new-container"
          class="w-full shrink-0 md:w-[320px]"
          :existing-constructions="localConstructionContainer"
          @add-container="addNewConstruction"
        />

        <!-- 工程容器 -->
        <Draggable
          v-for="(container, index) in localConstructionContainer"
          :key="container.id"
          class="w-full shrink-0 md:w-[320px]"
        >
          <ConstructionContainerItem
            :construction-id="container.id"
            :project-id="projectId"
            :construction-name="container.name"
            :tasks="filteredTasksByConstruction(container.id)"
            :days-range="daysRange"
            :read-only="readOnly"
            @delete-container="handleDeleteConstruction(index)"
            @update:construction-name="updateConstructionName(index, $event)"
            @task-drop="handleTaskDrop($event, container.id)"
          />
        </Draggable>
      </Container>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue';
import { Container, Draggable } from 'vue3-smooth-dnd';

import type { TaskResponse } from '@/types/response';
import type { ConstructionSelection } from '@/types/selection';

import { taskApi } from '@/api/task';
import AddNewConstruction from '@/components/kanbanBoard/AddNewConstruction.vue';
import ConstructionContainerItem from '@/components/kanbanBoard/ConstructionContainerItem.vue';
import TaskStatusDateFilter from '@/components/project/TaskStatusDateFilter.vue';
import { useConstructionActions } from '@/composables/todo/useConstructionActions';
import { useDraggableConstructions } from '@/composables/todo/useDraggableConstructions';
import { type DraggableTask, useTaskDragAndDrop } from '@/composables/todo/useDraggableTasks';
import { useTaskOperations } from '@/composables/todo/useTaskOperations';
import { useResponsiveWidth } from '@/composables/useResponsiveWidth';
import { useTaskConditionFilters } from '@/composables/useTaskConditionFilters';
import { useTasks } from '@/composables/useTasks';
import { provideTaskCardFilter } from '@/context/useTaskCardFilter';
import { provideTaskContext } from '@/context/useTaskContext';
import { useEditingStateStore } from '@/stores/editingState';
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
const { selectedStatus, daysRange, filteredTasksByConstruction } =
  useTaskConditionFilters(localTasks);

// Context 提供
provideTaskCardFilter();

const onContainerUpdate = (newContainers: ConstructionSelection[]) => {
  emit('update:constructionContainer', newContainers);
};

const onTaskUpdate = (newTasks: TaskResponse[]) => {
  emit('update:projectAllTasks', newTasks);
};

// ==================== Composables ====================
const { isMobile } = useResponsiveWidth();
const editingStateStore = useEditingStateStore();

// 任務操作
const { deleteTask, addNewTask, updateTask } = useTaskOperations(localTasks, onTaskUpdate);

// API 任務操作（用於刪除任務）
const { deleteTask: deleteTaskFromApi } = useTasks(props.projectId);

// 工程容器操作
const { addNewConstruction, updateConstructionName, deleteConstructionWithTasks } =
  useConstructionActions(localConstructionContainer, onContainerUpdate, {
    tasksRef: localTasks,
    deleteTaskFromApi,
    deleteTaskFromState: deleteTask,
    filterTasksByConstruction,
  });

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

// 處理刪除工程容器（包含刪除容器內的所有任務）
const handleDeleteConstruction = async (index: number) => {
  await deleteConstructionWithTasks(index);
};

// 組件卸載前保存任務數據
onBeforeUnmount(() => {
  if (localTasks.value.length) {
    taskApi.updateProjectTasksWithBeacon(localTasks.value, props.projectId);
  }
  // 如有處於編輯中的元件，恢復為初始狀態
  editingStateStore.stopEditing();
});
</script>

<style scoped></style>
