<template>
  <UserLayout page-title="Attendance" page-sub="Track your daily presence and work hours." search-placeholder="Search records…">

    <!-- Stats Strip -->
    <div class="stats-row">
      <div v-for="s in summary" :key="s.label" class="stat-card" :class="s.featured ? 'stat-featured' : ''">
        <div class="stat-icon" :class="s.iconCls">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" v-html="s.icon"></svg>
        </div>
        <div class="stat-val" :style="{ color: s.color }">{{ s.val }}</div>
        <div class="stat-lbl">{{ s.label }}</div>
      </div>
    </div>

    <!-- Main grid: Clock-in + Monthly -->
    <div class="att-main">

      <!-- Clock widget -->
      <div class="card clock-card">
        <div class="cc-head">
          <div>
            <div class="card-eyebrow">Today</div>
            <div class="card-title" style="margin-bottom:4px">{{ todayFormatted }}</div>
            <div class="cc-time">{{ currentTime }}</div>
          </div>
          <div class="cc-badge" :class="isClockedIn ? 'clocked' : 'not-clocked'">
            {{ isClockedIn ? '● Clocked In' : '○ Not Clocked In' }}
          </div>
        </div>

        <div class="cc-times" v-if="isClockedIn">
          <div class="cc-time-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <div>
              <div class="cc-tl">Check In</div>
              <div class="cc-tv">{{ checkInTime }}</div>
            </div>
          </div>
          <div class="cc-time-divider"></div>
          <div class="cc-time-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <div>
              <div class="cc-tl">Expected Out</div>
              <div class="cc-tv">06:00 PM</div>
            </div>
          </div>
        </div>

        <!-- GPS Status Bar -->
        <div class="gps-bar" :class="gpsStatusClass">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="gps-icon">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle cx="12" cy="9" r="2.5"/>
          </svg>
          <div class="gps-info">
            <span class="gps-label">{{ gpsLabel }}</span>
            <span class="gps-coords" v-if="gpsCoords">{{ gpsCoords }}</span>
          </div>
          <div class="gps-dot-pulse" v-if="gpsStatus === 'verified'">
            <span class="gps-pulse-ring"></span>
            <span class="gps-pulse-dot"></span>
          </div>
        </div>

        <!-- Clock In/Out button -->
        <button
          class="clock-btn"
          :class="isClockedIn ? 'clock-btn-out' : 'clock-btn-in'"
          :disabled="gpsLoading"
          @click="toggleAttendance"
        >
          <span v-if="gpsLoading" class="btn-spinner"></span>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line v-if="!isClockedIn" x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          <span v-if="gpsLoading">Verifying location…</span>
          <span v-else>{{ isClockedIn ? 'Clock Out' : 'Clock In' }}</span>
        </button>

        <!-- Work hours progress -->
        <div class="cc-progress">
          <div class="cc-prog-head">
            <span>Work Hours</span>
            <span>{{ hoursWorked }}h / 8h</span>
          </div>
          <div class="cc-prog-bar">
            <div class="cc-prog-fill" :style="{ width: Math.min(hoursWorked / 8 * 100, 100) + '%' }"></div>
          </div>
        </div>
      </div>

      <!-- Monthly heatmap -->
      <div class="card month-card">
        <div class="card-head">
          <div class="card-title">{{ currentMonthLabel }}</div>
          <div class="month-legend">
            <span class="leg"><span class="ldot present"></span>Present</span>
            <span class="leg"><span class="ldot absent"></span>Absent</span>
            <span class="leg"><span class="ldot late"></span>Late</span>
            <span class="leg"><span class="ldot leave"></span>Leave</span>
          </div>
        </div>
        <div class="heatmap">
          <div class="hm-days">
            <span v-for="d in dayLabels" :key="d" class="hm-dl">{{ d }}</span>
          </div>
          <div class="hm-grid">
            <div
              v-for="(cell, i) in heatmapCells"
              :key="i"
              class="hm-cell"
              :class="[cell.type, cell.isToday ? 'today' : '']"
              :title="cell.title"
            ></div>
          </div>
        </div>
        <!-- Month stats -->
        <div class="month-stats">
          <div class="ms" v-for="m in monthStats" :key="m.label">
            <div class="ms-val" :style="{ color: m.color }">{{ m.val }}</div>
            <div class="ms-lbl">{{ m.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent records table -->
    <div class="card records-card">
      <div class="card-head" style="margin-bottom:0; padding-bottom:0">
        <div class="card-title">Recent Records</div>
        <div class="rec-filters">
          <button
            v-for="f in filters"
            :key="f"
            class="rfbtn"
            :class="{ active: activeFilter === f }"
            @click="activeFilter = f"
          >{{ f }}</button>
        </div>
      </div>
      <div class="rec-table-wrap">
        <table class="rec-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Hours</th>
              <th>Status</th>
              <th>Location</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in filteredRecords" :key="r.id">
              <td class="rt-date">
                <span class="rt-day">{{ r.day }}</span>
                <span class="rt-datelbl">{{ r.date }}</span>
              </td>
              <td class="rt-time" :class="r.late ? 'late' : ''">{{ r.checkIn || '—' }}</td>
              <td class="rt-time">{{ r.checkOut || '—' }}</td>
              <td>
                <span class="rt-hours" :class="r.hours >= 8 ? 'good' : r.hours > 0 ? 'half' : 'zero'">
                  {{ r.hours > 0 ? r.hours + 'h' : '—' }}
                </span>
              </td>
              <td><span class="rt-status" :class="'s-' + r.status.toLowerCase().replace(' ', '')">{{ r.status }}</span></td>
              <td class="rt-location">
                <span v-if="r.location" class="loc-badge">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  {{ r.location }}
                </span>
                <span v-else class="loc-none">—</span>
              </td>
              <td class="rt-note">{{ r.note || '—' }}</td>
            </tr>
            <tr v-if="filteredRecords.length === 0">
              <td colspan="7" class="empty-row">No records found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </UserLayout>
</template>

<script>
import UserLayout from '../../components/UserLayout.vue'

export default {
  name: 'AttendanceView',
  components: { UserLayout },

  data() {
    const now = new Date()
    return {
      isClockedIn: false,
      hoursWorked: 0,
      checkInTime: '',
      currentTime: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      todayFormatted: now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }),

      // GPS
      gpsStatus: 'idle',      // idle | loading | verified | denied | error
      gpsCoords: '',
      gpsLoading: false,
      gpsLatitude: null,
      gpsLongitude: null,

      activeFilter: 'All',
      filters: ['All', 'Present', 'Absent', 'Late', 'Leave'],

      dayLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],

      records: [],

      clockTimer: null,
      hoursTimer: null,
      checkInTimestamp: null,
    }
  },

  mounted() {
    this.loadAttendance()
    this.checkIfClockedIn()

    this.clockTimer = setInterval(() => {
      const now = new Date()
      this.currentTime = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      if (this.isClockedIn && this.checkInTimestamp) {
        const elapsed = (Date.now() - this.checkInTimestamp) / (1000 * 3600)
        this.hoursWorked = parseFloat(elapsed.toFixed(2))
      }
    }, 1000)
  },

  beforeUnmount() {
    if (this.clockTimer) clearInterval(this.clockTimer)
    if (this.hoursTimer) clearInterval(this.hoursTimer)
  },

  computed: {
    currentMonthLabel() {
      const now = new Date()
      return now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    },

    gpsStatusClass() {
      return {
        'gps-idle': this.gpsStatus === 'idle',
        'gps-loading': this.gpsStatus === 'loading',
        'gps-verified': this.gpsStatus === 'verified',
        'gps-denied': this.gpsStatus === 'denied',
        'gps-error': this.gpsStatus === 'error',
      }
    },

    gpsLabel() {
      const labels = {
        idle: 'Location not verified — required to clock in',
        loading: 'Accessing your location…',
        verified: 'Location verified · Within geofence',
        denied: 'Location access denied — please allow in browser settings',
        error: 'Unable to retrieve location',
      }
      return labels[this.gpsStatus] || ''
    },

    summary() {
      const present = this.records.filter(r => r.status === 'Present').length
      const absent = this.records.filter(r => r.status === 'Absent').length
      const late = this.records.filter(r => r.status === 'Late').length
      const leave = this.records.filter(r => r.status === 'Leave').length
      const totalHrs = this.records.reduce((a, r) => a + (parseFloat(r.hours) || 0), 0)
      const workingDays = this.records.filter(r => r.hours > 0).length
      const avgHrs = workingDays > 0 ? (totalHrs / workingDays).toFixed(1) : '0.0'

      return [
        {
          label: 'Days Present',
          val: present,
          color: '#2d6e33',
          iconCls: 'ic-green',
          icon: '<path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/>',
        },
        {
          label: 'Days Absent',
          val: absent,
          color: '#8a3525',
          iconCls: 'ic-peach',
          icon: '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>',
        },
        {
          label: 'Late Arrivals',
          val: late,
          color: '#7a5800',
          iconCls: 'ic-amber',
          icon: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
        },
        {
          label: 'Leave Taken',
          val: leave,
          color: '#4a5a4b',
          iconCls: 'ic-stone',
          icon: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
        },
        {
          label: 'Avg Hours / Day',
          val: avgHrs + 'h',
          color: '#a8e6b0',
          iconCls: 'ic-forest',
          icon: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
          featured: true,
        },
      ]
    },

    heatmapCells() {
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth()
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      const firstDow = new Date(year, month, 1).getDay()
      const offset = firstDow === 0 ? 6 : firstDow - 1

      const statusMap = {}
      this.records.forEach(r => {
        const key = r.rawDate
        if (key) statusMap[key] = r.status.toLowerCase()
      })

      const cells = []
      for (let i = 0; i < offset; i++) cells.push({ type: '', title: '' })

      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month, d)
        const dateStr = date.toISOString().split('T')[0]
        const dow = date.getDay()
        const isWeekend = dow === 0 || dow === 6
        const isToday = d === now.getDate()
        const type = isWeekend ? 'weekend' : (statusMap[dateStr] || '')
        const label = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
        cells.push({ type, title: label, isToday })
      }
      return cells
    },

    monthStats() {
      const present = this.records.filter(r => r.status === 'Present').length
      const late = this.records.filter(r => r.status === 'Late').length
      const absent = this.records.filter(r => r.status === 'Absent').length
      const leave = this.records.filter(r => r.status === 'Leave').length
      return [
        { val: present, label: 'Present', color: '#2d6e33' },
        { val: late, label: 'Late', color: '#7a5800' },
        { val: absent, label: 'Absent', color: '#8a3525' },
        { val: leave, label: 'On Leave', color: '#4a5a4b' },
      ]
    },

    filteredRecords() {
      if (this.activeFilter === 'All') return this.records
      return this.records.filter(r => r.status === this.activeFilter)
    },
  },

  methods: {
    /* ── GPS ─────────────────────────────────────────────── */
    requestLocation() {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('UNSUPPORTED'))
          return
        }
        this.gpsStatus = 'loading'
        navigator.geolocation.getCurrentPosition(
          pos => {
            this.gpsLatitude = pos.coords.latitude
            this.gpsLongitude = pos.coords.longitude
            this.gpsCoords = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`
            this.gpsStatus = 'verified'
            resolve(pos)
          },
          err => {
            if (err.code === err.PERMISSION_DENIED) {
              this.gpsStatus = 'denied'
              reject(new Error('DENIED'))
            } else {
              this.gpsStatus = 'error'
              reject(new Error('ERROR'))
            }
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        )
      })
    },

    /* ── Clock In / Out ──────────────────────────────────── */
    async toggleAttendance() {
      const email = sessionStorage.getItem('loggedInUser') || 'demo@gmail.com'
      const today = new Date().toISOString().split('T')[0]

      // ── CLOCK IN ──
      if (!this.isClockedIn) {
        this.gpsLoading = true
        try {
          await this.requestLocation()
        } catch (e) {
          this.gpsLoading = false
          return // stop if GPS denied / error
        }
        this.gpsLoading = false

        let attendance = JSON.parse(localStorage.getItem('attendance')) || []
        const existing = attendance.find(a => a.email === email && a.date === today)
        if (existing) {
          alert('You have already clocked in today.')
          return
        }

        const now = new Date()
        this.checkInTimestamp = Date.now()
        this.checkInTime = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })

        attendance.push({
          id: Date.now(),
          email,
          date: today,
          checkIn: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
          checkOut: '',
          hours: 0,
          status: 'Present',
          late: now.getHours() > 9,
          latitude: this.gpsLatitude,
          longitude: this.gpsLongitude,
          location: this.gpsCoords,
          note: '',
        })

        localStorage.setItem('attendance', JSON.stringify(attendance))
        this.isClockedIn = true
        this.loadAttendance()
        return
      }

      // ── CLOCK OUT ──
      let attendance = JSON.parse(localStorage.getItem('attendance')) || []
      const record = attendance.find(a => a.email === email && a.date === today)
      if (!record) {
        alert('No check-in record found for today.')
        return
      }

      const now = new Date()
      record.checkOut = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })

      // Calculate hours from timestamps
      const elapsed = this.checkInTimestamp
        ? (Date.now() - this.checkInTimestamp) / (1000 * 3600)
        : 0
      record.hours = parseFloat(elapsed.toFixed(2))
      record.status = record.late ? 'Late' : 'Present'

      localStorage.setItem('attendance', JSON.stringify(attendance))
      this.isClockedIn = false
      this.checkInTimestamp = null
      this.hoursWorked = 0
      this.loadAttendance()
    },

    checkIfClockedIn() {
      const email = sessionStorage.getItem('loggedInUser') || 'demo@gmail.com'
      const today = new Date().toISOString().split('T')[0]
      const attendance = JSON.parse(localStorage.getItem('attendance')) || []
      const record = attendance.find(a => a.email === email && a.date === today)
      if (record && record.checkIn && !record.checkOut) {
        this.isClockedIn = true
        this.checkInTime = record.checkIn
        // Approximate elapsed time
        const [timePart, period] = record.checkIn.split(' ')
        let [h, m] = timePart.split(':').map(Number)
        if (period === 'PM' && h !== 12) h += 12
        if (period === 'AM' && h === 12) h = 0
        const checkInMs = new Date().setHours(h, m, 0, 0)
        this.checkInTimestamp = checkInMs
        if (record.latitude) {
          this.gpsLatitude = record.latitude
          this.gpsLongitude = record.longitude
          this.gpsCoords = record.location || ''
          this.gpsStatus = 'verified'
        }
      }
    },

    loadAttendance() {
      const email = sessionStorage.getItem('loggedInUser') || 'demo@gmail.com'
      const data = JSON.parse(localStorage.getItem('attendance')) || []

      this.records = data
        .filter(a => a.email === email)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(a => {
          const d = new Date(a.date)
          return {
            id: a.id,
            rawDate: a.date,
            day: d.toLocaleDateString('en-IN', { weekday: 'short' }),
            date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
            checkIn: a.checkIn,
            checkOut: a.checkOut,
            hours: parseFloat(a.hours || 0).toFixed(1),
            status: a.checkOut
              ? (a.late ? 'Late' : 'Present')
              : (a.checkIn ? 'Working' : 'Absent'),
            late: a.late,
            location: a.location || '',
            note: a.late ? 'Late entry' : (a.note || ''),
          }
        })
    },
  },
}
</script>


<style scoped>
/* ── Base cards ───────────────────────────────────────── */
.card {
  background: #fff;
  border-radius: var(--r-xl);
  padding: 24px;
  border: 1px solid #e8ece4;
}
.card-eyebrow {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--stone);
  margin-bottom: 4px;
}
.card-title   { font-family: var(--font-serif); font-size: 17px; color: #1e261f; }
.card-head    { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; }

/* ── Stats row ────────────────────────────────────────── */
.stats-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
  margin-bottom: 20px;
}
@media (max-width: 900px) { .stats-row { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 580px) { .stats-row { grid-template-columns: repeat(2, 1fr); } }

.stat-card {
  background: #fff;
  border: 1px solid #e8ece4;
  border-radius: var(--r-lg);
  padding: 18px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  transition: box-shadow .18s;
}
.stat-card:hover { box-shadow: 0 4px 16px rgba(61,82,64,.08); }
.stat-featured  { background: var(--forest-dk) !important; border-color: var(--forest-dk); }
.stat-featured .stat-val { color: #a8e6b0 !important; }
.stat-featured .stat-lbl { color: rgba(255,255,255,.5) !important; }

.stat-icon {
  width: 34px; height: 34px;
  border-radius: var(--r-sm);
  display: flex; align-items: center; justify-content: center;
}
.stat-icon svg { width: 16px; height: 16px; }

.ic-green   { background: rgba(169,233,173,.3);  color: var(--forest-dk); }
.ic-peach   { background: rgba(255,207,193,.4);  color: #8a3525; }
.ic-amber   { background: rgba(240,208,128,.3);  color: #7a5800; }
.ic-stone   { background: rgba(117,120,114,.12); color: var(--stone); }
.ic-forest  { background: rgba(255,255,255,.1);  color: #a8e6b0; }

.stat-val { font-family: var(--font-serif); font-size: 26px; line-height: 1; }
.stat-lbl { font-size: 11px; color: var(--stone); }

/* ── Main two-col grid ────────────────────────────────── */
.att-main {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 20px;
  margin-bottom: 20px;
}
@media (max-width: 820px) { .att-main { grid-template-columns: 1fr; } }

/* ── Clock card ───────────────────────────────────────── */
.clock-card { display: flex; flex-direction: column; gap: 16px; }
.cc-head    { display: flex; justify-content: space-between; align-items: flex-start; }
.cc-time    { font-family: var(--font-serif); font-size: 28px; color: var(--forest-dk); }

.cc-badge           { font-size: 11px; font-weight: 600; padding: 5px 12px; border-radius: 20px; white-space: nowrap; }
.cc-badge.clocked   { background: rgba(169,233,173,.3); color: #2d5c32; }
.cc-badge.not-clocked { background: #f0f0ee; color: var(--stone); }

.cc-times {
  display: flex; align-items: center;
  background: #f8faf8; border-radius: var(--r-md); overflow: hidden;
}
.cc-time-row {
  flex: 1; display: flex; align-items: center; gap: 10px; padding: 14px 16px;
}
.cc-time-row svg { width: 15px; height: 15px; color: var(--stone); flex-shrink: 0; }
.cc-tl { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: .8px; color: var(--stone); }
.cc-tv { font-size: 14px; font-weight: 600; color: #1e261f; margin-top: 2px; }
.cc-time-divider { width: 1px; height: 40px; background: #e4e8e0; flex-shrink: 0; }

/* ── GPS bar ──────────────────────────────────────────── */
.gps-bar {
  display: flex; align-items: center; gap: 10px;
  padding: 11px 14px;
  border-radius: var(--r-md);
  border: 1px solid #e8ece4;
  background: #f8faf8;
  transition: background .2s, border-color .2s;
}
.gps-bar.gps-verified  { background: rgba(169,233,173,.15); border-color: rgba(169,233,173,.5); }
.gps-bar.gps-loading   { background: rgba(240,208,128,.1);  border-color: rgba(240,208,128,.4); }
.gps-bar.gps-denied,
.gps-bar.gps-error     { background: rgba(255,207,193,.15); border-color: rgba(255,150,130,.4); }

.gps-icon {
  width: 15px; height: 15px; flex-shrink: 0;
  color: var(--stone);
}
.gps-bar.gps-verified .gps-icon { color: #2d6e33; }
.gps-bar.gps-loading  .gps-icon { color: #7a5800; }
.gps-bar.gps-denied   .gps-icon,
.gps-bar.gps-error    .gps-icon { color: #8a3525; }

.gps-info { flex: 1; display: flex; flex-direction: column; gap: 1px; }
.gps-label  { font-size: 11px; font-weight: 500; color: var(--stone); }
.gps-coords { font-size: 10px; color: #7a9a7e; font-variant-numeric: tabular-nums; }
.gps-bar.gps-verified .gps-label { color: #2d6e33; }
.gps-bar.gps-denied .gps-label,
.gps-bar.gps-error  .gps-label   { color: #8a3525; }

/* GPS pulse animation */
.gps-dot-pulse { position: relative; width: 14px; height: 14px; flex-shrink: 0; }
.gps-pulse-dot {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%,-50%);
  width: 7px; height: 7px; border-radius: 50%;
  background: #3a7a42;
}
.gps-pulse-ring {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%,-50%);
  width: 14px; height: 14px; border-radius: 50%;
  background: rgba(58,122,66,.3);
  animation: gps-pulse 1.6s ease-out infinite;
}
@keyframes gps-pulse {
  0%   { transform: translate(-50%,-50%) scale(.6); opacity: 1; }
  100% { transform: translate(-50%,-50%) scale(1.8); opacity: 0; }
}

/* ── Clock In / Out buttons ───────────────────────────── */
.clock-btn {
  width: 100%; padding: 13px 0;
  border: none; border-radius: var(--r-md);
  font-size: 14px; font-weight: 600; font-family: var(--font-sans);
  cursor: pointer; transition: background .18s, opacity .18s, transform .12s;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.clock-btn:active { transform: scale(.98); }
.clock-btn:disabled { opacity: .65; cursor: not-allowed; }

/* Green Clock In */
.clock-btn-in {
  background: var(--forest-dk);
  color: #fff;
}
.clock-btn-in:hover:not(:disabled) { background: var(--forest); }

/* Outlined red-toned Clock Out */
.clock-btn-out {
  background: rgba(255,207,193,.25);
  color: #7a3325;
  border: 1px solid rgba(220,140,120,.5);
}
.clock-btn-out:hover:not(:disabled) { background: rgba(255,207,193,.45); }

/* spinner */
.btn-spinner {
  display: inline-block;
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin .65s linear infinite;
}
.clock-btn-out .btn-spinner {
  border-color: rgba(122,51,37,.3);
  border-top-color: #7a3325;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Work hours progress ──────────────────────────────── */
.cc-progress { }
.cc-prog-head {
  display: flex; justify-content: space-between;
  font-size: 12px; color: var(--stone); margin-bottom: 8px; font-weight: 500;
}
.cc-prog-bar  { height: 6px; background: #eef0ec; border-radius: 6px; overflow: hidden; }
.cc-prog-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--mint), var(--forest));
  border-radius: 6px;
  transition: width .4s ease;
}

/* ── Monthly heatmap ──────────────────────────────────── */
.month-legend { display: flex; gap: 14px; flex-wrap: wrap; }
.leg { display: flex; align-items: center; gap: 5px; font-size: 11px; color: var(--stone); }
.ldot { width: 10px; height: 10px; border-radius: 3px; }
.ldot.present { background: var(--mint); }
.ldot.absent  { background: var(--peach); }
.ldot.late    { background: #f0d080; }
.ldot.leave   { background: #d0d4ce; }

.hm-days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin-bottom: 4px; }
.hm-dl   {
  font-size: 10px; font-weight: 600; color: #b0b5ae;
  text-align: center; text-transform: uppercase; letter-spacing: .5px;
}
.hm-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
.hm-cell {
  height: 28px; border-radius: 5px; background: #f0f0ee;
  cursor: pointer; transition: transform .15s;
}
.hm-cell:hover { transform: scale(1.1); }
.hm-cell.present { background: var(--mint); }
.hm-cell.absent  { background: var(--peach); }
.hm-cell.late    { background: #f0d080; }
.hm-cell.leave   { background: #d0d4ce; }
.hm-cell.weekend { background: #f5f5f2; }
.hm-cell.working { background: rgba(169,233,173,.5); }
.hm-cell.today   { outline: 2px solid var(--forest); outline-offset: 1px; }

.month-stats {
  display: flex; border-top: 1px solid #eef0ec;
  padding-top: 16px; margin-top: 16px;
}
.ms { flex: 1; text-align: center; }
.ms + .ms { border-left: 1px solid #eef0ec; }
.ms-val { font-family: var(--font-serif); font-size: 20px; margin-bottom: 3px; }
.ms-lbl { font-size: 10.5px; color: var(--stone); }

/* ── Records table ────────────────────────────────────── */
.records-card { margin-top: 0; }

/* Filter buttons — green active state */
.rec-filters { display: flex; gap: 4px; flex-wrap: wrap; }
.rfbtn {
  padding: 5px 14px; border-radius: 20px;
  border: 1px solid #e4e8e0;
  background: transparent;
  font-size: 12px; font-weight: 500; color: var(--stone);
  cursor: pointer; font-family: var(--font-sans); transition: all .18s;
}
.rfbtn:hover { background: #f0f5f0; color: var(--forest); border-color: #c4d8c6; }
.rfbtn.active {
  background: var(--forest-dk);
  color: #fff;
  border-color: var(--forest-dk);
}

.rec-table-wrap { overflow-x: auto; margin-top: 16px; }
.rec-table { width: 100%; border-collapse: collapse; }
.rec-table thead th {
  padding: 10px 16px; text-align: left;
  font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .6px;
  color: var(--stone); background: #f8faf8; border-bottom: 1px solid #eef0ec;
}
.rec-table tbody tr { border-bottom: 1px solid #eef0ec; transition: background .15s; }
.rec-table tbody tr:last-child { border-bottom: none; }
.rec-table tbody tr:hover { background: #f8faf8; }
.rec-table td { padding: 12px 16px; }

.rt-date { display: flex; flex-direction: column; }
.rt-day     { font-size: 12px; font-weight: 700; color: #1e261f; }
.rt-datelbl { font-size: 11px; color: var(--stone); }

.rt-time      { font-size: 13px; font-weight: 500; color: #4a5a4b; }
.rt-time.late { color: #b07020; }

.rt-hours { font-size: 12px; font-weight: 700; padding: 2px 9px; border-radius: 20px; }
.rt-hours.good { background: rgba(169,233,173,.3); color: #2d5c32; }
.rt-hours.half { background: rgba(240,208,128,.3); color: #8a6020; }
.rt-hours.zero { background: #f0f0ee; color: var(--stone); }

.rt-status { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; }
.s-present { background: rgba(169,233,173,.3); color: #2d5c32; }
.s-working { background: rgba(169,233,173,.2); color: #2d5c32; }
.s-late    { background: rgba(240,208,128,.3); color: #8a6020; }
.s-absent  { background: rgba(255,207,193,.4); color: #8a3525; }
.s-leave   { background: #f0f0ee; color: var(--stone); }

.rt-location { min-width: 130px; }
.loc-badge {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 11px; color: #2d6e33;
  background: rgba(169,233,173,.2);
  padding: 2px 8px; border-radius: 20px;
}
.loc-none { font-size: 12px; color: #b0b5ae; }

.rt-note { font-size: 12px; color: #b0b5ae; }
.empty-row { text-align: center; font-size: 13px; color: var(--stone); padding: 32px 0; }
</style>