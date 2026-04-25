import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token:        localStorage.getItem('hrms_token') || null,
    refreshToken: localStorage.getItem('refresh_token') || null,
    role:         localStorage.getItem('hrms_role') || null,
    email:        localStorage.getItem('hrms_email') || null,
    employeeCode: localStorage.getItem('hrms_empcode') || null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin:         (state) => state.role === 'admin',
    isEmployee:      (state) => state.role === 'employee',
  },

  actions: {
    // Called after a successful login API response
    login({ access_token, refresh_token, user }) {
      this.token        = access_token
      this.refreshToken = refresh_token
      this.role         = user.role
      this.email        = user.email
      this.employeeCode = user.employeeCode || null

      // Persist everything — survives tab close + browser restart
      localStorage.setItem('hrms_token',    access_token)
      localStorage.setItem('refresh_token', refresh_token)
      localStorage.setItem('hrms_role',     user.role)
      localStorage.setItem('hrms_email',    user.email)
      if (user.employeeCode) {
        localStorage.setItem('hrms_empcode', user.employeeCode)
      }
    },

    // Update token after a refresh
    setToken(newToken) {
      this.token = newToken
      localStorage.setItem('hrms_token', newToken)
    },

    // Full logout — clears everything
    logout() {
      this.token        = null
      this.refreshToken = null
      this.role         = null
      this.email        = null
      this.employeeCode = null
      localStorage.clear()
      sessionStorage.clear()
    },
  },
})