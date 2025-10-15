<template>
  <BasicEditDialog
    v-model="dialogVisible"
    :title="t('title.manage_global_collaborators')"
    :is-submitting="isSubmitting"
    :error-message="errorMessage"
    :show-footer-button="false"
    @cancel="dialogVisible = false"
  >
    <p class="mb-4 text-sm text-gray-600">
      {{ t('dialog.global_collaborators_description') }}
    </p>
    <CollaboratorManagement
      :collaborators="collaborators || []"
      :is-loading="isLoading"
      :is-adding="isAdding"
      :is-updating="isUpdating"
      :is-removing="isRemoving"
      :empty-message="t('message.sign.no_global_collaborators')"
      @add="handleAddCollaborator"
      @update-role="handleUpdateRole"
      @remove="handleRemoveCollaborator"
    />
  </BasicEditDialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { CollaboratorRole } from '@/types/response';

import CollaboratorManagement from '@/components/collaborator/CollaboratorManagement.vue';
import BasicEditDialog from '@/components/core/dialog/BasicEditDialog.vue';
import { useGlobalCollaborators } from '@/composables/useCollaborators';

const { t } = useI18n();

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  confirm: [];
}>();

const errorMessage = ref<string>('');
const isSubmitting = ref(false);

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
});

const {
  collaborators,
  isLoading,
  addCollaborator,
  updateCollaborator,
  removeCollaborator,
  isAdding,
  isUpdating,
  isRemoving,
  refetch,
} = useGlobalCollaborators();

// Refetch when dialog opens
watch(dialogVisible, (newValue: boolean) => {
  if (newValue) {
    refetch();
  }
});

const handleAddCollaborator = (payload: { collaboratorEmail: string; role: CollaboratorRole }) => {
  addCollaborator(payload);
};

const handleUpdateRole = (payload: { collaboratorId: string; role: CollaboratorRole }) => {
  updateCollaborator(payload);
};

const handleRemoveCollaborator = (collaboratorId: string) => {
  removeCollaborator(collaboratorId);
};
</script>
