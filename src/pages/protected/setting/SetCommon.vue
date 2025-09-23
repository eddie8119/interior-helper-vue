<template>
  <div class="flex flex-col gap-4">
    <EditArea
      title="construction"
      :local-items="localConstructionItems"
      @delete-item="handleDeleteConstruction"
      @add-item="handleAddConstruction"
    />

    <EditArea
      title="unit"
      :local-items="localUnitItems"
      @delete-item="handleDeleteUnit"
      @add-item="handleAddUnit"
    />
    <EditArea
      title="projectType"
      :local-items="localProjectTypeItems"
      @delete-item="handleDeleteProjectType"
      @add-item="handleAddProjectType"
    />
  </div>
  <TextButton
    variant="primary"
    size="md"
    class="h-[30px] w-full max-w-[60px] lg:w-auto"
    @click="showCreateCommonDialog = true"
  >
    {{ t('common.create_common') }}
  </TextButton>

  <!-- 建立專案對話框 -->
  <CreateCommonDialog v-model="showCreateCommonDialog" />
</template>

<script setup lang="ts">
import { ref, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';

import TextButton from '@/components/core/button/TextButton.vue';
import CreateCommonDialog from '@/components/core/dialog/CreateCommonDialog.vue';
import EditArea from '@/components/setting/EditArea.vue';
import { useCommonAction } from '@/composables/useCommonAction';

const { t } = useI18n();
const {
  // construction
  localConstructionItems,
  updateConstructionData,
  // unit
  localUnitItems,
  updateUnitData,
  // projectType
  localProjectTypeItems,
  updateProjectTypeData,
} = useCommonAction();

// Composition function to handle common add/delete operations
const useItemHandlers = (items: Ref<string[]>, updateFn: (items: string[]) => Promise<void>) => {
  const handleAdd = (newItem: string) => {
    updateFn([...items.value, newItem]);
  };

  const handleDelete = (index: string) => {
    const updatedItems = items.value.filter((item: string) => item !== index);
    items.value = updatedItems;
    updateFn(updatedItems);
  };

  return {
    handleAdd,
    handleDelete,
  };
};

// Construction handlers
const { handleAdd: handleAddConstruction, handleDelete: handleDeleteConstruction } =
  useItemHandlers(localConstructionItems, updateConstructionData);

// Unit handlers
const { handleAdd: handleAddUnit, handleDelete: handleDeleteUnit } = useItemHandlers(
  localUnitItems,
  updateUnitData
);

// Project type handlers
const { handleAdd: handleAddProjectType, handleDelete: handleDeleteProjectType } = useItemHandlers(
  localProjectTypeItems,
  updateProjectTypeData
);

const showCreateCommonDialog = ref(false);
</script>

<style scoped></style>
