<template>
  <UserLayout page-title="Leave Management" page-sub="Balance your workflow and wellness with ease." search-placeholder="Search resources…">

    <!-- Leave Balance Cards -->
    <div class="balance-row">
      <div v-for="b in balanceCards" :key="b.type" class="bal-card" :class="{ 'bal-featured': b.featured }">
        <div class="bal-type">{{ b.type }}</div>
        <div class="bal-num">{{ b.used }}</div>
        <div class="bal-total">/ {{ b.total }} days</div>
        <div class="bal-bar-wrap">
          <div class="bal-bar" :style="{ width: (b.used / b.total * 100) + '%', background: b.barColor }"></div>
        </div>
        <div class="bal-rem">{{ b.total - b.used }} days remaining</div>
      </div>
    </div>

    <!-- Main grid: Calendar + Request Form -->
    <div class="leave-main">

      <!-- Mini Calendar -->
      <div class="card cal-card">
        <div class="card-head">
          <div class="cal-nav">
            <button class="cn-btn" @click="prevMonth">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <div class="cal-month">{{ monthLabel }}</div>
            <button class="cn-btn" @click="nextMonth">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
        <!-- Day labels -->
        <div class="cal-days">
          <span v-for="d in ['SUN','MON','TUE','WED','THU','FRI','SAT']" :key="d" class="cal-dl">{{ d }}</span>
        </div>
        <!-- Cells -->
        <div class="cal-grid">
          <div v-for="(cell, i) in calCells" :key="i"
            class="cal-cell"
            :class="{
              'other': !cell.currentMonth,
              'today': cell.isToday,
              'selected': cell.date === selectedDate,
              'has-leave': cell.leaveType,
            }"
            @click="cell.currentMonth && (selectedDate = cell.date)">
            <span class="cell-num">{{ cell.day }}</span>
            <span v-if="cell.leaveType" class="cell-leave-dot" :class="'dot-' + cell.leaveType"></span>
          </div>
        </div>
        <!-- Legend -->
        <div class="cal-legend">
          <span class="cl-item"><span class="cl-dot annual"></span>Annual Leave</span>
          <span class="cl-item"><span class="cl-dot sick"></span>Sick Leave</span>
          <span class="cl-item"><span class="cl-dot other"></span>Other</span>
        </div>
      </div>

      <!-- Request Form -->
      <div class="card req-card">
        <div class="req-title">Request Leave</div>

        <div class="rf-field">
          <label>Leave Type</label>
          <div class="rf-select-wrap">
            <select v-model="form.type" class="rf-select">
              <option v-for="t in leaveTypes" :key="t">{{ t }}</option>
            </select>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>

        <div class="rf-row">
          <div class="rf-field">
            <label>From</label>
            <input type="date" v-model="form.from" class="rf-input"/>
          </div>
          <div class="rf-field">
            <label>To</label>
            <input type="date" v-model="form.to" class="rf-input"/>
          </div>
        </div>

        <div class="rf-field">
          <label>Reason (Optional)</label>
          <textarea v-model="form.reason" class="rf-textarea" placeholder="Brief explanation…" rows="3"></textarea>
        </div>

        <div class="rf-days" v-if="daysRequested > 0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          {{ daysRequested }} working day{{ daysRequested !== 1 ? 's' : '' }} requested
        </div>

        <button class="rf-submit" @click="submitRequest" :class="{ submitting }">
          <span v-if="!submitting">Submit Request</span>
          <span v-else class="rf-spinner"></span>
        </button>

        <!-- Success toast -->
        <div class="rf-success" v-if="showSuccess">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Request submitted successfully!
        </div>
      </div>
    </div>

    <!-- My Requests -->
    <div class="card requests-card">
      <div class="card-head" style="margin-bottom:0">
        <div class="card-title">My Requests</div>
        <button class="card-link">View History →</button>
      </div>
      <div class="req-table-wrap">
        <table class="req-table">
          <thead>
            <tr>
              <th>Leave Type</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Approver</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in myRequests" :key="r.id">
              <td>
                <span class="rt-type" :class="'rt-' + r.type.toLowerCase().replace(' ', '')">{{ r.type }}</span>
              </td>
              <td class="rt-dur">{{ r.duration }}</td>
              <td><span class="rt-status" :class="'rs-' + r.status.toLowerCase()">{{ r.status }}</span></td>
              <td>
                <div class="rt-approver">
                  <div class="app-av" :style="{ background: r.appColor }">{{ r.appInitials }}</div>
                  {{ r.approver }}
                </div>
              </td>
              <td>
                <button class="rt-action">···</button>
              </td>
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
  name: 'LeaveView',
  components: { UserLayout },
  data() {
    const today = new Date()
    return {
      today,
      currentYear: today.getFullYear(),
      currentMonth: today.getMonth(),
      selectedDate: today.toISOString().split('T')[0],
      form: { type: 'Annual Leave', from: '', to: '', reason: '' },
      submitting: false,
      showSuccess: false,
      leaveTypes: ['Annual Leave', 'Sick Leave', 'Privilege Leave', 'Maternity Leave', 'Paternity Leave', 'Unpaid Leave'],
      balanceCards: [
        { type: 'Annual Leave', used: 12, total: 24, featured: false, barColor: '#657D65', },
        { type: 'Sick Leave',   used: 4,  total: 8,  featured: true,  barColor: '#A9E9AD', },
        { type: 'Unpaid Leave', used: 2,  total: 10, featured: false, barColor: '#FFCFC1', },
      ],
      // Leave events on calendar: date → type
      leaveEvents: {
        '2026-04-10': 'annual',
        '2026-04-11': 'annual',
        '2026-04-15': 'other',
      },
      myRequests: [
        { id: 1, type: 'Annual Leave', duration: 'Sep 05 – Sep 06 (2 Days)', status: 'Approved',  approver: 'Alex Morgan', appInitials: 'AM', appColor: '#A9E9AD' },
        { id: 2, type: 'Sick Leave',   duration: 'Aug 12 – Aug 12 (1 Day)',  status: 'Completed', approver: 'Sarah Kim',   appInitials: 'SK', appColor: '#657D65' },
        { id: 3, type: 'Annual Leave', duration: 'Oct 20 – Oct 25 (5 Days)', status: 'Pending',   approver: 'Alex Morgan', appInitials: 'AM', appColor: '#A9E9AD' },
      ]
    }
  },
  computed: {
    monthLabel() {
      return new Date(this.currentYear, this.currentMonth).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    },
    calCells() {
      const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay()
      const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate()
      const daysInPrev  = new Date(this.currentYear, this.currentMonth, 0).getDate()
      const todayStr = this.today.toISOString().split('T')[0]
      const cells = []
      for (let i = firstDay - 1; i >= 0; i--) {
        cells.push({ day: daysInPrev - i, currentMonth: false, date: '', isToday: false, leaveType: null })
      }
      for (let d = 1; d <= daysInMonth; d++) {
        const dt = new Date(this.currentYear, this.currentMonth, d)
        const dateStr = dt.toISOString().split('T')[0]
        cells.push({ day: d, currentMonth: true, date: dateStr, isToday: dateStr === todayStr, leaveType: this.leaveEvents[dateStr] || null })
      }
      while (cells.length < 42) cells.push({ day: cells.length - firstDay - daysInMonth + 1, currentMonth: false, date: '', isToday: false, leaveType: null })
      return cells
    },
    daysRequested() {
      if (!this.form.from || !this.form.to) return 0
      const from = new Date(this.form.from)
      const to   = new Date(this.form.to)
      if (to < from) return 0
      let count = 0
      for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
        const day = d.getDay()
        if (day !== 0 && day !== 6) count++
      }
      return count
    }
  },
  methods: {
    prevMonth() { if (this.currentMonth === 0) { this.currentMonth = 11; this.currentYear-- } else this.currentMonth-- },
    nextMonth() { if (this.currentMonth === 11) { this.currentMonth = 0; this.currentYear++ } else this.currentMonth++ },
    async submitRequest() {
      if (!this.form.from || !this.form.to) return
      this.submitting = true
      await new Promise(r => setTimeout(r, 900))
      this.submitting = false
      this.showSuccess = true
      this.myRequests.unshift({ id: Date.now(), type: this.form.type, duration: `${this.form.from} – ${this.form.to} (${this.daysRequested} Days)`, status: 'Pending', approver: 'Alex Morgan', appInitials: 'AM', appColor: '#A9E9AD' })
      this.form = { type: 'Annual Leave', from: '', to: '', reason: '' }
      setTimeout(() => { this.showSuccess = false }, 3000)
    }
  }
}
</script>

<style scoped>
.card { background: #fff; border-radius: var(--r-xl); padding: 24px; border: 1px solid #e8ece4; }
.card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.card-title { font-family: var(--font-serif); font-size: 17px; color: #1e261f; }
.card-link  { font-size: 12.5px; color: var(--forest); font-weight: 600; background: none; border: none; cursor: pointer; }

/* Balance row */
.balance-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 20px; }
.bal-card {
  background: #fff; border: 1px solid #e8ece4; border-radius: var(--r-xl);
  padding: 22px 24px;
}
.bal-featured { background: #3d5240; border-color: #3d5240; }
.bal-featured .bal-type { color: rgba(255,255,255,.5); }
.bal-featured .bal-num  { color: var(--mint); }
.bal-featured .bal-total { color: rgba(255,255,255,.4); }
.bal-featured .bal-rem  { color: rgba(255,255,255,.4); }
.bal-featured .bal-bar-wrap { background: rgba(255,255,255,.1); }

.bal-type  { font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: var(--stone); margin-bottom: 10px; }
.bal-num   { font-family: var(--font-serif); font-size: 38px; color: #1e261f; line-height: 1; }
.bal-total { font-size: 13px; color: var(--stone); margin-top: 2px; margin-bottom: 14px; }
.bal-bar-wrap { height: 4px; background: #eef0ec; border-radius: 4px; overflow: hidden; margin-bottom: 8px; }
.bal-bar  { height: 100%; border-radius: 4px; transition: width .5s ease; }
.bal-rem  { font-size: 11.5px; color: var(--stone); }

/* Main grid */
.leave-main { display: grid; grid-template-columns: 1fr 320px; gap: 20px; margin-bottom: 20px; }

/* Calendar */
.cal-card { }
.cal-nav { display: flex; align-items: center; gap: 12px; }
.cn-btn {
  width: 28px; height: 28px; border: 1px solid #e4e8e0; background: #fff;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background .15s;
}
.cn-btn:hover { background: #f0f5f0; }
.cn-btn svg { width: 14px; height: 14px; color: var(--forest); }
.cal-month { font-family: var(--font-serif); font-size: 18px; color: #1e261f; }

.cal-days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0; margin-bottom: 4px; }
.cal-dl   { text-align: center; font-size: 10px; font-weight: 700; color: #b0b5ae; padding: 8px 0; letter-spacing: .5px; }

.cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; margin-bottom: 16px; }
.cal-cell {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  aspect-ratio: 1; border-radius: var(--r-sm); cursor: pointer; transition: background .15s;
  position: relative; gap: 2px;
}
.cal-cell:hover:not(.other) { background: #f0f5f0; }
.cal-cell.other   .cell-num { color: #d0d4ce; }
.cal-cell.today   { background: var(--forest-dk); }
.cal-cell.today   .cell-num { color: #fff; }
.cal-cell.selected:not(.today) { background: rgba(169,233,173,.3); }
.cal-cell.has-leave:not(.today) { }
.cell-num { font-size: 13px; font-weight: 500; color: #1e261f; line-height: 1; }
.cell-leave-dot { width: 5px; height: 5px; border-radius: 50%; }
.dot-annual { background: var(--forest); }
.dot-sick   { background: var(--peach); }
.dot-other  { background: var(--stone); }

.cal-legend { display: flex; gap: 16px; }
.cl-item { display: flex; align-items: center; gap: 5px; font-size: 11px; color: var(--stone); }
.cl-dot  { width: 8px; height: 8px; border-radius: 50%; }
.cl-dot.annual { background: var(--forest); }
.cl-dot.sick   { background: var(--peach); }
.cl-dot.other  { background: var(--stone); }

/* Request form */
.req-card { }
.req-title { font-family: var(--font-serif); font-size: 20px; color: #1e261f; margin-bottom: 22px; }

.rf-field { margin-bottom: 18px; }
.rf-field label { display: block; font-size: 10.5px; font-weight: 700; letter-spacing: .8px; text-transform: uppercase; color: var(--stone); margin-bottom: 8px; }

.rf-select-wrap { position: relative; }
.rf-select {
  width: 100%; appearance: none;
  background: #fff; border: 1.5px solid #dde3da; border-radius: var(--r-sm);
  padding: 10px 36px 10px 14px; font-size: 13.5px; font-family: var(--font-sans);
  color: #1e261f; outline: none; cursor: pointer; transition: border-color .18s;
}
.rf-select:focus { border-color: var(--mint); }
.rf-select-wrap svg { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); width: 14px; height: 14px; color: var(--stone); pointer-events: none; }

.rf-input {
  width: 100%; background: #fff; border: 1.5px solid #dde3da; border-radius: var(--r-sm);
  padding: 10px 14px; font-size: 13.5px; font-family: var(--font-sans); color: #1e261f; outline: none;
  transition: border-color .18s;
}
.rf-input:focus { border-color: var(--mint); }

.rf-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.rf-textarea {
  width: 100%; background: #fff; border: 1.5px solid #dde3da; border-radius: var(--r-sm);
  padding: 10px 14px; font-size: 13px; font-family: var(--font-sans); color: #1e261f; outline: none;
  resize: vertical; transition: border-color .18s; min-height: 80px;
}
.rf-textarea:focus { border-color: var(--mint); }
.rf-textarea::placeholder { color: #b8bdb6; }

.rf-days {
  display: flex; align-items: center; gap: 8px;
  background: rgba(169,233,173,.2); border-radius: var(--r-sm); padding: 10px 14px;
  font-size: 13px; color: var(--forest-dk); font-weight: 600; margin-bottom: 18px;
}
.rf-days svg { width: 14px; height: 14px; flex-shrink: 0; color: var(--forest); }

.rf-submit {
  width: 100%; padding: 13px; background: var(--forest-dk); color: #fff;
  border: none; border-radius: var(--r-sm); font-size: 14px; font-weight: 600;
  font-family: var(--font-sans); cursor: pointer; transition: background .18s;
  display: flex; align-items: center; justify-content: center; min-height: 48px;
}
.rf-submit:hover:not(.submitting) { background: var(--forest); }
.rf-spinner {
  width: 18px; height: 18px; border: 2px solid rgba(255,255,255,.3);
  border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.rf-success {
  display: flex; align-items: center; gap: 8px; margin-top: 12px;
  background: rgba(169,233,173,.25); border: 1px solid rgba(169,233,173,.5);
  border-radius: var(--r-sm); padding: 10px 14px;
  font-size: 13px; font-weight: 600; color: #2d5c32;
  animation: fadeIn .3s ease;
}
@keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
.rf-success svg { width: 14px; height: 14px; flex-shrink: 0; }

/* Requests table */
.requests-card { }
.req-table-wrap { overflow-x: auto; margin-top: 16px; }
.req-table { width: 100%; border-collapse: collapse; }
.req-table thead th {
  padding: 10px 18px; text-align: left; font-size: 10.5px; font-weight: 700;
  text-transform: uppercase; letter-spacing: .6px; color: var(--stone);
  background: #f8faf8; border-bottom: 1px solid #eef0ec;
}
.req-table tbody tr { border-bottom: 1px solid #eef0ec; transition: background .15s; }
.req-table tbody tr:last-child { border-bottom: none; }
.req-table tbody tr:hover { background: #f8faf8; }
.req-table td { padding: 14px 18px; }

.rt-type { font-size: 12px; font-weight: 600; padding: 3px 11px; border-radius: 20px; }
.rt-annualleave { background: rgba(169,233,173,.3); color: #2d5c32; }
.rt-sickleave   { background: rgba(255,207,193,.4); color: #8a3525; }
.rt-dur { font-size: 13px; color: #4a5a4b; }

.rt-status { font-size: 11.5px; font-weight: 700; padding: 4px 11px; border-radius: 20px; }
.rs-approved  { background: rgba(169,233,173,.3); color: #2d5c32; }
.rs-pending   { background: rgba(255,207,193,.35); color: #8a3525; }
.rs-completed { background: #f0f0ee; color: var(--stone); }

.rt-approver { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #4a5a4b; }
.app-av {
  width: 26px; height: 26px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 700; color: var(--forest-dk); flex-shrink: 0;
}
.rt-action {
  background: none; border: 1px solid #e4e8e0; border-radius: var(--r-sm);
  padding: 4px 12px; font-size: 14px; color: var(--stone); cursor: pointer;
  font-family: var(--font-sans); transition: background .15s; letter-spacing: 1px;
}
.rt-action:hover { background: #f0f5f0; }
</style>
