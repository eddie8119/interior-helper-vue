<template>
  <header class="header-container border-bottom justify-between">
    <LogoArea class="--mobile md:hidden" />
    <div class="--desktop hidden md:block">
      <div class="flex">
        <button
          class="mr-4 transition-transform duration-300 hover:text-gray-800"
          :class="{ 'rotate-90': props.isSidebarCollapsed }"
          @click="emit('toggle-sidebar')"
        >
          <span
            class="icon-hover icon-mask"
            :style="{
              WebkitMaskImage: `url(${getIconUrl('Menu')})`,
              maskImage: `url(${getIconUrl('Menu')})`,
              backgroundColor: 'var(--color-primary-text)',
            }"
            aria-label="menu Icon"
            role="img"
          />
        </button>
        <PrePage />
        <!-- <Breadcrumb /> -->
      </div>
    </div>
    <RightPanel />
  </header>
</template>

<script setup lang="ts">
import RightPanel from '@/components/core/header/RightPanel.vue';
import PrePage from '@/components/core/PrePage.vue';
import LogoArea from '@/components/core/sidebar/LogoArea.vue';
import { getIconUrl } from '@/utils/assetUrl';

const props = defineProps<{
  isSidebarCollapsed: boolean;
}>();

const emit = defineEmits(['toggle-sidebar']);
</script>

<style lang="scss" scoped></style>
