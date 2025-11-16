import type { Tab } from '@/types/layout';

import { TaskTimeCondition } from '@/types/task';

export const USER_TAB_LIST: Tab[] = [
  {
    name: 'profile',
  },
  {
    name: 'change-password',
  },
];

export const TO_DO_TAB_LIST: Tab[] = [
  {
    name: 'projects',
  },
];

export const OVERVIEW_TASK_CONDITION_TAB_LIST: Tab[] = [
  {
    name: TaskTimeCondition.ALL,
  },
  {
    name: TaskTimeCondition.UNSCHEDULED,
  },
  {
    name: TaskTimeCondition.OVERDUE,
  },
  {
    name: TaskTimeCondition.TODAY,
  },
  {
    name: TaskTimeCondition.THIS_WEEK,
  },
  {
    name: TaskTimeCondition.THIS_MONTH,
  },
];

export const SETTING_COMMON_TAB_LIST: Tab[] = [
  {
    name: 'all',
  },
];
