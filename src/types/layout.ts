export interface MenuItem {
  label: string;
  name: string;
  icon: string;
  route: string;
}

export interface Menu {
  group: string;
  items: MenuItem[];
}

export interface Tab {
  name: string;
  label?: string;
}

// header
export interface NavItem {
  id: number;
  name: string;
  icon: string;
  label: string;
  action: (value: string) => void;
  dropdownItems?: { label: string; value: string }[];
}

// 判斷navbar的模式
export enum NavVariant {
  SIDEBAR = 'sidebar',
  MOBILE = 'mobile',
}

// carousel
export enum DisplayMode {
  CAROUSEL = 'carousel',
  FIXED = 'fixed',
}
