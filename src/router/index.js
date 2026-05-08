import { pinia } from '@/main'
import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'  // ← NEW

// Admin views
import LoginView      from '../views/LoginView.vue'
import DashboardView  from '../views/DashboardView.vue'
import EmployeesView  from '../views/EmployeesView.vue'
import AttendanceView from '../views/AttendanceView.vue'
import CalendarView   from '../views/CalendarView.vue'
import LeaveView      from '../views/LeaveView.vue'

// Employee views
import UserDashboardView     from '../views/user/UserDashboardView.vue'
import UserAttendanceView    from '../views/user/UserAttendanceView.vue'
import UserLeaveView         from '../views/user/UserLeaveView.vue'
import UserCalendarView      from '../views/user/UserCalendarView.vue'
import UserNotificationsView from '../views/user/UserNotificationsView.vue'

// ✅ NEW: Change Password
import ChangePasswordView from '../views/changePassword.vue'

const routes = [
  { path: '/', redirect: '/login' },

  // Public routes
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/change-password', name: 'ChangePassword', component: ChangePasswordView },

  // Admin routes
  {
    path: '/dashboard',
    component: DashboardView,
    meta: { role: 'admin' }
  },
  {
    path: '/employees',
    component: EmployeesView,
    meta: { role: 'admin' }
  },
  {
    path: '/attendance',
    component: AttendanceView,
    meta: { role: 'admin' }
  },
  {
    path: '/calendar',
    component: CalendarView,
    meta: { role: 'admin' }
  },
  {
    path: '/leave',
    component: LeaveView,
    meta: { role: 'admin' }
  },

  // Employee routes
  {
    path: '/user/dashboard',
    component: UserDashboardView,
    meta: { role: 'employee' }
  },
  {
    path: '/user/profile',
    component: () => import('@/views/user/UserEmployeeProfile.vue'),
    meta: { role: 'employee' }
  },
  {
    path: '/user/attendance',
    component: UserAttendanceView,
    meta: { role: 'employee' }
  },
  {
    path: '/user/leave',
    component: UserLeaveView,
    meta: { role: 'employee' }
  },
  {
    path: '/user/calendar',
    component: UserCalendarView,
    meta: { role: 'employee' }
  },
  {
    path: '/user/notifications',
    component: UserNotificationsView,
    meta: { role: 'employee' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

// ── Route Guard ──────────────────────────────────────────
router.beforeEach((to, from, next) => {

  const auth = useAuthStore(pinia)

  const isPublic =
    to.path === '/login' ||
    to.path === '/change-password'

  /* PUBLIC ROUTES */
  if (isPublic) {

    // already logged in
    if (auth.isAuthenticated && to.path === '/login') {

      // prevent redirect loop
      if (auth.isAdmin && to.path !== '/dashboard') {
        return next('/dashboard')
      }

      if (!auth.isAdmin && to.path !== '/user/dashboard') {
        return next('/user/dashboard')
      }
    }

    return next()
  }

  /* NOT LOGGED IN */
  if (!auth.isAuthenticated) {
    return next('/login')
  }

  /* WRONG ROLE */
  if (to.meta.role && to.meta.role !== auth.role) {

    if (auth.isAdmin) {
      return next('/dashboard')
    }

    return next('/user/dashboard')
  }

  /* SUCCESS */
  return next()
})

export default router