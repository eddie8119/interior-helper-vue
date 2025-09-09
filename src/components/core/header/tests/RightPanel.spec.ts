import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import RightPanel from '../RightPanel.vue';

// Mock dependencies
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({
    isAdmin: false,
  }),
}));

vi.mock('@/composables/useAuthentication', () => ({
  useAuthentication: () => ({
    authentications: [{ label: 'Logout', code: 'logout' }],
    handleAuthenticationChange: vi.fn(),
  }),
}));

vi.mock('@/composables/useLocale', () => ({
  useLocale: () => ({
    languages: [{ label: 'English', code: 'en' }],
    handleLanguageChange: vi.fn(),
  }),
}));

const mockAuthStore = {
  isAuthenticated: false,
};

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}));

describe('RightPanel.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockAuthStore.isAuthenticated = false; // Reset before each test
  });

  const createWrapper = () => {
    return mount(RightPanel, {
      global: {
        stubs: {
          ShowNowTime: true,
          MobileNav: true,
          ElDropdown: {
            template: '<div><slot /><slot name="dropdown" /></div>',
          },
          ElDropdownMenu: {
            template: '<div><slot /></div>',
          },
          ElDropdownItem: {
            template: '<div><slot /></div>',
          },
        },
      },
    });
  };

  it('renders only global icon when not authenticated', () => {
    const wrapper = createWrapper();
    const icons = wrapper.findAll('img');
    expect(icons.length).toBe(1);
    expect(icons[0].attributes('alt')).toBe('Global-Icon');
  });

  it('renders all icons when authenticated', () => {
    mockAuthStore.isAuthenticated = true;
    const wrapper = createWrapper();
    const icons = wrapper.findAll('img');
    expect(icons.length).toBe(3);
    expect(icons[0].attributes('alt')).toBe('Global-Icon');
    expect(icons[1].attributes('alt')).toBe('Notification-Icon');
    expect(icons[2].attributes('alt')).toBe('Authentication-Icon');
  });

  it('displays user role', () => {
    const wrapper = createWrapper();
    expect(wrapper.text()).toContain('common.role.user');
  });
});
