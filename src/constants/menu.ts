import type { Menu } from '@/types/layout';

export const MENU: Menu[] = [
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
    group: 'nav.group.record_items',
    items: [
      {
        label: 'to_do',
        name: 'to_do',
        icon: 'ClipboardText',
        route: '/todo/projects',
      },
      {
        label: 'quick_draft',
        name: 'quick_draft',
        icon: 'Paperclip',
        route: '/todo/quick_draft',
      },
    ],
  },
  {
    group: 'nav.group.setting',
    items: [
      {
        label: 'Set Common',
        name: 'set_common',
        icon: 'Palette',
        route: '/setting/common',
      },
      {
        label: 'Set Member',
        name: 'set-member',
        icon: 'Palette',
        route: '/setting/member',
      },
      {
        label: 'Notifications',
        name: 'notifications',
        icon: 'Bell',
        route: '/notifications',
      },
    ],
  },
];
