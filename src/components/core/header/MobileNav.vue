<template>
  <!-- 漢堡 Icon -->
  <img
    :src="getIconUrl('Hamburger')"
    alt="Hamburger Icon"
    class="icon-hover w-6 cursor-pointer invert dark:invert-0 md:hidden"
    @click="toggleHamburger"
  />

  <!-- 背景遮罩 -->
  <div
    v-show="isHamburgerOpen"
    class="bg-black/60 fixed inset-0 z-40 backdrop-blur-sm transition-opacity duration-300"
    @click="toggleHamburger"
  />

  <!-- 下滑式導航 -->
  <Transition name="slide-down">
    <div
      v-if="isHamburgerOpen"
      class="fixed left-0 top-[60px] z-50 w-full rounded-b-2xl bg-white shadow-lg dark:bg-black-900"
    >
      <!-- Header -->
      <div
        class="dark:border-black-700 flex items-center justify-end border-b border-black-100 px-4 py-3"
      >
        <img
          :src="getIconUrl('Close')"
          alt="Close menu"
          class="icon-hover w-6 cursor-pointer md:hidden"
          @click="toggleHamburger"
        />
      </div>

      <!-- Navigation -->
      <nav class="max-h-[calc(100vh-120px)] space-y-5 overflow-y-auto px-3 py-4">
        <div v-for="node in menuList" :key="node.group" class="space-y-2">
          <!-- Group Title -->
          <div
            class="px-2 text-xs font-semibold uppercase tracking-wide text-black-400 dark:text-black-200"
          >
            {{ node.group }}
          </div>

          <!-- Menu Items -->
          <div class="grid grid-cols-1 gap-2">
            <router-link
              v-for="item in node.items"
              :key="item.name"
              :to="item.route"
              class="dark:hover:bg-black-700 flex items-center rounded-lg px-3 py-2 transition-colors duration-200 hover:bg-black-100"
              @click="toggleHamburger"
            >
              <img
                :src="getIconUrl(item.icon)"
                :alt="`${item.name}-icon`"
                class="w-5 invert dark:invert-0"
              />
              <span class="ml-3 text-sm font-medium dark:text-white">{{ item.label }}</span>
            </router-link>
          </div>
        </div>
      </nav>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { Menu } from '@/types/layout';

import { menu } from '@/constants/menu';
import { getIconUrl } from '@/utils/assetUrl';

const { t } = useI18n();
const isHamburgerOpen = ref<boolean>(false);

// 轉換選單語系
const menuList = computed<Menu[]>(() =>
  menu.map((node) => ({
    ...node,
    group: t(node.group),
    items:
      node.items?.map((item) => ({
        ...item,
        label: t(`nav.menu.${item.name}`),
      })) || [],
  }))
);

const toggleHamburger = (): void => {
  isHamburgerOpen.value = !isHamburgerOpen.value;
};

// 畫面尺寸監聽
const checkScreenSize = (): void => {
  if (window.innerWidth >= 768) {
    isHamburgerOpen.value = false;
  }
};

onMounted(() => {
  checkScreenSize();
  window.addEventListener('resize', checkScreenSize);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize);
});
</script>

<style lang="scss" scoped>
.router-link-active {
  @apply bg-black-100 dark:bg-black-500;
}

/* 上滑動畫 */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.35s cubic-bezier(0.25, 1, 0.5, 1);
}
.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-10%);
  opacity: 0;
}

/* 避免滾動穿透 */
:deep(body.mobile-nav-open) {
  overflow: hidden;
}
</style>
