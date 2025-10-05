<template>
  <div class="nowrap text-base font-medium dark:text-white" :class="props.className">
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
