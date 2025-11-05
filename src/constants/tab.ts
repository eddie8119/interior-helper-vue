import type { Tab } from '@/types/layout';
import { TaskTimeCondition } from '@/types/task';

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

export const OVERVIEW_TASK_CONDITION_TAB_LIST: Tab[] = [
  {
    label: 'All',
    name: TaskTimeCondition.ALL,
  },
  {
    label: 'Overdue',
    name: TaskTimeCondition.OVERDUE,
  },
  {
    label: 'Today',
    name: TaskTimeCondition.TODAY,
  },
  {
    label: 'This Week',
    name: TaskTimeCondition.THIS_WEEK,
  },
  {
    label: 'This Month',
    name: TaskTimeCondition.THIS_MONTH,
  },
] as const;

export const SETTING_COMMON_TAB_LIST: Tab[] = [
  {
    label: 'Common All',
    name: 'all',
  },
] as const;
