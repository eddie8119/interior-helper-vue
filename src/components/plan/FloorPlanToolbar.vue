<template>
  <div class="absolute left-4 top-4 z-10 flex gap-2">
    <button
      class="rounded-lg bg-white px-3 py-2 text-sm shadow-md hover:bg-gray-50"
      @click="$emit('reset-floor-plan')"
    >
      重新上傳
    </button>
    <button
      class="rounded-lg bg-white px-3 py-2 text-sm shadow-md hover:bg-gray-50"
      @click="$emit('reset-zoom')"
    >
      適應螢幕
    </button>
    <button
      class="rounded-lg px-3 py-2 text-sm shadow-md transition-colors"
      :class="isAddingMarker ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-50'"
      @click="$emit('toggle-add-marker')"
    >
      {{ isAddingMarker ? '取消標記' : '添加標記' }}
    </button>
    <div class="rounded-lg bg-white px-3 py-2 text-sm shadow-md">
      {{ Math.round(scale * 100) }}%
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  scale: number;
  isAddingMarker: boolean;
}>();

defineEmits<{
  'reset-floor-plan': [];
  'reset-zoom': [];
  'toggle-add-marker': [];
}>();
</script>
