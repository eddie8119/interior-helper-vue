<template>
  <div class="flex flex-col gap-8 p-6">
    <!-- 頁面標題 -->
    <div class="flex flex-col gap-2">
      <h1 class="text-2xl font-bold">{{ t('title.project_collaborator_management') }}</h1>
      <p class="text-gray-600">
        {{ t('description.project_collaborator_management') }}
      </p>
    </div>

    <!-- 載入中狀態 -->

    <div v-if="isLoadingProjects" class="flex min-h-screen items-center justify-center">
      <Loading />
    </div>

    <!-- 主要內容 -->
    <div v-else class="flex flex-col gap-8">
      <!-- 我創建的專案 -->
      <ProjectCollaboratorSection
        :title="t('title.owned_projects')"
        :projects="ownedProjects"
        :is-owner="true"
        :empty-message="t('message.no_owned_projects')"
        :selected-project-id="selectedProjectId"
        :selected-project="selectedProject"
        :collaborators="collaborators"
        :is-loading-collaborators="isLoadingCollaborators"
        :is-adding="isAdding"
        :is-updating="isUpdating"
        :is-removing="isRemoving"
        @select-project="handleSelectProject"
        @add-collaborator="handleAddCollaborator"
        @update-role="handleUpdateRole"
        @remove-collaborator="handleRemoveCollaborator"
      />

      <!-- 我作為協作者的專案 -->
      <ProjectCollaboratorSection
        :title="t('title.collaborating_projects')"
        :projects="collaboratingProjects"
        :is-owner="false"
        :empty-message="t('message.no_collaborating_projects')"
        :selected-project-id="selectedProjectId"
        :selected-project="selectedProject"
        :collaborators="collaborators"
        :is-loading-collaborators="isLoadingCollaborators"
        :is-adding="false"
        :is-updating="false"
        :is-removing="false"
        @select-project="handleSelectProject"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { ElMessage } from 'element-plus';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import type { CollaboratorRole } from '@/types/response';

import { collaboratorApi } from '@/api/collaborator';
import { createProjectInvitation } from '@/api/invitation';
import Loading from '@/components/core/loading/Loading.vue';
import ProjectCollaboratorSection from '@/components/setting/ProjectCollaboratorSection.vue';
import { useProjectCollaboratorManagement } from '@/composables/useProjectCollaboratorManagement';

const { t } = useI18n();

// 專案管理
const {
  ownedProjects: ownedProjectsData,
  collaboratingProjects: collaboratingProjectsData,
  isLoadingProjects,
  selectedProjectId,
  selectedProject,
  selectProject,
} = useProjectCollaboratorManagement();

// 轉換為響應式值
const ownedProjects = computed(() => ownedProjectsData.value || []);
const collaboratingProjects = computed(() => collaboratingProjectsData.value || []);

const queryClient = useQueryClient();

// 協作者查詢 - 當選中專案時才啟用
const {
  data: collaborators,
  isLoading: isLoadingCollaborators,
  refetch: refetchCollaborators,
} = useQuery({
  queryKey: ['projectCollaborators', selectedProjectId],
  queryFn: async () => {
    if (!selectedProjectId.value) return [];
    const response = await collaboratorApi.getProjectCollaborators(selectedProjectId.value);
    return response.data;
  },
  enabled: computed(() => !!selectedProjectId.value),
});

// 添加協作者 mutation
const addCollaboratorMutation = useMutation({
  mutationFn: (data: { projectId: string; collaboratorEmail: string; role: CollaboratorRole }) =>
    createProjectInvitation(data.projectId, data.collaboratorEmail, data.role),
  onSuccess: () => {
    if (selectedProjectId.value) {
      queryClient.invalidateQueries({
        queryKey: ['projectCollaborators', selectedProjectId.value],
      });
    }
    ElMessage.success(t('message.invitation.sent'));
  },
  onError: (error: unknown) => {
    const message =
      (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
      t('message.invitation.send_failed');
    ElMessage.error(message);
  },
});

// 更新協作者角色 mutation
const updateCollaboratorMutation = useMutation({
  mutationFn: (data: { projectId: string; collaboratorId: string; role: CollaboratorRole }) =>
    collaboratorApi.updateProjectCollaborator(data.projectId, data.collaboratorId, {
      role: data.role,
    }),
  onSuccess: () => {
    if (selectedProjectId.value) {
      queryClient.invalidateQueries({
        queryKey: ['projectCollaborators', selectedProjectId.value],
      });
    }
    ElMessage.success(t('message.collaborator_updated'));
  },
  onError: (error: unknown) => {
    const message =
      (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
      t('message.update_collaborator_failed');
    ElMessage.error(message);
  },
});

// 移除協作者 mutation
const removeCollaboratorMutation = useMutation({
  mutationFn: (data: { projectId: string; collaboratorId: string }) =>
    collaboratorApi.removeProjectCollaborator(data.projectId, data.collaboratorId),
  onSuccess: () => {
    if (selectedProjectId.value) {
      queryClient.invalidateQueries({
        queryKey: ['projectCollaborators', selectedProjectId.value],
      });
    }
    ElMessage.success(t('message.collaborator_removed'));
  },
  onError: (error: unknown) => {
    const message =
      (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
      t('message.remove_collaborator_failed');
    ElMessage.error(message);
  },
});

const isAdding = computed(() => addCollaboratorMutation.isPending);
const isUpdating = computed(() => updateCollaboratorMutation.isPending);
const isRemoving = computed(() => removeCollaboratorMutation.isPending);

// 處理選擇專案
const handleSelectProject = (projectId: string | null) => {
  selectProject(projectId);
};

// 處理添加協作者
const handleAddCollaborator = (payload: { collaboratorEmail: string; role: CollaboratorRole }) => {
  if (!selectedProjectId.value) return;
  addCollaboratorMutation.mutate({
    projectId: selectedProjectId.value,
    ...payload,
  });
};

// 處理更新角色
const handleUpdateRole = (payload: { collaboratorId: string; role: CollaboratorRole }) => {
  if (!selectedProjectId.value) return;
  updateCollaboratorMutation.mutate({
    projectId: selectedProjectId.value,
    ...payload,
  });
};

// 處理移除協作者
const handleRemoveCollaborator = (collaboratorId: string) => {
  if (!selectedProjectId.value) return;
  removeCollaboratorMutation.mutate({
    projectId: selectedProjectId.value,
    collaboratorId,
  });
};
</script>

<style scoped></style>
