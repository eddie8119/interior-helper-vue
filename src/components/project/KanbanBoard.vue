<template>
  <section class="w-full">
    <!-- 篩選器 -->
    <TaskStatusDateFilter
      @update:selected-status="selectedStatus = $event"
      @update:days-range="daysRange = $event"
      @update:search-query="searchQuery = $event"
    />

    <!-- 拖曳容器區域 -->
    <div class="overflow-x-auto overflow-y-visible pt-4">
      <div class="grid grid-cols-1 gap-4 md:flex md:items-start md:gap-0">
        <!-- 新增工程類型 -->
        <AddNewConstruction
          v-if="!readOnly"
          id="new-container"
          :existing-constructions="localConstructionContainer"
          @add-container="addNewConstruction"
        />

        <!-- 可拖拽的工程容器區域 -->
        <Container
          :key="isMobile ? 'vertical' : 'horizontal'"
          :orientation="isMobile ? 'vertical' : 'horizontal'"
          :drag-handle-selector="readOnly ? '.__disabled__' : '.container-drag-handle'"
          :get-child-payload="readOnly ? undefined : getConstructionContainerPayload"
          :group-name="readOnly ? undefined : 'construction-containers'"
          :non-drag-area-selector="readOnly ? '*' : undefined"
          :should-accept-drop="() => !readOnly"
          class="flex flex-1 gap-4"
          @drop="(event) => !readOnly && onConstructionContainerDrop(event)"
        >
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
              :search-query="searchQuery"
              :read-only="readOnly"
              @delete-container="handleDeleteConstruction(index)"
              @update:construction-name="updateConstructionName(index, $event)"
              @task-drop="handleTaskDrop($event, container.id)"
            />
          </Draggable>
        </Container>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue';
import { Container, Draggable } from 'vue3-smooth-dnd';

import type { TaskResponse } from '@/types/response';
import type { ConstructionSelection } from '@/types/selection';

import AddNewConstruction from '@/components/kanbanBoard/AddNewConstruction.vue';
import ConstructionContainerItem from '@/components/kanbanBoard/ConstructionContainerItem.vue';
import TaskStatusDateFilter from '@/components/project/TaskStatusDateFilter.vue';
import { useTasks } from '@/composables/query/useTasks';
import { useConstructionActions } from '@/composables/todo/useConstructionActions';
import { useDraggableConstructions } from '@/composables/todo/useDraggableConstructions';
import { type DraggableTask, useTaskDragAndDrop } from '@/composables/todo/useDraggableTasks';
import { useProjectDataSaver } from '@/composables/todo/useProjectDataSaver';
import { useTaskOperations } from '@/composables/todo/useTaskOperations';
import { useResponsiveWidth } from '@/composables/ui/useResponsiveWidth';
import { useTaskConditionFilters } from '@/composables/useTaskConditionFilters';
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
}>();

// 狀態管理
const localConstructionContainer = ref<ConstructionSelection[]>([]);
const localTasks = ref<TaskResponse[]>([]);
const searchQuery = ref<string>('');
const { selectedStatus, daysRange, filteredTasksByConstruction } =
  useTaskConditionFilters(localTasks);

// Context 提供
provideTaskCardFilter();

const onContainerUpdate = (newContainers: ConstructionSelection[]) => {
  emit('update:constructionContainer', newContainers);
};

// ==================== Composables ====================
const { isMobile } = useResponsiveWidth();
const editingStateStore = useEditingStateStore();

// API 任務操作
const { deleteTask: deleteTaskFromApi, updateProjectTasks } = useTasks(props.projectId);

// 自動保存任務（取代 localStorage）
const { markTasksChanged, saveNow } = useProjectDataSaver(
  localTasks,
  updateProjectTasks,
  3 * 60 * 1000 // 3 分鐘自動保存一次
);

// 任務更新時標記需要保存
const onTaskUpdate = () => {
  markTasksChanged();
};

// 拖拽操作後立即保存
const onTaskDragUpdate = async () => {
  markTasksChanged();
  await saveNow(); // 立即保存，不等待自動保存
};

// 任務操作
const { deleteTask, addNewTask, updateTask } = useTaskOperations(localTasks, onTaskUpdate);

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

const { handleTaskDrop } = useTaskDragAndDrop(localTasks, onTaskDragUpdate);

// ==================== 數據初始化與同步 ====================
// 避免資料中含有 null 或不合法項目，影響模板取用 container.id
const sanitizeConstructions = (
  items: Array<ConstructionSelection | null | undefined>
): ConstructionSelection[] =>
  items.filter(
    (c): c is ConstructionSelection => !!c && typeof c.id === 'string' && typeof c.name === 'string'
  );

// 初始化工程容器
watch(
  () => props.constructionContainer,
  (newContainers: ConstructionSelection[] | null) => {
    localConstructionContainer.value = sanitizeConstructions(newContainers || []);
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

// 組件卸載時清理編輯狀態（任務保存由 useProjectDataSaver 自動處理）
onBeforeUnmount(() => {
  editingStateStore.stopEditing();
});
</script>

<style scoped></style>
