<template>
  <div class="nowrap text-color-difference text-base font-medium" :class="props.className">
    <h3>{{ props.title }}</h3>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string;
  className?: string;
}>();
</script>

<style lang="scss" scoped></style>
