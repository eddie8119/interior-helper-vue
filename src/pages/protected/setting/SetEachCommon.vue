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
</template>

<script setup lang="ts">
import { type Ref } from 'vue';

import EditArea from '@/components/setting/EditArea.vue';
import { useCommonAction } from '@/composables/useCommonAction';

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
</script>

<style scoped></style>
