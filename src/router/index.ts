import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

import AppLayout from '@/layouts/AppLayout.vue';
import { useAuthStore } from '@/stores/auth';
import { isAccessTokenValid } from '@/utils/auth';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../pages/404.vue'),
  },
  {
    path: '/shared/project/:id',
    name: 'shared-project',
    component: () => import('../pages/public/SharedProject.vue'),
    meta: { public: true },
  },
  {
    path: '/invitation/accept',
    name: 'invitation-accept',
    component: () => import('../views/InvitationAccept.vue'),
    meta: { public: true },
  },
  {
    path: '/auth',
    name: 'auth',
    component: () => import('../layouts/AuthLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('../pages/auth/Login.vue'),
      },
      {
        path: 'register',
        name: 'register',
        component: () => import('../pages/auth/Register.vue'),
      },
      {
        path: 'registration-success',
        name: 'registration-success',
        component: () => import('../pages/auth/RegistrationSuccess.vue'),
      },
      {
        path: 'account-activation',
        name: 'account-activation',
        component: () => import('../pages/auth/AccountActivation.vue'),
      },
      {
        path: 'forgot-password',
        name: 'forgot-password',
        component: () => import('../pages/auth/ForgotPassword.vue'),
      },
      {
        path: 'reset-password',
        name: 'reset-password',
        component: () => import('../pages/auth/ResetPassword.vue'),
      },
      {
        path: 'resend-activation',
        name: 'resend-activation',
        component: () => import('../pages/auth/ResendActivation.vue'),
      },
    ],
  },
  {
    path: '/',
    component: AppLayout,
    redirect: { name: 'overview' },
    children: [
      {
        name: 'overview',
        path: 'overview',
        component: () => import('../pages/protected/overview/index.vue'),
      },
      {
        name: 'schedule',
        path: 'schedule',
        component: () => import('../pages/protected/schedule/index.vue'),
      },
    ],
  },
  {
    path: '/user',
    component: AppLayout,
    children: [
      {
        name: 'user',
        path: '',
        component: () => import('../pages/protected/user/index.vue'),
        redirect: { name: 'profile' },
        children: [
          {
            name: 'profile',
            path: 'profile',
            component: () => import('../pages/protected/user/profile.vue'),
          },
          {
            name: 'change-password',
            path: 'change-password',
            component: () => import('../pages/protected/user/change-password.vue'),
          },
        ],
      },
    ],
  },
  {
    path: '/todo',
    component: AppLayout,
    children: [
      {
        path: '',
        component: () => import('../pages/protected/todo/index.vue'),
        redirect: { name: 'todo-projects' },
        children: [
          {
            name: 'todo-projects',
            path: 'projects',
            component: () => import('../pages/protected/todo/projects.vue'),
          },
          {
            name: 'todo-project',
            path: 'project/:id',
            component: () => import('../pages/protected/todo/project.vue'),
          },
          {
            name: 'todo-projects-download',
            path: 'projects-download',
            component: () => import('../pages/protected/todo/projects-download.vue'),
          },
        ],
      },
      {
        name: 'quick_draft',
        path: 'quick_draft',
        component: () => import('../pages/protected/draft/index.vue'),
      },
    ],
  },
  {
    path: '/setting',
    component: AppLayout,
    children: [
      {
        name: 'common',
        path: 'common',
        component: () => import('../pages/protected/setting/index.vue'),
        redirect: { name: 'all' },
        children: [
          {
            name: 'all',
            path: 'all',
            component: () => import('../pages/protected/setting/SetAllCommon.vue'),
          },
        ],
      },
      {
        name: 'member',
        path: 'member',
        component: () => import('../pages/protected/setting/SetMember.vue'),
      },
    ],
  },
  {
    path: '/notifications',
    component: AppLayout,
    children: [
      {
        name: 'notifications',
        path: '',
        component: () => import('../views/NotificationView.vue'),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();

  const publicPages = [
    '/auth/login',
    '/auth/register',
    '/auth/account-activation',
    '/auth/registration-success',
    '/auth/resend-activation',
    '/auth/reset-password',
    '/auth/forgot-password',
  ];
  const isPublicPage = publicPages.includes(to.path);

  // 檢查是否為受保護的頁面
  if (!isPublicPage) {
    // 驗證 token 是否有效
    if (!authStore.isAuthenticated || !isAccessTokenValid()) {
      // Token 無效或過期，清理狀態並重定向到登入頁
      authStore.logout();
      return next({
        name: 'login',
        query: { redirect: to.fullPath },
      });
    }
  }

  // 已登入用戶訪問公開頁面，重定向到首頁
  if (authStore.isAuthenticated && isPublicPage) {
    return next({ name: 'overview' });
  }

  next();
});

export default router;
