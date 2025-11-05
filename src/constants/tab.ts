import type { Tab } from '@/types/layout';

export const USER_TAB_LIST: Tab[] = [
  {
    label: 'Profile',
    name: 'profile',
  },
  {
    label: 'Change Password',
    name: 'change-password',
  },
] as const;

export const TO_DO_TAB_LIST: Tab[] = [
  {
    label: 'To Do Projects',
    name: 'projects',
  },
] as const;

export const SETTING_COMMON_TAB_LIST: Tab[] = [
  {
    label: 'Common All',
    name: 'all',
  },
] as const;
