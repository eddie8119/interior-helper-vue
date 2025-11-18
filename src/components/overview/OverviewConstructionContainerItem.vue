<template>
  <div class="construction-container rounded-lg p-3" style="overflow: visible">
    <!-- Header -->
    <div class="flex items-center justify-between md:mb-2">
      <Label :label="constructionName" :class-name="'!mb-0 md:mb-2'" />

      <div class="flex items-center gap-2">
        <span class="text-gray-500">{{ totalTasks }}</span>

        <!-- Collapse all button (Desktop) -->
        <CollapseAllButton
          v-if="totalTasks > 0"
          :all-collapsed="allTaskCollapsed"
          class="hidden md:block"
          @click="toggleAllTask()"
        />

        <!-- hide button (Mobile) -->
        <button
          v-if="totalTasks > 0"
          type="button"
          class="rounded-md bg-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-300 md:hidden"
          @click="isExpanded = !isExpanded"
        >
          {{ isExpanded ? t('button.hide') : t('button.show_more') }}
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="space-y-4" :class="{ 'hidden md:block': !isExpanded }">
      <!-- Task groups -->
      <section
        v-for="(group, index) in groupedByProject"
        :key="group.projectId"
        :class="{ 'border-divider-color-difference border-t pt-3': index !== 0 }"
      >
        <!-- Group header -->
        <header class="mb-2 flex items-center justify-between gap-2">
          <h3 class="text-sm font-semibold text-gray-600">-- {{ group.projectTitle }} --</h3>

          <div class="flex items-center gap-2">
            <CollapseButton
              :is-collapsed="!isGroupTaskVisible(group.projectId)"
              variant="secondary"
              custom-class="py-0.5"
              @click="toggleTaskGroup(group.projectId)"
            >
              {{
                isGroupTaskVisible(group.projectId)
                  ? t('button.fold.collapse')
                  : t('button.fold.expand')
              }}{{ t('label.task.task') }}
            </CollapseButton>
            <span class="text-gray-400">{{ group.tasks.length }}</span>
          </div>
        </header>

        <!-- Group content -->
        <div v-if="isGroupTaskVisible(group.projectId)" class="space-y-4">
          <TaskCardBase
            v-for="task in group.tasks"
            :key="task.id"
            :task="task"
            :read-only="true"
            :show-router="true"
          />
        </div>
      </section>

      <!-- Empty state -->
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

import CollapseAllButton from '@/components/core/button/CollapseAllButton.vue';
import CollapseButton from '@/components/core/button/CollapseButton.vue';
import Label from '@/components/core/title/Label.vue';
import TaskCardBase from '@/components/task/TaskCardBase.vue';
import { useTaskGroupCollapse } from '@/composables/useTaskGroupCollapse';

const props = defineProps<{
  constructionId: string;
  constructionName: string;
  daysRange?: [number, number];
  readOnly?: boolean;
  tasks?: TaskResponse[];
  projectTitleList?: Array<{ id: string; title: string }>;
}>();

const { t } = useI18n();

const isExpanded = ref(false);

// 使用摺疊功能的 composable
const { allTaskCollapsed, toggleAllTask, toggleTaskGroup, isGroupTaskVisible } =
  useTaskGroupCollapse();

const displayTasks = computed<TaskResponse[]>(() => props.tasks ?? []);
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
</script>
