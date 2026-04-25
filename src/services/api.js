import { useAuthStore } from '@/stores/authStore'
import axios from 'axios'

const API_BASE_URL = process.env.VUE_APP_API_URL || 'http://localhost:3000/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

apiClient.interceptors.response.use(
  response => response,
  async error => {
    const auth = useAuthStore()
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = auth.refreshToken

        const res = await axios.post(
          "http://localhost:3000/api/auth/refresh",
          {
            refresh_token: refreshToken
          }
        )

        const newAccessToken = res.data.access_token

        // ✅ update token via pinia
        auth.setToken(newAccessToken)

        // ✅ retry request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return apiClient(originalRequest)

      } catch (err) {
        console.error("Refresh failed:", err)

        // ✅ logout via pinia
        auth.logout()
        window.location.href = "/login"
      }
    }

    return Promise.reject(error)
  }
)
export const authAPI = {
  login:          (email, password)    => apiClient.post('/auth/login',           { email, password }),
  logout:         (refresh_token)      => apiClient.post('/auth/logout',          { refresh_token }),
  changePassword: (email, newPassword) => apiClient.post('/auth/change-password', { email, newPassword }),
}

export const adminAPI = {
  getProfile:     ()       => apiClient.get('/admin/profile'),
  listEmployees:  ()       => apiClient.get('/admin/employees'),
  createEmployee: (data)   => apiClient.post('/admin/employees', data),
}

export const userAPI = {
  createEmployee: (data) => apiClient.post('/users/create-employee', data),
  listEmployees:  ()     => apiClient.get('/users/employees'),
}

export const profileAPI = {
  get:                   (code)       => apiClient.get(`/employees/${code}/personal`),
  upsertPersonalBasic:   (code, data) => apiClient.put(`/employees/${code}/personal/basic`, data),
  upsertAddress:         (code, data) => apiClient.put(`/employees/${code}/address`, data),
  upsertIdentity:        (code, data) => apiClient.put(`/employees/${code}/identity`, data),
  addPreviousEmployment: (code, data) => apiClient.put(`/employees/${code}/previous-employment`, data),
  addEducation:          (code, data) => apiClient.put(`/employees/${code}/education`, data),
  addDocument:           (code, data) => apiClient.put(`/employees/${code}/document`, data),
}

export const attendanceAPI = {
  punch:          (data)         => apiClient.post('/attendance/punch', data),
  assignShift:    (data)         => apiClient.post('/attendance/assign-shift', data),
  computeSummary: (data)         => apiClient.post('/attendance/compute-summary', data),
  getLogs:        (code, params) => apiClient.get(`/attendance/${code}`, { params }),
  getSummary:     (code, params) => apiClient.get(`/attendance/summary/${code}`, { params }),
  regularize:     (logId, data)  => apiClient.put(`/attendance/regularize/${logId}`, data),
}

export const lookupAPI = {
  getByCode:          (code) => apiClient.get(`/lookups/${code}`),
  getCountries:       ()     => apiClient.get('/lookups/geo/countries'),
  getStatesByCountry: (cId)  => apiClient.get(`/lookups/geo/countries/${cId}/states`),
  getCitiesByState:   (sId)  => apiClient.get(`/lookups/geo/states/${sId}/cities`),
  getDepartments:     ()     => apiClient.get('/lookups/org/departments'),
  getDesignations:    ()     => apiClient.get('/lookups/org/designations'),
  getOfficeLocations: ()     => apiClient.get('/lookups/org/office-locations'),
  getPayGrades:       ()     => apiClient.get('/lookups/org/pay-grades'),
  getShifts:          ()     => apiClient.get('/lookups/org/shifts'),
}

export default apiClient
