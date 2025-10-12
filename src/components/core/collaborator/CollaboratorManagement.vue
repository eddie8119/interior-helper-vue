<template>
  <div class="flex flex-col gap-4">
    <!-- Add Collaborator Section -->
    <div class="flex items-center gap-2">
      <el-input
        v-model="newCollaboratorEmail"
        :placeholder="t('placeholder.email')"
        :disabled="isAdding"
        @keyup.enter="handleAddCollaborator"
      />
      <OptionSelector
        v-model="newCollaboratorRole"
        :options="roleOptions"
        class-name="w-[120px]"
        namespace="role"
      />
      <TextButton
        :loading="isAdding"
        :disabled="isAdding"
        variant="primary"
        size="sm"
        class="h-[30px] w-[70px]"
        @click="handleAddCollaborator"
      >
        {{ t('button.add') }}
      </TextButton>
    </div>

    <!-- Collaborators List -->
    <div v-if="isLoading" class="flex justify-center py-8">
      <el-icon class="is-loading" :size="24">
        <Loading />
      </el-icon>
    </div>
    <el-table
      v-else-if="collaborators && collaborators.length > 0"
      :data="collaborators"
      style="width: 100%"
    >
      <el-table-column prop="collaboratorEmail" :label="t('column.email')" />
      <el-table-column :label="t('column.role')" width="150">
        <template #default="scope">
          <OptionSelector
            :model-value="scope.row.role"
            :options="roleOptions"
            namespace="role"
            :disabled="isUpdating"
            @update:model-value="(value) => onRoleChange(scope.row.id, value)"
          />
        </template>
      </el-table-column>
      <el-table-column :label="t('column.action')" width="100">
        <template #default="scope">
          <TextButton
            :loading="isRemoving"
            :disabled="isRemoving"
            size="sm"
            variant="outline"
            @click="handleRemoveCollaborator(scope.row.id)"
          >
            {{ t('button.remove') }}
          </TextButton>
        </template>
      </el-table-column>
    </el-table>
    <p v-else class="py-8 text-center text-gray-500">{{ emptyMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import { Loading } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import TextButton from '@/components/core/button/TextButton.vue';
import OptionSelector from '@/components/ui/OptionSelector.vue';
import type { CollaboratorRole } from '@/types/response';
import type { SelectorOption } from '@/types/selection';

const { t } = useI18n();

const props = defineProps<{
  collaborators: any[];
  isLoading: boolean;
  isAdding: boolean;
  isUpdating: boolean;
  isRemoving: boolean;
  emptyMessage: string;
}>();

const emit = defineEmits<{
  add: [payload: { collaboratorEmail: string; role: CollaboratorRole }];
  updateRole: [payload: { collaboratorId: string; role: CollaboratorRole }];
  remove: [collaboratorId: string];
}>();

const newCollaboratorEmail = ref('');
const newCollaboratorRole = ref<CollaboratorRole>('viewer');
const roleOptions: SelectorOption[] = [
  { value: 'viewer' },
  { value: 'editor' },
  { value: 'manager' },
];

const handleAddCollaborator = () => {
  if (!newCollaboratorEmail.value || !newCollaboratorEmail.value.includes('@')) {
    ElMessage.warning(t('message.invalid_email'));
    return;
  }

  emit('add', {
    collaboratorEmail: newCollaboratorEmail.value,
    role: newCollaboratorRole.value,
  });

  newCollaboratorEmail.value = '';
  newCollaboratorRole.value = 'viewer';
};

const onRoleChange = (collaboratorId: string, value: any) => {
  const role = value as CollaboratorRole;
  emit('updateRole', { collaboratorId, role });
};

const handleRemoveCollaborator = (collaboratorId: string) => {
  emit('remove', collaboratorId);
};
</script>
