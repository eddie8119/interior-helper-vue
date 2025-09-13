import type { Menu } from '@/types/layout';

export const menu: Menu[] = [
  {
    group: 'nav.group.home',
    items: [
      {
        label: 'overview',
        name: 'overview',
        icon: 'Home',
        route: '/overview',
      },
    ],
  },
  {
    group: 'nav.group.observation_items',
    items: [
      {
        label: 'to-do-list',
        name: 'to-do-list',
        icon: 'ChartPieSlice',
        route: '/todo/projects',
      },
      {
        label: 'pH',
        name: 'ph',
        icon: 'PH',
        route: '/observation/ph/devices',
      },
    ],
  },
  {
    group: 'nav.group.management',
    items: [
      {
        key: 0,
        label: 'Set Member',
        name: 'set-member',
        icon: 'ChartPieSlice',
        route: '/management/set-member',
      },
    ],
  },
];
