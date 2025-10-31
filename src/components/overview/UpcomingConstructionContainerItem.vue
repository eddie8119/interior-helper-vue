<template>
  <div class="construction-container" style="overflow: visible">
    <p class="mb-2 text-sm font-semibold text-gray-700">{{ constructionName }}</p>
    <div class="space-y-4">
      <!-- Grouped by project -->
      <div v-for="group in groupedByProject" :key="group.projectId">
        <div class="mb-2 flex items-center justify-between">
          <span class="text-sm font-semibold text-gray-600">{{ group.projectTitle }}</span>
          <span class="text-xs text-gray-400">{{ group.tasks.length }}</span>
        </div>
        <div class="space-y-2">
          <div
            v-for="t in group.tasks"
            :key="t.id"
            class="rounded-md border border-gray-200 bg-white p-3 shadow-sm"
          >
            <TaskCardBase :task="t" :read-only="true" />
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
import { computed } from 'vue';

import type { TaskResponse } from '@/types/response';

import TaskCardBase from '@/components/kanbanBoard/TaskCardBase.vue';

const props = defineProps<{
  constructionId: string;
  constructionName: string;
  daysRange?: [number, number];
  readOnly?: boolean;
  tasks?: TaskResponse[];
  projectTitleList?: Array<{ id: string; title: string }>;
}>();

const displayTasks = computed<TaskResponse[]>(() => props.tasks ?? []);

type ProjectGroup = { projectId: string; projectTitle: string; tasks: TaskResponse[] };

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
