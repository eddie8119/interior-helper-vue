<template>
  <transition class="hidden sm:block" name="todo-slide">
    <div
      v-if="isQuickDraftSlideVisible"
      class="fixed left-0 top-0 z-[999] flex h-full w-[65%] max-w-[550px] rounded-r-[20px] bg-white shadow-xl"
    >
      <button
        type="button"
        class="absolute right-6 top-6 ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900"
        @click="hideQuickDraftSlide"
      >
        <!-- <CloseIcon height="25px" /> -->
        x
      </button>
      <div class="h-full w-full overflow-auto p-6">
        <QuickDraft />
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';

import QuickDraft from './QuickDraft.vue';

// import CloseIcon from '@/components/icons/CloseIcon.vue';
import { useQuickDraftStore } from '@/stores/quickDraft';

const quickDraftStore = useQuickDraftStore();
const { isQuickDraftSlideVisible } = storeToRefs(quickDraftStore);
const { hideQuickDraftSlide } = quickDraftStore;
</script>

<style lang="scss" scoped>
.todo-slide-enter-active,
.todo-slide-leave-active {
  transition: all 1s ease;
}

.todo-slide-enter {
  transform: translateX(550px);
}

.todo-slide-enter-to {
  transform: translateX(0);
}

.todo-slide-leave-to {
  transform: translateX(-550px);
}
</style>
