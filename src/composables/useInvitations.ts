import { ElMessage } from 'element-plus';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  getMyInvitations,
  getSentInvitations,
  acceptInvitation,
  rejectInvitation,
  cancelInvitation,
  createProjectInvitation,
  createGlobalInvitation,
} from '@/api/invitation';
import type { CollaboratorInvitationResponse, CollaboratorRole } from '@/types/response';

export const useInvitations = () => {
  const { t } = useI18n();
  const invitations = ref<CollaboratorInvitationResponse[]>([]);
  const isLoading = ref(false);

  const fetchInvitations = async () => {
    isLoading.value = true;
    try {
      const data = await getMyInvitations();
      invitations.value = data;
    } catch (error) {
      console.error('Failed to fetch invitations:', error);
      ElMessage.error(t('message.error.failed_to_fetch'));
    } finally {
      isLoading.value = false;
    }
  };

  const accept = async (invitationToken: string) => {
    try {
      await acceptInvitation(invitationToken);
      ElMessage.success(t('message.invitation.accepted'));
      await fetchInvitations();
    } catch (error) {
      console.error('Failed to accept invitation:', error);
      ElMessage.error(t('message.invitation.accept_failed'));
      throw error;
    }
  };

  const reject = async (invitationId: string) => {
    try {
      await rejectInvitation(invitationId);
      ElMessage.success(t('message.invitation.rejected'));
      await fetchInvitations();
    } catch (error) {
      console.error('Failed to reject invitation:', error);
      ElMessage.error(t('message.invitation.reject_failed'));
    }
  };

  return {
    invitations,
    isLoading,
    fetchInvitations,
    accept,
    reject,
  };
};

export const useSentInvitations = () => {
  const { t } = useI18n();
  const sentInvitations = ref<CollaboratorInvitationResponse[]>([]);
  const isLoading = ref(false);

  const fetchSentInvitations = async () => {
    isLoading.value = true;
    try {
      const data = await getSentInvitations();
      sentInvitations.value = data;
    } catch (error) {
      console.error('Failed to fetch sent invitations:', error);
      ElMessage.error(t('message.error.failed_to_fetch'));
    } finally {
      isLoading.value = false;
    }
  };

  const cancel = async (invitationId: string) => {
    try {
      await cancelInvitation(invitationId);
      ElMessage.success(t('message.invitation.cancelled'));
      await fetchSentInvitations();
    } catch (error) {
      console.error('Failed to cancel invitation:', error);
      ElMessage.error(t('message.invitation.cancel_failed'));
    }
  };

  return {
    sentInvitations,
    isLoading,
    fetchSentInvitations,
    cancel,
  };
};

export const useCreateInvitation = () => {
  const { t } = useI18n();
  const isCreating = ref(false);

  const createProject = async (
    projectId: string,
    collaboratorEmail: string,
    role: CollaboratorRole
  ) => {
    isCreating.value = true;
    try {
      await createProjectInvitation(projectId, collaboratorEmail, role);
      ElMessage.success(t('message.invitation.sent'));
    } catch (error: any) {
      console.error('Failed to create project invitation:', error);
      if (error.response?.status === 409) {
        ElMessage.error(t('message.invitation.already_exists'));
      } else {
        ElMessage.error(t('message.invitation.send_failed'));
      }
      throw error;
    } finally {
      isCreating.value = false;
    }
  };

  const createGlobal = async (collaboratorEmail: string, role: CollaboratorRole) => {
    isCreating.value = true;
    try {
      await createGlobalInvitation(collaboratorEmail, role);
      ElMessage.success(t('message.invitation.sent'));
    } catch (error: any) {
      console.error('Failed to create global invitation:', error);
      if (error.response?.status === 409) {
        ElMessage.error(t('message.invitation.already_exists'));
      } else {
        ElMessage.error(t('message.invitation.send_failed'));
      }
      throw error;
    } finally {
      isCreating.value = false;
    }
  };

  return {
    isCreating,
    createProject,
    createGlobal,
  };
};
