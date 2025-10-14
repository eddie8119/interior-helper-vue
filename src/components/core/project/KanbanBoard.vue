<template>
  <KanbanFilterBar
    @update:selected-status="selectedStatus = $event"
    @update:days-range="daysRange = $event"
  />
  <div class="w-full overflow-x-auto">
    <Container
      orientation="horizontal"
      :drag-handle-selector="readOnly ? '' : '.container-drag-handle'"
      :get-child-payload="readOnly ? undefined : getConstructionContainerPayload"
      :group-name="readOnly ? undefined : 'construction-containers'"
      class="flex overflow-x-auto pt-4"
      @drop="!readOnly && onConstructionContainerDrop($event)"
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
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { Container, Draggable } from 'vue3-smooth-dnd';

import type { TaskFilterStatus } from '@/constants/selection';
import type { TaskResponse } from '@/types/response';
import type { ConstructionSelection } from '@/types/selection';

import { taskApi } from '@/api/task';
import AddNewConstruction from '@/components/core/kanbanBoard/AddNewConstruction.vue';
import ConstructionContainerItem from '@/components/core/kanbanBoard/ConstructionContainerItem.vue';
import KanbanFilterBar from '@/components/core/project/KanbanFilterBar.vue';
import { useConstructionActions } from '@/composables/todo/useConstructionActions';
import { useDraggableConstructions } from '@/composables/todo/useDraggableConstructions';
import { type DraggableTask, useTaskDragAndDrop } from '@/composables/todo/useDraggableTasks';
import { provideTaskCardFilter } from '@/context/useTaskCardFilter';
import { provideTaskContext } from '@/context/useTaskContext';
import { filterTasksByConstruction } from '@/utils/todo/taskUtils';

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

// amount of editing 都會使用本地副本
const localConstructionContainer = ref<ConstructionSelection[]>([]);
const localTasks = ref<TaskResponse[]>([]);
const selectedStatus = ref<TaskFilterStatus>('all');
const daysRange = ref<[number, number]>([0, 10]);

// Provide task card display filter context for all descendant components
provideTaskCardFilter();

const initializelocalConstructionContainer = () => {
  localConstructionContainer.value = [...(props.constructionContainer || [])];
};
const initializelocalTasks = () => {
  localTasks.value = [...(props.tasks || [])];
};

watch(
  () => [props.constructionContainer, props.tasks],
  () => {
    initializelocalConstructionContainer();
    initializelocalTasks();
  },
  { immediate: true }
);

onMounted(() => {
  initializelocalConstructionContainer();
  initializelocalTasks();
});

// 容器更新回調
const onContainerUpdate = (newContainers: ConstructionSelection[]) => {
  emit('update:constructionContainer', newContainers);
};
const onTaskUpdate = (newTasks: TaskResponse[]) => {
  emit('update:projectAllTasks', newTasks);
};

// usecomposable
// 容器操作邏輯
const { deleteConstruction, addNewConstruction, updateConstructionName } = useConstructionActions(
  localConstructionContainer,
  onContainerUpdate
);

// 提供任務上下文
provideTaskContext({
  deleteTask: (taskId: string) => {
    const taskIndex = localTasks.value.findIndex((task: TaskResponse) => task.id === taskId);
    if (taskIndex !== -1) {
      localTasks.value.splice(taskIndex, 1);
      onTaskUpdate(localTasks.value);
    }
  },
  addNewTask: (newTaskData: TaskResponse) => {
    localTasks.value.push(newTaskData);
    onTaskUpdate(localTasks.value);
  },
  updateTask: (taskId: string, updatedTask: Partial<TaskResponse>) => {
    // 根據ID查找並更新任務
    const taskIndex = localTasks.value.findIndex((task: TaskResponse) => task.id === taskId);
    if (taskIndex !== -1) {
      localTasks.value[taskIndex] = { ...localTasks.value[taskIndex], ...updatedTask };
      onTaskUpdate(localTasks.value);
    }
  },
});

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

const filteredTasksByStatus = computed(() => {
  if (selectedStatus.value === 'all') {
    return localTasks.value;
  }
  return localTasks.value.filter((task: TaskResponse) => task.status === selectedStatus.value);
});

// 使用工具函數過濾任務
const filteredTasks = (constructionId: string) => {
  return filterTasksByConstruction(filteredTasksByStatus.value, constructionId);
};

onBeforeUnmount(() => {
  if (localTasks.value.length) {
    taskApi.updateProjectTasksWithBeacon(localTasks.value, props.projectId);
  }
});
</script>

<style scoped></style>
