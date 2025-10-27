import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

import AppLayout from '@/layouts/AppLayout.vue';
import { useAuthStore } from '@/stores/auth';

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
        ],
      },
      {
        name: 'quick-draft',
        path: 'quick-draft',
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

  if (!isPublicPage && !authStore.isAuthenticated) {
    return next({
      name: 'login',
      query: { redirect: to.fullPath },
    });
  }

  if (authStore.isAuthenticated && isPublicPage) {
    return next({ name: 'overview' });
  }

  // isAdmin 是 Vue 的 ComputedRef 物件，而不是一個單純的布林值。
  // 在 JavaScript 中，任何物件（包括 ComputedRef 物件）在布林判斷中都會被視為 true

  next();
});

export default router;
