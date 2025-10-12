import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';

import { collaboratorApi } from '@/api/collaborator';
import { createProjectInvitation, createGlobalInvitation } from '@/api/invitation';
import type { CollaboratorRole } from '@/types/collaborator';

// Project-specific collaborators
export const useProjectCollaborators = (projectId: string) => {
  const { t } = useI18n();
  const queryClient = useQueryClient();

  // Fetch project collaborators
  const {
    data: collaborators,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['projectCollaborators', projectId],
    queryFn: async () => {
      const response = await collaboratorApi.getProjectCollaborators(projectId);
      return response.data;
    },
    enabled: !!projectId,
  });

  // Add collaborator mutation (使用邀請系統)
  const addCollaboratorMutation = useMutation({
    mutationFn: (data: { collaboratorEmail: string; role?: CollaboratorRole }) =>
      createProjectInvitation(projectId, data.collaboratorEmail, data.role || 'viewer'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectCollaborators', projectId] });
      ElMessage.success(t('message.invitation.sent'));
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || t('message.invitation.send_failed');
      ElMessage.error(message);
    },
  });

  // Update collaborator mutation
  const updateCollaboratorMutation = useMutation({
    mutationFn: (data: { collaboratorId: string; role: CollaboratorRole }) =>
      collaboratorApi.updateProjectCollaborator(projectId, data.collaboratorId, {
        role: data.role,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectCollaborators', projectId] });
      ElMessage.success(t('message.collaborator_updated'));
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || t('message.update_collaborator_failed');
      ElMessage.error(message);
    },
  });

  // Remove collaborator mutation
  const removeCollaboratorMutation = useMutation({
    mutationFn: (collaboratorId: string) =>
      collaboratorApi.removeProjectCollaborator(projectId, collaboratorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectCollaborators', projectId] });
      ElMessage.success(t('message.collaborator_removed'));
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || t('message.remove_collaborator_failed');
      ElMessage.error(message);
    },
  });

  return {
    collaborators,
    isLoading,
    error,
    refetch,
    addCollaborator: addCollaboratorMutation.mutate,
    updateCollaborator: updateCollaboratorMutation.mutate,
    removeCollaborator: removeCollaboratorMutation.mutate,
    isAdding: addCollaboratorMutation.isPending,
    isUpdating: updateCollaboratorMutation.isPending,
    isRemoving: removeCollaboratorMutation.isPending,
  };
};

// Global collaborators
export const useGlobalCollaborators = () => {
  const { t } = useI18n();
  const queryClient = useQueryClient();

  // Fetch global collaborators
  const {
    data: collaborators,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['globalCollaborators'],
    queryFn: async () => {
      const response = await collaboratorApi.getGlobalCollaborators();
      return response.data;
    },
  });

  // Add global collaborator mutation (使用邀請系統)
  const addCollaboratorMutation = useMutation({
    mutationFn: (data: { collaboratorEmail: string; role?: CollaboratorRole }) =>
      createGlobalInvitation(data.collaboratorEmail, data.role || 'viewer'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['globalCollaborators'] });
      ElMessage.success(t('message.invitation.sent'));
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || t('message.invitation.send_failed');
      ElMessage.error(message);
    },
  });

  // Update global collaborator mutation
  const updateCollaboratorMutation = useMutation({
    mutationFn: (data: { collaboratorId: string; role: CollaboratorRole }) =>
      collaboratorApi.updateGlobalCollaborator(data.collaboratorId, { role: data.role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['globalCollaborators'] });
      ElMessage.success(t('message.global_collaborator_updated'));
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || t('message.update_collaborator_failed');
      ElMessage.error(message);
    },
  });

  // Remove global collaborator mutation
  const removeCollaboratorMutation = useMutation({
    mutationFn: (collaboratorId: string) =>
      collaboratorApi.removeGlobalCollaborator(collaboratorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['globalCollaborators'] });
      ElMessage.success(t('message.global_collaborator_removed'));
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || t('message.remove_collaborator_failed');
      ElMessage.error(message);
    },
  });

  return {
    collaborators,
    isLoading,
    error,
    refetch,
    addCollaborator: addCollaboratorMutation.mutate,
    updateCollaborator: updateCollaboratorMutation.mutate,
    removeCollaborator: removeCollaboratorMutation.mutate,
    isAdding: addCollaboratorMutation.isPending,
    isUpdating: updateCollaboratorMutation.isPending,
    isRemoving: removeCollaboratorMutation.isPending,
  };
};
