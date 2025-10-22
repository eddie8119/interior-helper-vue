<template>
  <div class="flex items-center gap-2 md:gap-3">
    <ShowNowTime />
    <div v-for="nav in navItems" :key="nav.id" class="flex items-center">
      <!-- 下拉選項 -->
      <ElDropdown
        v-if="nav.dropdownItems"
        :trigger="'click'"
        @command="(command) => nav.action(command)"
      >
        <button class="flex items-center">
          <span
            class="icon-hover icon-mask"
            :style="{
              WebkitMaskImage: `url(${getIconUrl(nav.icon)})`,
              maskImage: `url(${getIconUrl(nav.icon)})`,
              backgroundColor: isDarkMode
                ? 'var(--color-dark-primary-text)'
                : 'var(--color-primary-text)',
            }"
            :aria-label="`${nav.name}-Icon`"
            role="img"
          />
        </button>
        <template #dropdown>
          <ElDropdownMenu>
            <ElDropdownItem
              v-for="item in nav.dropdownItems"
              :key="item.value"
              :command="item.value"
            >
              {{ t(`dropdown.${item.label}`) }}
            </ElDropdownItem>
          </ElDropdownMenu>
        </template>
      </ElDropdown>
      <!-- 沒有下拉選項 -->
      <button v-else type="button" class="flex items-center" @click="nav.action && nav.action()">
        <span
          class="icon-hover icon-mask"
          :style="{
            WebkitMaskImage: `url(${getIconUrl(nav.icon)})`,
            maskImage: `url(${getIconUrl(nav.icon)})`,
            backgroundColor: isDarkMode
              ? 'var(--color-dark-primary-text)'
              : 'var(--color-primary-text)',
          }"
          :aria-label="`${nav.name}-Icon`"
          role="img"
        />
      </button>
    </div>
    <!-- 顯示身分 -->
    <p class="text200-color-difference text-sm">
      {{ isAdmin ? t('common.role.admin') : t('common.role.user') }}
    </p>
    <MobileNav />
  </div>
</template>

<script setup lang="ts">
import { ElDropdown, ElDropdownItem, ElDropdownMenu } from 'element-plus';
import { computed, inject, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';

import MobileNav from './MobileNav.vue';
import ShowNowTime from './ShowNowTime.vue';

import type { NavItem } from '@/types/layout';

import { useAuthentication } from '@/composables/useAuthentication';
import { useLocale } from '@/composables/useLocale';
import { useAuthStore } from '@/stores/auth';
import { Language } from '@/types/language';
import { getIconUrl } from '@/utils/assetUrl';
import { isAdmin } from '@/utils/auth';

const { t } = useI18n();
const authStore = useAuthStore();
const { languages, handleLanguageChange } = useLocale();
const { authentications, handleAuthenticationChange } = useAuthentication();

const toggleTheme = inject('toggleTheme') as () => void;
const isDarkMode = inject('isDarkMode') as Ref<boolean>;

// 為了解決 型別切換
const handleLanguageSelect = (code: string): void => {
  handleLanguageChange(code as Language);
};

const navItems = computed<NavItem[]>(() => {
  const baseItems: NavItem[] = [
    {
      id: 0,
      name: 'LightSet',
      icon: 'LightSet',
      label: t('common.light_set'),
      action: toggleTheme,
    },
    {
      id: 1,
      name: 'Global',
      icon: 'Global',
      label: t('common.language'),
      action: handleLanguageSelect,
      dropdownItems: languages.map((lang) => ({
        label: lang.label,
        value: lang.code,
      })),
    },
  ];
  if (authStore.isAuthenticated) {
    baseItems.push(
      // {
      //   id: 2,
      //   name: 'Notification',
      //   icon: 'Bell',
      //   label: t('common.notification'),
      //   action: () => {},
      // },

      {
        id: 2,
        name: 'Authentication',
        icon: 'UserCircle',
        label: t('common.authentication'),
        action: handleAuthenticationChange,
        dropdownItems: authentications.map((auth) => ({
          label: auth.label,
          value: auth.code,
        })),
      }
    );
  }

  return baseItems;
});
</script>

<style lang="scss" scoped></style>
