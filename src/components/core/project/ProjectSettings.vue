<template>
  <div class="mr-60 flex items-center gap-1">
    <el-button
      v-for="button in actionButtons"
      :key="button.key"
      :type="button.type"
      size="default"
      :icon="button.icon"
      circle
      @click="button.handler"
    />
  </div>

  <!-- Delete Confirmation Dialog -->
  <DeleteDialog
    v-model="showDeleteDialog"
    :is-crucial="true"
    :subject="t('project.project')"
    :target="projectTitle"
    @confirm="handleDelete"
  />

  <!-- Share Project Dialog -->
  <ShareLinkDialog
    v-model="showShareDialog"
    :project-id="projectId"
    :subject="t('project.project')"
  />

  <!-- Collaborators Dialog -->
  <CollaboratorDialog v-model="showCollaboratorsDialog" :project-id="projectId" />

  <!-- Global Collaborators Dialog -->
  <GlobalCollaboratorsDialog v-model="showGlobalCollaboratorsDialog" />
</template>

<script setup lang="ts">
import { Delete, Share, User, UserFilled } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import CollaboratorDialog from '@/components/core/dialog/CollaboratorDialog.vue';
import DeleteDialog from '@/components/core/dialog/DeleteDialog.vue';
import GlobalCollaboratorsDialog from '@/components/core/dialog/GlobalCollaboratorsDialog.vue';
import ShareLinkDialog from '@/components/core/dialog/ShareLinkDialog.vue';
import { useProject } from '@/composables/useProject';
import { getProjectStorageKey } from '@/utils/storage/projectStorage';

const props = defineProps<{
  projectId: string;
  projectTitle: string;
}>();

const { t } = useI18n();
const router = useRouter();
const { deleteProject } = useProject(props.projectId);

// Delete project
const showDeleteDialog = ref(false);
// Share project
const showShareDialog = ref(false);
// Collaborators management
const showCollaboratorsDialog = ref(false);
// Global collaborators management
const showGlobalCollaboratorsDialog = ref(false);

const actionButtons = [
  {
    key: 'share',
    type: 'primary',
    icon: Share,
    handler: () => (showShareDialog.value = true),
  },
  {
    key: 'collaborators',
    type: 'info',
    icon: User,
    handler: () => (showCollaboratorsDialog.value = true),
  },
  {
    key: 'globalCollaborators',
    type: 'success',
    icon: UserFilled,
    handler: () => (showGlobalCollaboratorsDialog.value = true),
  },
  {
    key: 'delete',
    type: 'danger',
    icon: Delete,
    handler: () => (showDeleteDialog.value = true),
  },
];

// Delete project
const handleDelete = async () => {
  try {
    await deleteProject(props.projectId);

    // 清除 localStorage 中該項目的儲存
    const storageKey = getProjectStorageKey(props.projectId);
    localStorage.removeItem(storageKey);

    ElMessage.success(t('message.project.project_deleted_success'));
    router.push({ name: 'todo-projects' });
  } catch (error) {
    console.error('Failed to delete project:', error);
    ElMessage.error(t('message.delete_failed'));
  } finally {
    showDeleteDialog.value = false;
  }
};
</script>

<style scoped></style>
