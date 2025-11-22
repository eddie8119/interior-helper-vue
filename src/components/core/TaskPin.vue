<template>
  <div class="flex flex-col items-center text-center">
    <div
      class="ring-black/5 mt-1 max-w-[160px] rounded bg-white/95 px-2 py-1 text-xs font-medium leading-tight text-gray-700 shadow-md ring-1"
    >
      {{ title }}
    </div>
    <img src="@/assets/icons/PinGreen.png" alt="Pin" class="mt-1 h-6 w-6" />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
}>();
</script>
