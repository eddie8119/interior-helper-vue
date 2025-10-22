<template>
  <nav class="flex flex-col gap-5">
    <div v-for="node in menuList" :key="`menu-group-${node.group}`" class="flex flex-col gap-1">
      <div v-show="showGroupTitle" :class="groupTitleClassComputed">
        {{ node.group }}
      </div>
      <div v-for="item in node.items" :key="`menu-item-${item.label}`" class="flex flex-col gap-1">
        <router-link :to="item.route" :class="linkClassComputed" @click="$emit('item-click')">
          <div class="flex items-center gap-2">
            <span
              class="icon-hover icon-mask"
              :style="{
                WebkitMaskImage: `url(${getIconUrl(item.icon)})`,
                maskImage: `url(${getIconUrl(item.icon)})`,
                backgroundColor: isDarkMode
                  ? 'var(--color-dark-primary-text)'
                  : 'var(--color-primary-text)',
              }"
              :aria-label="`${item.name}-Icon`"
              role="img"
            />
          </div>
          <span v-show="labelVisible" class="text-color-difference ml-3 text-sm font-medium">{{
            item.label
          }}</span>
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, inject, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { menu } from '@/constants/menu';
import { type Menu, NavVariant } from '@/types/layout';
import { getIconUrl } from '@/utils/assetUrl';

const props = defineProps<{
  isSidebarCollapsed?: boolean;
  variant?: NavVariant;
  linkClass?: string;
  labelClass?: string;
  groupTitleClass?: string;
}>();
defineEmits<{ (e: 'item-click'): void }>();
const { t } = useI18n();
const isDarkMode = inject('isDarkMode') as Ref<boolean>;

const menuList = computed<Menu[]>(() =>
  menu.map((node) => ({
    ...node,
    group: t(node.group),
    items: node.items.map((item) => ({
      ...item,
      label: t(`nav.menu.${item.name}`),
    })),
  }))
);

const isCollapsed = computed(() => !props.isSidebarCollapsed);
const variant = computed(() => props.variant ?? NavVariant.SIDEBAR);

const showGroupTitle = computed(() =>
  variant.value === NavVariant.MOBILE ? true : isCollapsed.value
);

const linkClassComputed = computed(
  () =>
    props.linkClass ??
    (variant.value === NavVariant.SIDEBAR
      ? `sidebar-nav-link ${props.isSidebarCollapsed ? 'justify-center' : ''}`
      : 'dark:hover:bg-black-700 flex items-center rounded-lg px-3 py-2 transition-colors duration-200 hover:bg-black-100')
);

const groupTitleClassComputed = computed(
  () => props.groupTitleClass ?? 'px-3 text-xs text200-color-difference'
);

const labelVisible = computed(() =>
  variant.value === NavVariant.MOBILE ? true : isCollapsed.value
);
</script>

<style></style>
