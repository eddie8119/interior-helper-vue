<template>
  <div
    class="text-color-difference mb-2 w-full text-lg font-medium capitalize"
    :class="props.className"
  >
    <h2>{{ props.title }}</h2>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string;
  className?: string;
}>();
</script>

<style lang="scss" scoped></style>
