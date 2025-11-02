<template>
  <div
    class="construction-container rounded-lg border border-gray-200 p-3"
    style="overflow: visible"
  >
    <div class="mb-2 flex items-center justify-between">
      <Label :label="constructionName" />
      <div class="flex items-center gap-2">
        <span class="text-xs text-gray-500">{{ totalTasks }}</span>
        <button
          type="button"
          class="rounded-md bg-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-300 md:hidden"
          @click="isExpanded = !isExpanded"
        >
          {{ isExpanded ? t('button.hide') : t('button.show_more') }}
        </button>
      </div>
    </div>
    <div class="space-y-4" :class="{ 'hidden md:block': !isExpanded }">
      <!-- Grouped by project -->
      <div v-for="group in groupedByProject" :key="group.projectId">
        <div class="mb-2 flex items-center justify-between">
          <span class="text-sm font-semibold text-gray-600">-- {{ group.projectTitle }} --</span>
          <span class="text-xs text-gray-400">{{ group.tasks.length }}</span>
        </div>
        <div class="space-y-2">
          <div v-for="t in group.tasks" :key="t.id">
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
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { TaskResponse } from '@/types/response';

import TaskCardBase from '@/components/task/TaskCardBase.vue';
import Label from '@/components/core/title/Label.vue';

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

const totalTasks = computed<number>(() => displayTasks.value.length);

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
