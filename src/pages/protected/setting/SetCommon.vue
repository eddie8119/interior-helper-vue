<template>
  <div class="flex flex-col gap-4">
    <EditConstruction
      :new-construction-item="newConstructionItem"
      :local-construction-items="localConstructionItems"
      @delete-construction="handleDeleteConstruction"
      @add-construction="handleAddConstruction"
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
import EditConstruction from '@/components/setting/EditConstruction.vue';
import { useCommonAction } from '@/composables/useCommonAction';

const { t } = useI18n();
const { newConstructionItem, localConstructionItems, updateConstructionData } = useCommonAction();

const handleAddConstruction = (newItem: string) => {
  updateConstructionData([...localConstructionItems.value, newItem]);
};

const handleDeleteConstruction = (index: string) => {
  localConstructionItems.value = localConstructionItems.value.filter((item) => item !== index);
  updateConstructionData(localConstructionItems.value);
};

const showCreateCommonDialog = ref(false);
</script>

<style scoped></style>
