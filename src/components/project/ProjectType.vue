<template>
  <OptionSelector
    v-model="model"
    :options="formattedProjectTypeItems"
    :class-name="'w-[160px]'"
    :use-i18n-label="false"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import OptionSelector from '@/components/ui/OptionSelector.vue';

import type { ProjectType } from '@/types/selection';
import type { SelectorOption } from '@/types/selection';

import { useCommon } from '@/composables/useCommon';

const props = defineProps<{
  projectType: ProjectType | undefined;
}>();

const emit = defineEmits<{
  (e: 'update:project-type', value: ProjectType): void;
}>();

const { projectTypeItems } = useCommon();

const formattedProjectTypeItems = computed<SelectorOption[]>(() => {
  return (
    projectTypeItems.value?.map((item: string) => ({
      value: item,
    })) || []
  );
});

// Proxy v-model to emit update:project-type
const model = computed<ProjectType | undefined>({
  get: () => props.projectType,
  set: (val: ProjectType | undefined) => {
    if (val !== undefined) {
      emit('update:project-type', val as ProjectType);
    }
  },
});
</script>

<style scoped>
.title-edit input {
  transition: none;
}
</style>
