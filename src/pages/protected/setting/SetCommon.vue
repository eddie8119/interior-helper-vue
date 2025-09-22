<template>
  <div class="flex flex-col gap-4">
    <EditConstruction
      :new-construction-item="newConstructionItem"
      :local-construction-items="localConstructionItems"
    />
  </div>
</template>

<script setup lang="ts">
import EditConstruction from '@/components/management/EditConstruction.vue';
import { useCommonAction } from '@/composables/useCommonAction';

const { newConstructionItem, localConstructionItems, updateCommonData } = useCommonAction();
</script>

<style scoped></style>
