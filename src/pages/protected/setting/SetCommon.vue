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
import { ref } from 'vue';
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
} = useCommonAction();

const handleAddConstruction = (newItem: string) => {
  updateConstructionData([...localConstructionItems.value, newItem]);
};

const handleDeleteConstruction = (index: string) => {
  localConstructionItems.value = localConstructionItems.value.filter((item) => item !== index);
  updateConstructionData(localConstructionItems.value);
};

const handleAddUnit = (newItem: string) => {
  updateUnitData([...localUnitItems.value, newItem]);
};

const handleDeleteUnit = (index: string) => {
  localUnitItems.value = localUnitItems.value.filter((item) => item !== index);
  updateUnitData(localUnitItems.value);
};

const showCreateCommonDialog = ref(false);
</script>

<style scoped></style>
