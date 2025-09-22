<template>
  <label class="mb-2 font-medium text-gray-700" :class="props.className">{{ props.label }}</label>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: string;
  className?: string;
}>();
</script>

<style lang="scss" scoped></style>
