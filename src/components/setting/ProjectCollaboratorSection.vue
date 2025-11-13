<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-bold">{{ title }}</h2>
      <ElTag>{{ projects.length }} {{ t('label.projects') }}</ElTag>
    </div>

    <!-- 專案列表 -->
    <div v-if="projects.length > 0" class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <ProjectCollaboratorCard
        v-for="project in projects"
        :key="project.id"
        :project="project"
        :is-owner="isOwner"
        :collaborator-count="getCollaboratorCount(project.id)"
        @expand="handleSelectProject"
      />
    </div>

    <!-- 空狀態 -->
    <div v-else class="rounded-lg border border-dashed border-gray-300 p-8 text-center">
      <p class="text-gray-500">{{ emptyMessage }}</p>
    </div>

    <!-- 協作者管理（當選中專案時），撐滿父容器寬度 -->
    <div
      v-if="selectedProjectId && selectedProject"
      class="mt-2 rounded-xl border border-gray-200 bg-gray-50 p-6"
    >
      <div class="mb-4 flex items-center justify-between">
        <div>
          <h3 class="text-base font-semibold">
            {{ t('title.manage_collaborators') }}: {{ selectedProject.title }}
          </h3>
          <p class="mt-1 text-sm text-gray-600">
            {{
              isOwner
                ? t('description.manage_project_collaborators_owner')
                : t('description.manage_project_collaborators_member')
            }}
          </p>
        </div>
        <TextButton variant="outline" size="sm" @click="handleCloseCollaborators">
          {{ t('button.close') }}
        </TextButton>
      </div>

      <!-- 只有擁有者才能管理協作者 -->
      <div v-if="isOwner">
        <CollaboratorManagement
          :collaborators="collaborators || []"
          :is-loading="isLoadingCollaborators"
          :is-adding="isAdding"
          :is-updating="isUpdating"
          :is-removing="isRemoving"
          :empty-message="t('message.no_collaborators')"
          @add="handleAddCollaborator"
          @update-role="handleUpdateRole"
          @remove="handleRemoveCollaborator"
        />
      </div>

      <!-- 協作者只能查看 -->
      <div v-else>
        <div v-if="isLoadingCollaborators" class="flex justify-center py-8">
          <ElIcon class="is-loading" :size="24">
            <Loading />
          </ElIcon>
        </div>
        <ElTable
          v-else-if="collaborators && collaborators.length > 0"
          :data="collaborators"
          style="width: 100%"
        >
          <ElTableColumn :label="t('column.email')">
            <template #default="scope">
              <div class="flex items-center gap-2">
                <span>{{ scope.row.collaboratorEmail }}</span>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn :label="t('column.role')" width="150">
            <template #default="scope">
              {{ t(`option.role.${scope.row.role}`) }}
            </template>
          </ElTableColumn>
        </ElTable>
        <p v-else class="py-8 text-center text-gray-500">
          {{ t('message.no_collaborators') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Loading } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';

import type { CollaboratorRole, ProjectResponse } from '@/types/response';

import CollaboratorManagement from '@/components/collaborator/CollaboratorManagement.vue';
import TextButton from '@/components/core/button/TextButton.vue';
import ProjectCollaboratorCard from '@/components/setting/ProjectCollaboratorCard.vue';

const props = defineProps<{
  title: string;
  projects: ProjectResponse[];
  isOwner: boolean;
  emptyMessage: string;
  selectedProjectId: string | null;
  selectedProject: ProjectResponse | null;
  collaborators: any[] | undefined;
  isLoadingCollaborators: boolean;
  isAdding: boolean;
  isUpdating: boolean;
  isRemoving: boolean;
  collaboratorCounts?: Record<string, number>;
}>();

const emit = defineEmits<{
  selectProject: [projectId: string | null];
  addCollaborator: [payload: { collaboratorEmail: string; role: CollaboratorRole }];
  updateRole: [payload: { collaboratorId: string; role: CollaboratorRole }];
  removeCollaborator: [collaboratorId: string];
}>();

const { t } = useI18n();

const handleSelectProject = (projectId: string) => {
  emit('selectProject', projectId);
};

const handleCloseCollaborators = () => {
  emit('selectProject', null);
};

const handleAddCollaborator = (payload: { collaboratorEmail: string; role: CollaboratorRole }) => {
  emit('addCollaborator', payload);
};

const handleUpdateRole = (payload: { collaboratorId: string; role: CollaboratorRole }) => {
  emit('updateRole', payload);
};

const handleRemoveCollaborator = (collaboratorId: string) => {
  emit('removeCollaborator', collaboratorId);
};

const getCollaboratorCount = (projectId: string): number | undefined => {
  return props.collaboratorCounts?.[projectId];
};
</script>
