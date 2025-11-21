<template>
  <div class="relative inline-flex items-center">
    <!-- 小記號 -->
    <button
      v-if="validFloorPlanUrls.length > 0"
      ref="buttonRef"
      :title="`${validFloorPlanUrls.length} 張平面圖`"
      class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-all hover:bg-blue-200 hover:shadow-md"
      @mouseenter="showTooltip = true"
      @mouseleave="showTooltip = false"
      @click="navigateToFloorPlan"
    >
      <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
        />
      </svg>
    </button>

    <!-- Tooltip 圖片預覽 -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showTooltip && validFloorPlanUrls.length > 0"
          class="fixed z-50 rounded-lg border border-gray-200 bg-white p-3 shadow-xl"
          :style="tooltipStyle"
        >
          <!-- 圖片預覽區域 -->
          <div class="space-y-2">
            <p class="text-xs font-semibold text-gray-700">
              平面圖預覽 ({{ validFloorPlanUrls.length }} 張)
            </p>
            <div class="flex max-w-xs gap-2 overflow-x-auto">
              <img
                v-for="(url, index) in validFloorPlanUrls.slice(0, 3)"
                :key="index"
                :src="url"
                :alt="`Floor plan ${index + 1}`"
                class="h-20 w-20 flex-shrink-0 rounded border border-gray-200 object-cover"
              />
              <div
                v-if="validFloorPlanUrls.length > 3"
                class="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600"
              >
                +{{ validFloorPlanUrls.length - 3 }}
              </div>
            </div>
            <p class="text-xs text-gray-500">點擊圖標查看完整平面圖</p>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

interface Props {
  floorPlanUrls?: string[];
  projectId: string;
}

const props = withDefaults(defineProps<Props>(), {
  floorPlanUrls: () => [],
});

const router = useRouter();
const showTooltip = ref(false);
const buttonRef = ref<HTMLButtonElement>();

// 確保 floorPlanUrls 是有效的陣列
const validFloorPlanUrls = computed(() => {
  return Array.isArray(props.floorPlanUrls) ? props.floorPlanUrls : [];
});

// 計算 tooltip 位置
const tooltipStyle = computed(() => {
  if (!buttonRef.value) return {};

  const rect = buttonRef.value.getBoundingClientRect();
  return {
    top: `${rect.bottom + 8}px`,
    left: `${Math.max(8, rect.left - 40)}px`,
  };
});

const navigateToFloorPlan = () => {
  router.push(`/todo/plan/${props.projectId}`);
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
