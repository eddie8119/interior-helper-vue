<template>
  <label class="mb-2 font-medium text-gray-500" :class="props.className">{{ props.label }}</label>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: string;
  className?: string;
}>();
</script>

<style lang="scss" scoped></style>
