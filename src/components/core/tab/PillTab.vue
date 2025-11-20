<template>
  <div class="flex flex-col">
    <Label v-if="showLabel" :label="label" />
    <!-- Mobile: horizontal scroll + snap; Desktop: inline-flex pill -->
    <div class="rounded-full sm:inline-flex sm:overflow-hidden">
      <div class="flex snap-x snap-mandatory overflow-x-auto sm:snap-none sm:overflow-visible">
        <button
          v-for="(tab, index) in tabs"
          :key="tab.value"
          class="tab-button shrink-0 snap-start rounded-none px-3 py-1 py-2 sm:first:rounded-l-full sm:first:pl-5 sm:last:rounded-r-full sm:last:pr-5"
          :class="{ 'is-active': modelValue === tab.value }"
          :aria-selected="modelValue === tab.value"
          @click="emit('update:modelValue', tab.value)"
        >
          <slot name="item" :tab="tab" :index="index">
            {{ tab.label ?? String(tab.value) }}
          </slot>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends string | number">
import Label from '@/components/core/title/Label.vue';

interface TabItem {
  value: T;
  label?: string;
}

defineProps<{
  modelValue: T;
  tabs: TabItem[];
  label?: string;
  showLabel?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: T): void;
}>();
</script>

<style scoped>
.tab-button {
  @apply bg-primary-panel text-black-400 dark:bg-primaryDark-panel;

  cursor: pointer;
}

.tab-button.is-active {
  @apply bg-brand-tertiary text-black-900;
}

/* Add separators between items on md and above */
@media (min-width: 768px) {
  .tab-button + .tab-button {
    border-left: 1px solid rgb(0 0 0 / 8%);
  }

  .dark .tab-button + .tab-button {
    border-left-color: rgb(255 255 255 / 15%);
  }
}
</style>
