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
        label: 'to-do',
        name: 'to-do',
        icon: 'ChartPieSlice',
        route: '/project/to-do',
      },
      {
        label: 'pH',
        name: 'ph',
        icon: 'PH',
        route: '/observation/ph/devices',
      },
      {
        label: 'ORP',
        name: 'orp',
        icon: 'ORP',
        route: '/observation/orp/devices',
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
