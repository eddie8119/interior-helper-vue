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
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-semibold text-gray-800">{{ t.title }}</h4>
              <ElTag :type="statusTagType(t.status)" size="small">{{ t.status }}</ElTag>
            </div>
            <div class="mt-1 text-xs text-gray-500">
              <span v-if="t.reminderDatetime">{{ formatDate(t.reminderDatetime) }}</span>
            </div>
            <p v-if="t.description" class="mt-1 line-clamp-2 text-xs text-gray-600">
              {{ t.description }}
            </p>
          </div>
        </div>
      </div>

      <div v-if="displayTasks.length === 0" class="text-center text-xs text-gray-400">
        No upcoming tasks
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { TaskResponse } from '@/types/response';

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

const statusTagType = (status?: string) => {
  switch (status) {
    case 'done':
    case 'completed':
      return 'success';
    case 'inProgress':
    case 'doing':
      return 'warning';
    case 'blocked':
    case 'error':
      return 'danger';
    default:
      return 'info';
  }
};

const formatDate = (iso?: string) => {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return iso;
  }
};
</script>
