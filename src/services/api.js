import axios from 'axios'

const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const API_BASE_URL = isLocalhost
  ? "http://localhost:3000/api"
  : "http://10.113.178.55:3000/api";
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refresh_token") || sessionStorage.getItem("refresh_token");

        console.log("REFRESH TOKEN:", refreshToken); // 🔥 DEBUG

        const res = await axios.post(
          "http://localhost:3000/api/auth/refresh",
          {
            refresh_token: refreshToken   // ✅ FIX HERE
          }
        );

        const newAccessToken = res.data.access_token;

        // ✅ SAVE NEW TOKEN
        sessionStorage.setItem("hrms_token", newAccessToken);
        localStorage.setItem("hrms_token", newAccessToken);

        // ✅ RETRY REQUEST
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);

      } catch (err) {
        console.error("Refresh failed:", err);

        sessionStorage.clear();
        localStorage.clear();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

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
  punch:          (data)         => apiClient.post('/attendance/punch-in', data),
  punchOut:       (data)         => apiClient.post('/attendance/punch-out', data),
  assignShift:    (data)         => apiClient.post('/attendance/assign-shift', data),
  computeSummary: (data)         => apiClient.post('/attendance/compute-summary', data),
  getLogs:        (code, params) => apiClient.get(`/attendance/${code}`, { params }),
  getSummary:     (code, params) => apiClient.get(`/attendance/summary/${code}`, { params }),
  regularize:     (logId, data)  => apiClient.put(`/attendance/regularize/${logId}`, data),
}

// ── Calendar API ──────────────────────────────────────────────────────────────
export const calendarAPI = {
  // ── Holidays ────────────────────────────────────────────────────────────────
  // GET /api/calendar/holidays?year=2026&month=5
  getHolidays:   (params)      => apiClient.get('/calendar/holidays', { params }),
 
  // POST /api/calendar/holidays  (admin only)
  createHoliday: (data)        => apiClient.post('/calendar/holidays', data),
 
  // PUT /api/calendar/holidays/:id  (admin only)
  updateHoliday: (id, data)    => apiClient.put(`/calendar/holidays/${id}`, data),
 
  // DELETE /api/calendar/holidays/:id  (admin only)
  deleteHoliday: (id)          => apiClient.delete(`/calendar/holidays/${id}`),
 
  // ── Events ──────────────────────────────────────────────────────────────────
  // GET /api/calendar/events?from=2026-05-01&to=2026-05-31
  getEvents:     (params)      => apiClient.get('/calendar/events', { params }),
 
  // GET /api/calendar/events/:id
  getEventById:  (id)          => apiClient.get(`/calendar/events/${id}`),
 
  // POST /api/calendar/events
  createEvent:   (data)        => apiClient.post('/calendar/events', data),
 
  // PUT /api/calendar/events/:id
  updateEvent:   (id, data)    => apiClient.put(`/calendar/events/${id}`, data),
 
  // DELETE /api/calendar/events/:id  (soft cancel)
  deleteEvent:   (id)          => apiClient.delete(`/calendar/events/${id}`),
 
  // ── Attendees / RSVP ────────────────────────────────────────────────────────
  // PUT /api/calendar/events/:id/rsvp  body: { rsvpStatus }
  rsvp:          (id, status)  => apiClient.put(`/calendar/events/${id}/rsvp`, { rsvpStatus: status }),
 
  // POST /api/calendar/events/:id/invite  body: { employeeIds[] }
  invite:        (id, empIds)  => apiClient.post(`/calendar/events/${id}/invite`, { employeeIds: empIds }),
 
  // ── Views ───────────────────────────────────────────────────────────────────
  // GET /api/calendar/my-calendar?from=...&to=...
  getMyCalendar: (params)      => apiClient.get('/calendar/my-calendar', { params }),
 
  // GET /api/calendar/team-view?from=...&to=...&departmentId=...
  getTeamView:   (params)      => apiClient.get('/calendar/team-view', { params }),
 
  // GET /api/calendar/upcoming?days=7&limit=10
  getUpcoming:   (params)      => apiClient.get('/calendar/upcoming', { params }),
 
  // GET /api/calendar/admin/overview?year=2026&month=5  (admin only)
  getAdminOverview: (params)   => apiClient.get('/calendar/admin/overview', { params }),
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
  getEmploymentTypes: ()     => apiClient.get('/lookups/employment-types'),  // ← ADD THIS
}

export default apiClient
