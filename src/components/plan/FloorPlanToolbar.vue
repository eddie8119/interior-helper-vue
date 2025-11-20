<template>
  <div class="absolute left-4 top-4 z-10 flex gap-2">
    <!-- 圖片切換按鈕 -->
    <div v-if="hasMultipleImages" class="flex gap-1">
      <button
        class="rounded-lg bg-white px-2 py-2 text-sm shadow-md hover:bg-gray-50 disabled:opacity-50"
        :disabled="currentImageIndex === 0"
        @click="$emit('prev-image')"
      >
        ←
      </button>
      <div class="flex items-center rounded-lg bg-white px-3 py-2 text-sm shadow-md">
        {{ currentImageIndex + 1 }} / {{ totalImages }}
      </div>
      <button
        class="rounded-lg bg-white px-2 py-2 text-sm shadow-md hover:bg-gray-50 disabled:opacity-50"
        :disabled="currentImageIndex === totalImages - 1"
        @click="$emit('next-image')"
      >
        →
      </button>
    </div>

    <button
      v-if="!isConfirmingReset"
      class="rounded-lg bg-white px-3 py-2 text-sm shadow-md hover:bg-gray-50"
      @click="$emit('reset-floor-plan')"
    >
      重新上傳
    </button>

    <!-- 確認重置對話框 -->
    <div v-else class="flex gap-2">
      <button
        class="rounded-lg bg-red-500 px-3 py-2 text-sm text-white shadow-md hover:bg-red-600"
        @click="$emit('confirm-reset-floor-plan')"
      >
        確認重置
      </button>
      <button
        class="rounded-lg bg-gray-300 px-3 py-2 text-sm shadow-md hover:bg-gray-400"
        @click="$emit('cancel-reset-floor-plan')"
      >
        取消
      </button>
    </div>
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
  isConfirmingReset?: boolean;
  hasMultipleImages?: boolean;
  currentImageIndex?: number;
  totalImages?: number;
}>();

defineEmits<{
  'reset-floor-plan': [];
  'confirm-reset-floor-plan': [];
  'cancel-reset-floor-plan': [];
  'reset-zoom': [];
  'toggle-add-marker': [];
  'prev-image': [];
  'next-image': [];
}>();
</script>
