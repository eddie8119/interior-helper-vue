<template>
  <Transition name="todo-slide">
    <div v-if="isQuickDraftSlideVisible" class="fixed inset-0 z-[999]">
      <!-- Slide panel -->
      <div
        class="absolute left-0 top-0 flex h-full w-full rounded-none bg-white pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] shadow-xl sm:w-[65%] sm:max-w-[550px] sm:rounded-r-[20px]"
      >
        <DeleteButton
          class="absolute right-4 top-4 ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 sm:right-6 sm:top-6"
          width="w-8"
          height="h-8"
          icon-width="w-4"
          icon-height="h-4"
          aria-label="Close"
          @click="hideQuickDraftSlide"
        />
        <div class="h-full w-full overflow-auto p-4 sm:p-6">
          <QuickDraft />
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';

import QuickDraft from './QuickDraft.vue';

import DeleteButton from '@/components/ui/DeleteButton.vue';
import { useSlideStore } from '@/stores/slide';

const slideStore = useSlideStore();
const { isQuickDraftSlideVisible } = storeToRefs(slideStore);
const { hideQuickDraftSlide } = slideStore;
</script>

<style lang="scss" scoped>
.todo-slide-enter-active,
.todo-slide-leave-active {
  transition: all 0.35s ease;
}

/* Start off-screen to the right, use percentage for responsive behavior */
.todo-slide-enter {
  transform: translateX(100%);
}

.todo-slide-enter-to {
  transform: translateX(0);
}

/* Leave animates slightly left for a natural slide-out */
.todo-slide-leave-to {
  transform: translateX(-10%);
  opacity: 0.9;
}
</style>
