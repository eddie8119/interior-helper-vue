<template>
  <div class="construction-container rounded-lg p-3" style="overflow: visible">
    <div class="mb-2 flex items-center justify-between">
      <Label :label="constructionName" />
      <div class="flex items-center gap-2">
        <span class="text-gray-500">{{ totalTasks }}</span>
        <button
          v-if="totalTasks > 0"
          type="button"
          class="hidden rounded-md bg-gray-200 px-2 py-1 text-sm text-gray-700 hover:bg-gray-300 md:block"
          @click="toggleAllTask()"
        >
          {{ allTaskCollapsed ? t('button.fold.expand_all') : t('button.fold.collapse_all') }}
          {{ t('label.task.task') }}
        </button>

        <!--  手機時避免過長 預設直接關閉 -->
        <div class="--mobile md:hidden">
          <button
            type="button"
            class="rounded-md bg-gray-200 px-2 py-1 text-sm text-gray-700 hover:bg-gray-300"
            @click="isExpanded = !isExpanded"
          >
            {{ isExpanded ? t('button.hide') : t('button.show_more') }}
          </button>
        </div>
      </div>
    </div>
    <div class="space-y-4" :class="{ 'hidden md:block': !isExpanded }">
      <!-- Grouped by project -->
      <div
        v-for="(group, index) in groupedByProject"
        :key="group.projectId"
        :class="{ 'border-divider-color-difference border-t pt-3': index !== 0 }"
      >
        <div class="mb-2 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-sm font-semibold text-gray-600">-- {{ group.projectTitle }} --</span>
            <button
              type="button"
              class="rounded-md bg-gray-100 px-2 py-0.5 text-sm text-gray-600 hover:bg-gray-200"
              @click="toggleTaskGroup(group.projectId)"
            >
              {{
                isGroupTaskVisible(group.projectId)
                  ? t('button.fold.collapse')
                  : t('button.fold.expand')
              }}{{ t('label.task.task') }}
            </button>
          </div>
          <span class="text-gray-400">{{ group.tasks.length }}</span>
        </div>
        <div v-if="isGroupTaskVisible(group.projectId)" class="space-y-4">
          <div v-for="task in group.tasks" :key="task.id">
            <TaskCardBase :task="task" :read-only="true" :show-router="true" />
          </div>
        </div>
      </div>

      <div v-if="displayTasks.length === 0" class="flex justify-center text-gray-300">
        <ElIcon :size="32">
          <DocumentRemove />
        </ElIcon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DocumentRemove } from '@element-plus/icons-vue';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { TaskResponse } from '@/types/response';

import Label from '@/components/core/title/Label.vue';
import TaskCardBase from '@/components/task/TaskCardBase.vue';

const props = defineProps<{
  constructionId: string;
  constructionName: string;
  daysRange?: [number, number];
  readOnly?: boolean;
  tasks?: TaskResponse[];
  projectTitleList?: Array<{ id: string; title: string }>;
}>();

const displayTasks = computed<TaskResponse[]>(() => props.tasks ?? []);

const { t } = useI18n();

const isExpanded = ref(false);
const allTaskCollapsed = ref(false);
const collapsedGroups = ref<Record<string, boolean>>({});
const expandedGroupsWhenAllTaskCollapsed = ref<Record<string, boolean>>({});

const totalTasks = computed<number>(() => displayTasks.value.length);

type ProjectGroup = { projectId: string; projectTitle: string; tasks: TaskResponse[] };

// 分群
const groupedByProject = computed<ProjectGroup[]>(() => {
  const byId = new Map<string, ProjectGroup>();
  const titleMap = new Map((props.projectTitleList ?? []).map((p) => [p.id, p.title]));

  for (const t of displayTasks.value) {
    const pid = t.projectId;
    if (!pid) continue;
    let group = byId.get(pid);
    if (!group) {
      group = { projectId: pid, projectTitle: titleMap.get(pid) ?? pid, tasks: [] };
      byId.set(pid, group);
    }
    group.tasks.push(t);
  }

  return Array.from(byId.values());
});

// 摺疊
const toggleAllTask = (): void => {
  // Flip mode
  allTaskCollapsed.value = !allTaskCollapsed.value;

  if (allTaskCollapsed.value) {
    // Entering "collapse all" mode: hide all groups by default
    // and clear the list of groups that were manually expanded in this mode.
    expandedGroupsWhenAllTaskCollapsed.value = {};
  } else {
    // Leaving "collapse all" mode: show all groups by default
    // and clear the list of groups that were manually collapsed in normal mode.
    collapsedGroups.value = {};
  }
};

const toggleTaskGroup = (projectId: string): void => {
  if (allTaskCollapsed.value) {
    expandedGroupsWhenAllTaskCollapsed.value[projectId] =
      !expandedGroupsWhenAllTaskCollapsed.value[projectId];
  } else {
    collapsedGroups.value[projectId] = !collapsedGroups.value[projectId];
  }
};

const isGroupTaskVisible = (projectId: string): boolean => {
  if (allTaskCollapsed.value) {
    return !!expandedGroupsWhenAllTaskCollapsed.value[projectId];
  }
  return !collapsedGroups.value[projectId];
};
</script>
