<template>
  <div class="scrollbar-hide overflow-x-auto">
    <div class="flex min-w-max border-b">
      <router-link
        v-for="tab in finalTabs"
        :key="tab.name"
        :to="tab.to"
        class="whitespace-nowrap border-b-2 px-3 py-2 text-sm transition-colors md:px-4"
        :class="[
          tab.isActive
            ? 'rounded-t-lg border-brand-primary font-medium'
            : 'hover:border-brand-primary/30 border-transparent text-black-400 hover:text-brand-primary',
        ]"
      >
        {{ tab.label }}
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { type RouteLocationRaw, useRoute } from 'vue-router';

import type { Tab } from '@/types/layout';

const props = defineProps<{
  subject: string;
  tabsList: Tab[];
}>();
const { t } = useI18n();
const route = useRoute();
const finalTabs = computed(() => {
  return props.tabsList.map((tab) => {
    const routeName = `todo-${tab.name}`;
    const to: RouteLocationRaw = {
      name: routeName,
      params: { id: route.params.id as string },
    };
    const isActive = route.name === routeName;

    return {
      ...tab,
      label: t(`tab.${tab.name}`),
      to,
      isActive,
    };
  });
});
</script>

<style scoped></style>
