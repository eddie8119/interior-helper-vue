<template>
  <BasicEditDialog
    v-model="dialogVisible"
    :title="t('title.manage_collaborators')"
    :is-submitting="isSubmitting"
    :error-message="errorMessage"
    :show-footer-button="false"
    @cancel="dialogVisible = false"
  >
    <p class="mb-2 text-lg">
      {{ t('dialog.collaborators_description') }}
    </p>
    <div class="flex flex-col gap-4">
      <div class="mb-4 flex items-center gap-2">
        <el-input v-model="newCollaboratorEmail" :placeholder="t('placeholder.email')" />
        <el-button type="primary" @click="addCollaborator">
          {{ t('button.add') }}
        </el-button>
      </div>
      <el-table v-if="collaborators.length > 0" :data="collaborators" style="width: 100%">
        <el-table-column prop="email" :label="t('column.email')" />
        <el-table-column prop="role" :label="t('column.role')" width="120" />
        <el-table-column :label="t('column.action')" width="100">
          <template #default="scope">
            <el-button type="danger" size="small" @click="removeCollaborator(scope.row)">
              {{ t('button.remove') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <p v-else class="text-center text-gray-500">{{ t('message.no_collaborators') }}</p>
    </div>
  </BasicEditDialog>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import BasicEditDialog from '@/components/core/dialog/BasicEditDialog.vue';

const { t } = useI18n();

const props = defineProps<{
  modelValue: boolean;
  projectId: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  confirm: [];
}>();

const errorMessage = ref<string>('');
const isSubmitting = ref(false);

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const newCollaboratorEmail = ref('');
const collaborators = ref<{ email: string; role: string }[]>([]);

const addCollaborator = () => {
  if (!newCollaboratorEmail.value || !newCollaboratorEmail.value.includes('@')) {
    ElMessage.warning(t('message.invalid_email'));
    return;
  }

  // Here you would typically call your API to add a collaborator
  // For now, we'll just add it to our local array
  collaborators.value.push({
    email: newCollaboratorEmail.value,
    role: 'Editor',
  });

  newCollaboratorEmail.value = '';
  ElMessage.success(t('message.collaborator_added'));
};

const removeCollaborator = (collaborator: { email: string; role: string }) => {
  // Here you would typically call your API to remove a collaborator
  // For now, we'll just remove it from our local array
  collaborators.value = collaborators.value.filter((c) => c.email !== collaborator.email);
  ElMessage.success(t('message.collaborator_removed'));
};
</script>
