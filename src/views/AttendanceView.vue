<template>
  <AdminLayout page-title="Attendance" add-label="Mark Attendance" @add="showMarkModal = true">

    <!-- Filter Bar -->
    <div class="filter-bar">
      <div class="filter-tabs">
        <button v-for="t in tabs" :key="t" class="ftab" :class="{ active: activeTab === t }" @click="activeTab = t">{{ t }}</button>
      </div>
      <div class="filter-right">
        <input type="date" class="fdate" v-model="selectedDate">
        <select class="fselect" v-model="deptFilter">
          <option value="">All Departments</option>
          <option v-for="d in departments" :key="d">{{ d }}</option>
        </select>
        <button class="export-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export
        </button>
      </div>
    </div>

    <!-- KPI Strip -->
    <div class="kpi-strip">
      <div class="kpi" v-for="k in kpis" :key="k.label">
        <div class="kpi-ico" :style="{ background: k.bg }">
          <svg viewBox="0 0 24 24" fill="none" :stroke="k.stroke" stroke-width="1.8" v-html="k.icon"></svg>
        </div>
        <div class="kpi-right">
          <div class="kpi-val">{{ k.value }}</div>
          <div class="kpi-lbl">{{ k.label }}</div>
        </div>
        <div class="kpi-trend" :class="k.trendCls">{{ k.trend }}</div>
      </div>
    </div>

    <!-- Main grid: table + sidebar -->
    <div class="att-grid">

      <!-- Attendance Table -->
      <div class="card">
        <div class="card-hd">
          <div>
            <div class="card-title">Daily Attendance — {{ formattedDate }}</div>
            <div class="card-sub">{{ filtered.length }} records · {{ presentCount }} present · {{ absentCount }} absent</div>
          </div>
          <div class="hd-actions">
            <button class="hd-btn" @click="viewMode = 'table'" :class="{ active: viewMode === 'table' }">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            </button>
            <button class="hd-btn" @click="viewMode = 'list'" :class="{ active: viewMode === 'list' }">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            </button>
          </div>
        </div>

        <table class="att-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Hours</th>
              <th>Status</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="rec in filtered" :key="rec.id">
              <td>
                <div class="emp-cell">
                  <div class="emp-av" :style="{ background: rec.color }">{{ rec.initials }}</div>
                  <div>
                    <div class="emp-name">{{ rec.name }}</div>
                    <div class="emp-id">EMP-{{ String(rec.id).padStart(3,'0') }}</div>
                  </div>
                </div>
              </td>
              <td><span class="dept-tag">{{ rec.department }}</span></td>
              <td class="tc time" :class="{ late: rec.late }">{{ rec.checkIn || '—' }}</td>
              <td class="tc time">{{ rec.checkOut || '—' }}</td>
              <td class="tc">
                <span class="hours-badge" :class="hoursClass(rec.hours)">{{ rec.hours ? rec.hours + 'h' : '—' }}</span>
              </td>
              <td><span class="status-chip" :class="statusClass(rec.status)">{{ rec.status }}</span></td>
              <td class="tc note">{{ rec.note || '—' }}</td>
            </tr>
          </tbody>
        </table>

        <div class="table-foot">
          <span class="tf-info">Showing {{ filtered.length }} of {{ attendance.length }} records</span>
          <div class="pagination">
            <button class="pg">‹</button>
            <button class="pg active">1</button>
            <button class="pg">›</button>
          </div>
        </div>
      </div>

      <!-- Right sidebar -->
      <div class="right-col">

        <!-- Today's Summary Donut -->
        <div class="card summary-card">
          <div class="card-hd" style="padding-bottom:16px">
            <div class="card-title">Today's Summary</div>
          </div>
          <div class="donut-wrap">
            <svg viewBox="0 0 120 120" class="donut">
              <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border)" stroke-width="14"/>
              <circle cx="60" cy="60" r="50" fill="none" stroke="var(--mint)" stroke-width="14"
                stroke-dasharray="188 314" stroke-dashoffset="78.5" stroke-linecap="round"/>
              <circle cx="60" cy="60" r="50" fill="none" stroke="var(--peach)" stroke-width="14"
                stroke-dasharray="19 314" stroke-dashoffset="-109.5" stroke-linecap="round"/>
              <circle cx="60" cy="60" r="50" fill="none" stroke="var(--stone-dim)" stroke-width="14"
                stroke-dasharray="19 314" stroke-dashoffset="-128.5" stroke-linecap="round"/>
              <text x="60" y="55" text-anchor="middle" font-size="20" font-weight="700" fill="var(--text-1)" font-family="Lora,serif">47</text>
              <text x="60" y="72" text-anchor="middle" font-size="9" fill="var(--text-3)" font-family="Outfit,sans-serif">of 50</text>
            </svg>
            <div class="donut-legend">
              <div class="dl"><span class="dl-dot" style="background:var(--mint)"></span><span class="dl-lbl">Present</span><strong>47</strong></div>
              <div class="dl"><span class="dl-dot" style="background:var(--peach)"></span><span class="dl-lbl">Absent</span><strong>2</strong></div>
              <div class="dl"><span class="dl-dot" style="background:var(--stone-dim)"></span><span class="dl-lbl">On Leave</span><strong>1</strong></div>
            </div>
          </div>
        </div>

        <!-- Late Arrivals -->
        <div class="card">
          <div class="card-hd">
            <div class="card-title">Late Arrivals</div>
            <span class="count-badge">{{ lateArrivals.length }}</span>
          </div>
          <div class="mini-list">
            <div class="mini-row" v-for="l in lateArrivals" :key="l.name">
              <div class="mini-av" :style="{ background: l.color }">{{ l.initials }}</div>
              <div class="mini-info">
                <div class="mini-name">{{ l.name }}</div>
                <div class="mini-sub">{{ l.department }}</div>
              </div>
              <div class="mini-time late">{{ l.checkIn }}</div>
            </div>
          </div>
        </div>

        <!-- Absent Today -->
        <div class="card">
          <div class="card-hd">
            <div class="card-title">Absent Today</div>
            <span class="count-badge warn">{{ absentList.length }}</span>
          </div>
          <div class="mini-list">
            <div class="mini-row" v-for="a in absentList" :key="a.name">
              <div class="mini-av" :style="{ background: a.color }">{{ a.initials }}</div>
              <div class="mini-info">
                <div class="mini-name">{{ a.name }}</div>
                <div class="mini-sub">{{ a.department }}</div>
              </div>
              <span class="mini-badge" :class="a.cls">{{ a.reason }}</span>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Monthly Overview -->
    <div class="card monthly-card">
      <div class="card-hd">
        <div>
          <div class="card-title">Monthly Attendance Overview — March 2026</div>
          <div class="card-sub">Daily presence across the organization</div>
        </div>
        <button class="card-link">Download Report →</button>
      </div>
      <div class="monthly-chart">
        <div class="mc-col" v-for="(d, i) in monthlyData" :key="i">
          <div class="mc-bar-wrap">
            <div class="mc-bar"
              :style="{ height: d.pct + '%', background: d.pct >= 90 ? 'var(--mint)' : d.pct >= 75 ? 'var(--forest)' : 'var(--peach)' }"
              :title="`Day ${i+1}: ${d.pct}% present`">
            </div>
          </div>
          <div class="mc-lbl">{{ i + 1 }}</div>
        </div>
      </div>
      <div class="monthly-legend">
        <span class="ml-item"><span class="ml-dot" style="background:var(--mint)"></span> ≥ 90% Present</span>
        <span class="ml-item"><span class="ml-dot" style="background:var(--forest)"></span> 75–90%</span>
        <span class="ml-item"><span class="ml-dot" style="background:var(--peach)"></span> Below 75%</span>
      </div>
    </div>

    <!-- Mark Attendance Modal -->
    <div class="modal-overlay" v-if="showMarkModal" @click.self="showMarkModal = false">
      <div class="modal">
        <div class="modal-hd">
          <div class="modal-title">Mark Attendance</div>
          <button class="modal-close" @click="showMarkModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="mfield"><label>Employee</label>
            <select v-model="mark.employee">
                    <option disabled value="">Select Employee</option>

                    <option 
                      v-for="e in employees" 
                      :key="e.id" 
                      :value="e.email"
                    >
                      {{ e.firstName }} {{ e.lastName }}
                    </option>
            </select>
          </div>
          <div class="mform-row">
            <div class="mfield"><label>Date</label><input type="date" v-model="mark.date"></div>
            <div class="mfield"><label>Status</label>
              <select v-model="mark.status"><option>Present</option><option>Absent</option><option>Half Day</option><option>On Leave</option></select>
            </div>
          </div>
          <div class="mform-row">
            <div class="mfield"><label>Check In</label><input type="time" v-model="mark.checkIn"></div>
            <div class="mfield"><label>Check Out</label><input type="time" v-model="mark.checkOut"></div>
          </div>
          <div class="mfield"><label>Note (optional)</label><input type="text" v-model="mark.note" placeholder="e.g. Working from home"></div>
        </div>
        <div class="modal-ft">
          <button class="btn-cancel" @click="showMarkModal = false">Cancel</button>
          <button class="btn-save" @click="saveAttendance">
              ✔ Save Record
          </button>
        </div>
      </div>
    </div>

  </AdminLayout>
</template>

<script>
import AdminLayout from '../components/AdminLayout.vue'

export default {
  name: 'AttendanceView',
  components: { AdminLayout },

  data() {
    return {
      activeTab: 'All',
      viewMode: 'table',
      selectedDate: new Date().toISOString().split('T')[0],
      deptFilter: '',
      showMarkModal: false,

      tabs: ['All', 'Present', 'Absent', 'Late', 'On Leave', 'Half Day'],
      departments: ['Engineering', 'Design', 'Marketing', 'Finance', 'HR & Admin', 'Sales'],

      mark: {
        employee: '',
        date: '',
        status: 'Present',
        checkIn: '',
        checkOut: '',
        note: ''
      },

      attendance: [],
      employees: [],

      kpis: [
        { label:'Present Today', value:'47', trend:'↑ 94%', trendCls:'t-up', bg:'var(--mint-ghost)', stroke:'var(--forest-deep)', icon:'<path d="M9 11l3 3L22 4"/>' },
        { label:'Absent', value:'2', trend:'↓ 4%', trendCls:'t-down', bg:'var(--peach-dim)', stroke:'#a03020', icon:'<circle cx="12" cy="12" r="10"/>' },
        { label:'Late Arrivals', value:'4', trend:'8%', trendCls:'t-warn', bg:'#fef9ec', stroke:'#9c6f0c', icon:'<circle cx="12" cy="12" r="10"/>' },
        { label:'On Leave', value:'1', trend:'Approved', trendCls:'t-neu', bg:'rgba(101,125,101,.1)', stroke:'var(--forest)', icon:'<path d="M20 12"/>' },
        { label:'Avg. Hours/Day', value:'8.2', trend:'On track', trendCls:'t-up', bg:'var(--stone-dim)', stroke:'var(--stone)', icon:'<polyline points="22 12 18 12"/>' }
      ],

      monthlyData: Array.from({ length: 30 }, () => ({ pct: Math.floor(Math.random() * 30) + 70 }))
    }
  },

  mounted() {
  this.employees = JSON.parse(localStorage.getItem('hrms_employees')) || [];
  const attendance = JSON.parse(localStorage.getItem('attendance')) || [];

  const today = new Date().toISOString().split('T')[0];

  this.attendance = this.employees.map(emp => {
    const att = attendance.find(a =>
      a.employeeEmail === emp.email && a.date === today
    );

    return {
      id: emp.id,
      name: (emp.firstName || '') + " " + (emp.lastName || ''),
      email: emp.email,
      department: emp.dept || "General",

      checkIn: att ? att.checkIn : "",
      checkOut: att ? att.checkOut : "",
      hours: att ? att.hours : "",

      status: att ? "Present" : "Absent",
      late: att ? att.late : false,
      note: att ? att.note : "",

      initials: ((emp.firstName || 'A')[0] + (emp.lastName || 'A')[0]).toUpperCase(),
      color: "#4CAF50"
    };
  });
},
  computed: {
    formattedDate() {
      const d = new Date(this.selectedDate)
      return d.toLocaleDateString('en-IN', {
        weekday:'long', day:'numeric', month:'long', year:'numeric'
      })
    },

    filtered() {
      return this.attendance.filter(r => {
        const tab = this.activeTab === 'All' || r.status === this.activeTab
        const dept = !this.deptFilter || r.department === this.deptFilter
        return tab && dept
      })
    },

    presentCount() {
      return this.attendance.filter(r =>
        ['Present','Late','Half Day'].includes(r.status)
      ).length
    },

    absentCount() {
      return this.attendance.filter(r => r.status === 'Absent').length
    },

    lateArrivals() {
      return this.attendance.filter(r => r.late)
    },

    absentList() {
      return this.attendance
        .filter(e => e.status === 'Absent' || e.status === 'On Leave')
        .map(e => ({
          name: e.name,
          initials: e.initials,
          department: e.department,
          color: e.color,
          reason: e.status,
          cls: e.status === 'On Leave' ? 'r-leave' : 'r-warn'
        }))
    }
  },

  methods: {
    statusClass(s) {
      return {
        'Present':'sc-present',
        'Absent':'sc-absent',
        'Late':'sc-late',
        'On Leave':'sc-leave',
        'Half Day':'sc-half'
      }[s] || ''
    },

    hoursClass(h) {
      return h >= 8 ? 'h-good' : h >= 4 ? 'h-half' : 'h-low'
    },

    saveAttendance() {
  const attendance = JSON.parse(localStorage.getItem('attendance')) || [];

  attendance.push({
    employeeEmail: this.mark.employee,
    date: this.mark.date || new Date().toISOString().split('T')[0],
    checkIn: this.mark.checkIn,
    checkOut: this.mark.checkOut,
    note: this.mark.note,
    status: this.mark.status,
    late: this.mark.checkIn > '09:30'
  });

  localStorage.setItem('attendance', JSON.stringify(attendance));

  this.showMarkModal = false;

  // reload UI
  this.mounted();

  this.mark = {
    employee: '',
    date: '',
    status: 'Present',
    checkIn: '',
    checkOut: '',
    note: ''
  };
}
  }
}
</script>

<style scoped>
.filter-bar { display:flex; align-items:center; justify-content:space-between; margin-bottom:18px; flex-wrap:wrap; gap:12px; }
.filter-tabs { display:flex; gap:4px; background:var(--bg-card); border:1px solid var(--border); border-radius:var(--r-sm); padding:4px; }
.ftab { padding:6px 14px; border-radius:var(--r-xs); border:none; background:transparent; font-size:13px; font-weight:500; color:var(--text-3); cursor:pointer; transition:all .18s; }
.ftab.active { background:var(--forest-ink); color:#fff; font-weight:600; }
.filter-right { display:flex; align-items:center; gap:10px; }
.fdate,.fselect { border:1px solid var(--border); background:var(--bg-card); border-radius:var(--r-sm); padding:8px 12px; font-size:13px; font-family:inherit; color:var(--text-1); outline:none; cursor:pointer; }
.export-btn { display:flex; align-items:center; gap:7px; background:var(--bg-card); border:1px solid var(--border); border-radius:var(--r-sm); padding:8px 14px; font-size:13px; font-weight:500; color:var(--text-2); cursor:pointer; transition:all .18s; }
.export-btn:hover { background:var(--stone-ghost); }
.export-btn svg { width:14px; height:14px; }

.kpi-strip { display:grid; grid-template-columns:repeat(5,1fr); gap:12px; margin-bottom:20px; }
.kpi { background:var(--bg-card); border:1px solid var(--border); border-radius:var(--r-md); padding:16px 18px; display:flex; align-items:center; gap:12px; box-shadow:var(--shadow-xs); }
.kpi-ico { width:38px; height:38px; border-radius:var(--r-sm); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.kpi-ico svg { width:17px; height:17px; }
.kpi-right { flex:1; }
.kpi-val { font-family:'Lora',serif; font-size:22px; font-weight:600; color:var(--text-1); line-height:1; }
.kpi-lbl { font-size:11px; color:var(--text-3); margin-top:2px; }
.kpi-trend { font-size:10.5px; font-weight:700; padding:2px 8px; border-radius:20px; white-space:nowrap; }
.t-up   { background:var(--mint-ghost); color:var(--forest-deep); }
.t-down { background:var(--peach-dim);  color:#a03020; }
.t-warn { background:#fef9ec; color:#9c6f0c; }
.t-neu  { background:var(--stone-dim);  color:var(--stone); }

.att-grid { display:grid; grid-template-columns:1fr 280px; gap:18px; margin-bottom:18px; }
.card { background:var(--bg-card); border:1px solid var(--border); border-radius:var(--r-lg); box-shadow:var(--shadow-xs); overflow:hidden; }
.card-hd { padding:20px 22px 14px; display:flex; align-items:flex-start; justify-content:space-between; }
.card-title { font-family:'Lora',serif; font-size:15px; font-weight:600; color:var(--text-1); }
.card-sub   { font-size:11.5px; color:var(--text-3); margin-top:2px; }
.card-link  { font-size:12px; font-weight:600; color:var(--forest); background:none; border:none; cursor:pointer; }
.hd-actions { display:flex; gap:6px; }
.hd-btn { width:30px; height:30px; border:1px solid var(--border); background:var(--bg-card); border-radius:var(--r-xs); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all .18s; }
.hd-btn svg { width:14px; height:14px; color:var(--text-3); }
.hd-btn.active { background:var(--forest-ink); border-color:var(--forest-ink); }
.hd-btn.active svg { color:#fff; }

.att-table { width:100%; border-collapse:collapse; }
.att-table thead th { padding:10px 16px; background:var(--stone-ghost); font-size:11px; font-weight:700; color:var(--text-3); text-align:left; letter-spacing:.5px; text-transform:uppercase; border-bottom:1px solid var(--border); }
.att-table tbody tr { border-bottom:1px solid var(--border); transition:background .15s; }
.att-table tbody tr:last-child { border-bottom:none; }
.att-table tbody tr:hover { background:var(--stone-ghost); }
.att-table td { padding:12px 16px; }

.emp-cell { display:flex; align-items:center; gap:10px; }
.emp-av { width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:#fff; flex-shrink:0; }
.emp-name { font-size:13px; font-weight:600; color:var(--text-1); }
.emp-id   { font-size:10.5px; color:var(--text-3); }
.dept-tag { font-size:11px; font-weight:500; color:var(--text-2); background:var(--stone-ghost); padding:2px 8px; border-radius:20px; }
.tc { font-size:13px; color:var(--text-2); }
.time { font-weight:600; }
.time.late { color:#9c6f0c; }
.note { color:var(--text-3); font-size:12px; }

.hours-badge { font-size:11.5px; font-weight:700; padding:2px 9px; border-radius:20px; }
.h-good { background:var(--mint-ghost); color:var(--forest-deep); }
.h-half { background:#fef9ec; color:#9c6f0c; }
.h-low  { background:var(--stone-dim); color:var(--stone); }

.status-chip { font-size:11px; font-weight:700; padding:3px 10px; border-radius:20px; }
.sc-present { background:var(--mint-ghost); color:var(--forest-deep); }
.sc-absent  { background:var(--peach-dim);  color:#a03020; }
.sc-late    { background:#fef9ec; color:#9c6f0c; }
.sc-leave   { background:rgba(101,125,101,.1); color:var(--forest); }
.sc-half    { background:var(--stone-dim); color:var(--stone); }

.table-foot { display:flex; align-items:center; justify-content:space-between; padding:12px 18px; border-top:1px solid var(--border); }
.tf-info { font-size:12px; color:var(--text-3); }
.pagination { display:flex; gap:4px; }
.pg { width:28px; height:28px; border-radius:var(--r-xs); border:1px solid var(--border); background:var(--bg-card); font-size:12.5px; font-weight:500; color:var(--text-2); cursor:pointer; }
.pg.active { background:var(--forest-ink); color:#fff; border-color:var(--forest-ink); }

/* Right col */
.right-col { display:flex; flex-direction:column; gap:14px; }
.count-badge { font-size:11px; font-weight:700; padding:2px 9px; border-radius:20px; background:var(--mint-ghost); color:var(--forest-deep); }
.count-badge.warn { background:var(--peach-dim); color:#a03020; }

.summary-card .card-hd { padding-bottom:8px; }
.donut-wrap { display:flex; flex-direction:column; align-items:center; padding:0 22px 20px; }
.donut { width:130px; height:130px; transform:rotate(-90deg); margin-bottom:16px; }
.donut text { transform:rotate(90deg); transform-origin:60px 60px; }
.donut-legend { width:100%; display:flex; flex-direction:column; gap:8px; }
.dl { display:flex; align-items:center; gap:8px; font-size:12.5px; }
.dl-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
.dl-lbl { flex:1; color:var(--text-2); }
.dl strong { color:var(--text-1); font-weight:700; }

.mini-list { padding:0 22px 16px; display:flex; flex-direction:column; }
.mini-row { display:flex; align-items:center; gap:10px; padding:9px 0; border-bottom:1px solid var(--border); }
.mini-row:last-child { border-bottom:none; }
.mini-av { width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:#fff; flex-shrink:0; }
.mini-name { font-size:12.5px; font-weight:600; color:var(--text-1); }
.mini-sub  { font-size:11px; color:var(--text-3); }
.mini-time { font-size:12px; font-weight:600; color:#9c6f0c; }
.mini-time.late { color:#c05020; }
.mini-badge { font-size:10.5px; font-weight:700; padding:2px 8px; border-radius:20px; }
.r-warn  { background:var(--peach-dim); color:#a03020; }
.r-leave { background:var(--stone-dim); color:var(--stone); }

/* Monthly */
.monthly-card { margin-top:0; }
.monthly-chart { display:flex; align-items:flex-end; gap:4px; height:100px; padding:14px 22px 0; }
.mc-col { flex:1; display:flex; flex-direction:column; align-items:center; gap:3px; height:100%; }
.mc-bar-wrap { flex:1; display:flex; align-items:flex-end; width:100%; }
.mc-bar { width:100%; border-radius:3px 3px 0 0; min-height:3px; transition:height .4s ease; cursor:pointer; }
.mc-bar:hover { opacity:.8; }
.mc-lbl { font-size:9px; color:var(--text-3); }
.monthly-legend { display:flex; gap:20px; padding:10px 22px 18px; border-top:1px solid var(--border); margin-top:12px; }
.ml-item { display:flex; align-items:center; gap:7px; font-size:12px; color:var(--text-3); }
.ml-dot { width:10px; height:10px; border-radius:50%; }

/* Modal */
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.4); z-index:500; display:flex; align-items:center; justify-content:center; }
.modal { background:var(--bg-card); border-radius:var(--r-lg); width:500px; max-width:95vw; }
.modal-hd { display:flex; align-items:center; justify-content:space-between; padding:22px 24px 0; }
.modal-title { font-family:'Lora',serif; font-size:18px; font-weight:600; color:var(--text-1); }
.modal-close { background:none; border:none; font-size:16px; color:var(--text-3); cursor:pointer; width:30px; height:30px; border-radius:50%; }
.modal-close:hover { background:var(--stone-ghost); }
.modal-body { padding:24px; }
.mform-row { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
.mfield { margin-bottom:16px; }
.mfield label { display:block; font-size:12px; font-weight:600; color:var(--text-2); margin-bottom:6px; }
.mfield input, .mfield select { width:100%; border:1px solid var(--border); background:var(--bg-card); border-radius:var(--r-sm); padding:9px 13px; font-size:13px; font-family:inherit; color:var(--text-1); outline:none; }
.mfield input:focus, .mfield select:focus { border-color:var(--mint-mid); }
.modal-ft { display:flex; justify-content:flex-end; gap:10px; padding:0 24px 22px; }
.btn-cancel { padding:9px 20px; border:1px solid var(--border); background:var(--bg-card); border-radius:var(--r-sm); font-size:13px; font-weight:600; color:var(--text-2); cursor:pointer; }
.btn-save { padding:9px 20px; background:var(--forest-ink); color:#fff; border:none; border-radius:var(--r-sm); font-size:13px; font-weight:600; cursor:pointer; }
.btn-save:hover { background:var(--forest-deep); }

/* Responsive Design */
@media (max-width: 1024px) {
  .kpi-strip { grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }
  .att-grid { grid-template-columns: 1fr 250px; gap: 14px; }
}

@media (max-width: 768px) {
  .filter-bar { flex-direction: column; align-items: stretch; }
  .filter-tabs {
    overflow-x: auto;
    white-space: nowrap;
    width: 100%;
  }
  .ftab { flex: 0 0 auto; }
  .filter-right { justify-content: space-between; width: 100%; flex-wrap: wrap; }
  .fdate, .fselect, .export-btn { width: 100%; }
  .kpi-strip { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .kpi { padding: 12px 14px; }
  .kpi-val { font-size: 18px; }
  .att-grid { grid-template-columns: 1fr; gap: 14px; }
  .card-hd { padding: 16px 18px 12px; }
  .card-title { font-size: 14px; }
  .att-table { font-size: 12px; min-width: 700px; }
  .card { overflow-x: auto; }
  .att-table thead th, .att-table td { padding: 8px 12px; }
  .emp-cell { gap: 8px; }
  .emp-av { width: 28px; height: 28px; font-size: 10px; }
  .emp-name { font-size: 12px; }
  .emp-id { font-size: 9px; }
  .monthly-chart { height: 80px; padding: 10px 18px 0; }
  .mc-lbl { font-size: 8px; }
  .modal { width: 90vw; max-width: 400px; }
  .modal-body { padding: 18px; }
  .mform-row { grid-template-columns: 1fr; gap: 12px; }
}

@media (max-width: 480px) {
  .kpi-strip { grid-template-columns: 1fr; }
  .kpi { padding: 10px 12px; gap: 10px; }
  .kpi-ico { width: 32px; height: 32px; }
  .kpi-ico svg { width: 14px; height: 14px; }
  .kpi-val { font-size: 16px; }
  .kpi-lbl { font-size: 10px; }
  .kpi-trend { font-size: 9px; padding: 1px 6px; }
  .filter-tabs { flex-wrap: wrap; }
  .ftab { padding: 5px 10px; font-size: 12px; }
  .filter-right { flex-direction: column; gap: 8px; }
  .fdate, .fselect { width: 100%; }
  .export-btn { width: 100%; justify-content: center; }
  .att-table { min-width: 640px; }
  .table-foot { flex-direction: column; gap: 10px; align-items: center; }
  .donut { width: 100px; height: 100px; }
  .donut text { font-size: 16px; }
  .donut-legend { gap: 6px; }
  .dl { font-size: 11px; }
  .mini-list { padding: 0 18px 12px; }
  .mini-row { padding: 8px 0; gap: 8px; }
  .mini-av { width: 26px; height: 26px; font-size: 9px; }
  .mini-name { font-size: 11px; }
  .mini-sub { font-size: 10px; }
  .monthly-legend { flex-direction: column; gap: 8px; padding: 8px 18px 14px; }
  .ml-item { font-size: 11px; }
}
</style>
