<template>
  <AdminLayout page-title="Leave Management" add-label="Add Leave Policy" @add="showPolicyModal = true">

    <!-- Summary KPIs -->
    <div class="kpi-strip">
      <div class="kpi" v-for="k in kpis" :key="k.label">
        <div class="kpi-ico" :style="{ background: k.bg }">
          <svg viewBox="0 0 24 24" fill="none" :stroke="k.stroke" stroke-width="1.8" v-html="k.icon"></svg>
        </div>
        <div class="kpi-body">
          <div class="kpi-val">{{ k.value }}</div>
          <div class="kpi-lbl">{{ k.label }}</div>
        </div>
        <span class="kpi-badge" :class="k.cls">{{ k.trend }}</span>
      </div>
    </div>

    <!-- Main grid -->
    <div class="leave-grid">

      <!-- LEFT: Requests table -->
      <div class="card requests-card">

        <!-- Tabs -->
        <div class="req-tabs">
          <button v-for="t in tabs" :key="t.key" class="rtab" :class="{ active: activeTab === t.key }" @click="activeTab = t.key">
            {{ t.label }}
            <span class="tab-count" v-if="tabCount(t.key) > 0">{{ tabCount(t.key) }}</span>
          </button>
        </div>

        <!-- Filter row -->
        <div class="req-filters">
          <div class="fsearch">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" v-model="search" placeholder="Search by name or department…">
          </div>
          <select class="fselect" v-model="typeFilter">
            <option value="">All Leave Types</option>
            <option v-for="lt in leaveTypes" :key="lt">{{ lt }}</option>
          </select>
          <select class="fselect" v-model="deptFilter">
            <option value="">All Departments</option>
            <option v-for="d in departments" :key="d">{{ d }}</option>
          </select>
        </div>

        <!-- Table -->
        <table class="leave-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Leave Type</th>
              <th>Duration</th>
              <th>Days</th>
              <th>Applied On</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="req in filtered" :key="req.id" @click="selectedRequest = req" :class="{ selected: selectedRequest && selectedRequest.id === req.id }">
              <td>
                <div class="emp-cell">
                  <div class="emp-av" :style="{ background: req.color }">{{ req.initials }}</div>
                  <div>
                    <div class="emp-name">{{ req.name }}</div>
                    <div class="emp-dept">{{ req.department }}</div>
                  </div>
                </div>
              </td>
              <td>
                <span class="ltype-chip" :style="{ background: leaveTypeColor(req.leaveType) + '22', color: leaveTypeColor(req.leaveType) }">{{ req.leaveType }}</span>
              </td>
              <td class="tc">
                <div class="date-range">{{ req.fromDate }}</div>
                <div class="date-to">to {{ req.toDate }}</div>
              </td>
              <td class="tc"><span class="days-badge">{{ req.days }}d</span></td>
              <td class="tc muted">{{ req.appliedOn }}</td>
              <td><span class="status-chip" :class="statusClass(req.status)">{{ req.status }}</span></td>
              <td>
                <div class="action-row" v-if="req.status === 'Pending'">
                  <button class="act-approve" @click.stop="updateStatus(req.id, 'Approved')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                    Approve
                  </button>
                  <button class="act-reject" @click.stop="updateStatus(req.id, 'Rejected')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    Reject
                  </button>
                </div>
                <div v-else class="action-row">
                  <button class="act-view" @click.stop="selectedRequest = req">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    View
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filtered.length === 0">
              <td colspan="7" class="empty-row">
                <div class="empty-state">
                  <div class="es-icon">📋</div>
                  <div class="es-title">No leave requests</div>
                  <div class="es-sub">No requests match the current filter</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="table-foot">
          <span class="tf-info">{{ filtered.length }} of {{ requests.length }} requests</span>
          <div class="pagination">
            <button class="pg">‹</button>
            <button class="pg active">1</button>
            <button class="pg">›</button>
          </div>
        </div>
      </div>

      <!-- RIGHT: Detail + Stats -->
      <div class="right-col">

        <!-- Request Detail -->
        <div class="card detail-card" v-if="selectedRequest">
          <div class="detail-header" :style="{ background: leaveTypeColor(selectedRequest.leaveType) }">
            <div class="dh-type">{{ selectedRequest.leaveType }}</div>
            <div class="dh-name">{{ selectedRequest.name }}</div>
            <div class="dh-dept">{{ selectedRequest.department }}</div>
            <span class="dh-status" :class="statusClass(selectedRequest.status)">{{ selectedRequest.status }}</span>
          </div>
          <div class="detail-body">
            <div class="detail-row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <div><div class="dr-label">Duration</div><div class="dr-val">{{ selectedRequest.fromDate }} → {{ selectedRequest.toDate }}</div></div>
            </div>
            <div class="detail-row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <div><div class="dr-label">Total Days</div><div class="dr-val">{{ selectedRequest.days }} working days</div></div>
            </div>
            <div class="detail-row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/></svg>
              <div><div class="dr-label">Applied On</div><div class="dr-val">{{ selectedRequest.appliedOn }}</div></div>
            </div>
            <div class="reason-box">
              <div class="reason-label">Reason</div>
              <div class="reason-text">{{ selectedRequest.reason }}</div>
            </div>
            <div class="detail-actions" v-if="selectedRequest.status === 'Pending'">
              <button class="act-approve full" @click="updateStatus(selectedRequest.id, 'Approved')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Approve Leave
              </button>
              <button class="act-reject full" @click="updateStatus(selectedRequest.id, 'Rejected')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                Reject
              </button>
            </div>
            <div class="approved-banner" v-else-if="selectedRequest.status === 'Approved'">
              ✅ This leave has been approved
            </div>
            <div class="rejected-banner" v-else-if="selectedRequest.status === 'Rejected'">
              ❌ This leave has been rejected
            </div>
          </div>
        </div>

        <!-- No selection placeholder -->
        <div class="card detail-placeholder" v-else>
          <div class="placeholder-inner">
            <div class="ph-icon">🌿</div>
            <div class="ph-title">Select a Request</div>
            <div class="ph-sub">Click any leave request to view details and take action</div>
          </div>
        </div>

        <!-- Leave Balance -->
        <div class="card balance-card">
          <div class="card-hd">
            <div class="card-title">Leave Balance Summary</div>
            <div class="card-sub">FY 2025–26</div>
          </div>
          <div class="balance-list">
            <div class="balance-row" v-for="b in leaveBalance" :key="b.type">
              <div class="bal-left">
                <div class="bal-type">{{ b.type }}</div>
                <div class="bal-used">{{ b.used }}/{{ b.total }} used</div>
              </div>
              <div class="bal-bar-wrap">
                <div class="bal-bar">
                  <div class="bal-fill" :style="{ width: (b.used/b.total*100)+'%', background: b.color }"></div>
                </div>
              </div>
              <div class="bal-remaining" :style="{ color: b.color }">{{ b.total - b.used }}d left</div>
            </div>
          </div>
        </div>

        <!-- Leave Type breakdown -->
        <div class="card">
          <div class="card-hd">
            <div class="card-title">Requests by Type</div>
          </div>
          <div class="type-breakdown">
            <div class="tb-row" v-for="lt in typeBreakdown" :key="lt.type">
              <span class="tb-dot" :style="{ background: lt.color }"></span>
              <span class="tb-label">{{ lt.type }}</span>
              <span class="tb-count">{{ lt.count }}</span>
              <div class="tb-bar-wrap">
                <div class="tb-bar">
                  <div class="tb-fill" :style="{ width: lt.pct+'%', background: lt.color }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Policy Modal -->
    <div class="modal-overlay" v-if="showPolicyModal" @click.self="showPolicyModal = false">
      <div class="modal">
        <div class="modal-hd">
          <div class="modal-title">Leave Policy</div>
          <button class="modal-close" @click="showPolicyModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="policy-list">
            <div class="policy-row" v-for="p in policies" :key="p.type">
              <div class="pol-type" :style="{ background: p.color + '22', color: p.color }">{{ p.type }}</div>
              <div class="pol-days">{{ p.days }} days/year</div>
              <div class="pol-desc">{{ p.desc }}</div>
            </div>
          </div>
        </div>
        <div class="modal-ft">
          <button class="btn-cancel" @click="showPolicyModal = false">Close</button>
          <button class="btn-save">Edit Policy</button>
        </div>
      </div>
    </div>

  </AdminLayout>
</template>

<script>
import AdminLayout from '../components/AdminLayout.vue'
export default {
  name: 'LeaveView',
  components: { AdminLayout },
  data() {
    return {
      activeTab: 'all', search: '', typeFilter: '', deptFilter: '',
      selectedRequest: null, showPolicyModal: false,
      tabs: [
        { key:'all',      label:'All Requests' },
        { key:'pending',  label:'Pending' },
        { key:'approved', label:'Approved' },
        { key:'rejected', label:'Rejected' },
      ],
      leaveTypes:  ['Casual Leave','Sick Leave','Privilege Leave','Maternity Leave','Paternity Leave','Unpaid Leave'],
      departments: ['Engineering','Design','Marketing','Finance','HR & Admin','Sales'],
      leaveTypeColors: {
        'Casual Leave':    '#657D65',
        'Sick Leave':      '#f0a090',
        'Privilege Leave': '#86d98b',
        'Maternity Leave': '#9c6f0c',
        'Paternity Leave': '#757872',
        'Unpaid Leave':    '#aaaaaa',
      },
      kpis: [
        { label:'Total Requests', value:'28', trend:'This month', cls:'badge-neu', bg:'var(--stone-dim)',         stroke:'var(--stone)',       icon:'<rect x="5" y="2" width="14" height="20" rx="2"/><line x1="9" y1="7" x2="15" y2="7"/>' },
        { label:'Pending',        value:'7',  trend:'Needs action',cls:'badge-warn',bg:'#fef9ec',               stroke:'#9c6f0c',            icon:'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>' },
        { label:'Approved',       value:'16', trend:'57%',        cls:'badge-up',   bg:'var(--mint-ghost)',      stroke:'var(--forest-deep)', icon:'<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>' },
        { label:'Rejected',       value:'5',  trend:'18%',        cls:'badge-down', bg:'var(--peach-dim)',       stroke:'#a03020',            icon:'<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>' },
        { label:'On Leave Today', value:'3',  trend:'Active',     cls:'badge-neu',  bg:'rgba(101,125,101,.1)',   stroke:'var(--forest)',      icon:'<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>' },
      ],
      requests: [
        { id:1,  name:'Priya Sharma',   initials:'PS', department:'Design',      color:'#f0a090', leaveType:'Casual Leave',    fromDate:'Apr 5',  toDate:'Apr 7',  days:3, appliedOn:'Mar 25', status:'Pending',  reason:'Personal family function.' },
        { id:2,  name:'Arjun Kumar',    initials:'AK', department:'Finance',     color:'#757872', leaveType:'Sick Leave',      fromDate:'Apr 10', toDate:'Apr 10', days:1, appliedOn:'Mar 27', status:'Pending',  reason:'Medical appointment for routine checkup.' },
        { id:3,  name:'Rohan Mehta',    initials:'RM', department:'Engineering', color:'#3d5240', leaveType:'Casual Leave',    fromDate:'Apr 2',  toDate:'Apr 3',  days:2, appliedOn:'Mar 20', status:'Approved', reason:'Attending a relative\'s wedding.' },
        { id:4,  name:'Neha Patil',     initials:'NP', department:'Marketing',   color:'#86d98b', leaveType:'Privilege Leave', fromDate:'Apr 14', toDate:'Apr 15', days:2, appliedOn:'Mar 22', status:'Rejected', reason:'Planned vacation.' },
        { id:5,  name:'Kavita Joshi',   initials:'KJ', department:'Sales',       color:'#d08080', leaveType:'Sick Leave',      fromDate:'Mar 28', toDate:'Mar 28', days:1, appliedOn:'Mar 28', status:'Approved', reason:'Fever and cold.' },
        { id:6,  name:'Vivek Singh',    initials:'VS', department:'Engineering', color:'#4a6a4a', leaveType:'Privilege Leave', fromDate:'Apr 22', toDate:'Apr 25', days:4, appliedOn:'Mar 26', status:'Pending',  reason:'Annual family vacation.' },
        { id:7,  name:'Sunita Rao',     initials:'SR', department:'Finance',     color:'#a0c0a0', leaveType:'Casual Leave',    fromDate:'Apr 8',  toDate:'Apr 8',  days:1, appliedOn:'Mar 24', status:'Approved', reason:'Personal work.' },
        { id:8,  name:'Mihir Desai',    initials:'MD', department:'Marketing',   color:'#8090a0', leaveType:'Maternity Leave', fromDate:'May 1',  toDate:'Jul 31', days:90,appliedOn:'Mar 15', status:'Approved', reason:'Maternity leave as per policy.' },
        { id:9,  name:'Deepak Nair',    initials:'DN', department:'Engineering', color:'#aaaaaa', leaveType:'Unpaid Leave',    fromDate:'Apr 18', toDate:'Apr 20', days:3, appliedOn:'Mar 28', status:'Pending',  reason:'Extended travel for personal reasons.' },
        { id:10, name:'Ananya Rao',     initials:'AR', department:'HR & Admin',  color:'#657D65', leaveType:'Privilege Leave', fromDate:'Apr 30', toDate:'May 2',  days:3, appliedOn:'Mar 18', status:'Approved', reason:'Short trip.' },
      ],
      leaveBalance: [
        { type:'Casual Leave',    used:3,  total:12, color:'#657D65' },
        { type:'Sick Leave',      used:2,  total:10, color:'#f0a090' },
        { type:'Privilege Leave', used:5,  total:20, color:'#86d98b' },
        { type:'Compensatory',    used:1,  total:6,  color:'#757872' },
      ],
      policies: [
        { type:'Casual Leave',    days:12, color:'#657D65', desc:'Can be availed for personal work, with min 1-day notice.' },
        { type:'Sick Leave',      days:10, color:'#f0a090', desc:'Requires medical certificate for 3+ consecutive days.' },
        { type:'Privilege Leave', days:20, color:'#86d98b', desc:'Planned leaves; 2 weeks notice required.' },
        { type:'Maternity Leave', days:182,color:'#9c6f0c', desc:'As per Maternity Benefit Act, 1961.' },
        { type:'Paternity Leave', days:15, color:'#757872', desc:'For male employees on birth/adoption of child.' },
        { type:'Unpaid Leave',    days:0,  color:'#aaaaaa', desc:'Approved case-by-case; salary deducted.' },
      ],
    }
  },
  computed: {
    filtered() {
      return this.requests.filter(r => {
        const matchTab    = this.activeTab === 'all' || r.status.toLowerCase() === this.activeTab
        const matchSearch = !this.search || r.name.toLowerCase().includes(this.search.toLowerCase()) || r.department.toLowerCase().includes(this.search.toLowerCase())
        const matchType   = !this.typeFilter || r.leaveType === this.typeFilter
        const matchDept   = !this.deptFilter || r.department === this.deptFilter
        return matchTab && matchSearch && matchType && matchDept
      })
    },
    typeBreakdown() {
      const counts = {}
      this.requests.forEach(r => { counts[r.leaveType] = (counts[r.leaveType] || 0) + 1 })
      const max = Math.max(...Object.values(counts))
      return Object.entries(counts).map(([type, count]) => ({
        type, count, pct: Math.round(count/max*100), color: this.leaveTypeColors[type] || '#657D65'
      }))
    },
  },
  methods: {
    tabCount(key) {
      if (key === 'all') return 0
      return this.requests.filter(r => r.status.toLowerCase() === key).length
    },
    statusClass(s) { return { 'Pending':'sc-pending', 'Approved':'sc-approved', 'Rejected':'sc-rejected' }[s] || '' },
    leaveTypeColor(t) { return this.leaveTypeColors[t] || '#657D65' },
    updateStatus(id, status) {
      const req = this.requests.find(r => r.id === id)
      if (req) { req.status = status; if (this.selectedRequest && this.selectedRequest.id === id) this.selectedRequest = { ...req } }
    },
  }
}
</script>

<style scoped>
.kpi-strip { display:grid; grid-template-columns:repeat(5,1fr); gap:12px; margin-bottom:20px; }
.kpi { background:var(--bg-card); border:1px solid var(--border); border-radius:var(--r-md); padding:16px 18px; display:flex; align-items:center; gap:12px; box-shadow:var(--shadow-xs); }
.kpi-ico { width:38px; height:38px; border-radius:var(--r-sm); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.kpi-ico svg { width:17px; height:17px; }
.kpi-body { flex:1; }
.kpi-val  { font-family:'Lora',serif; font-size:22px; font-weight:600; color:var(--text-1); line-height:1; }
.kpi-lbl  { font-size:11px; color:var(--text-3); margin-top:2px; }
.kpi-badge { font-size:10px; font-weight:700; padding:2px 8px; border-radius:20px; white-space:nowrap; flex-shrink:0; }
.badge-up   { background:var(--mint-ghost); color:var(--forest-deep); }
.badge-down { background:var(--peach-dim);  color:#a03020; }
.badge-warn { background:#fef9ec; color:#9c6f0c; }
.badge-neu  { background:var(--stone-dim);  color:var(--stone); }

.leave-grid { display:grid; grid-template-columns:1fr 300px; gap:18px; }

/* Requests card */
.requests-card { overflow:hidden; }
.req-tabs { display:flex; border-bottom:1px solid var(--border); padding:0 22px; }
.rtab { padding:14px 16px; border:none; background:transparent; font-size:13.5px; font-weight:500; color:var(--text-3); cursor:pointer; border-bottom:2px solid transparent; transition:all .18s; display:flex; align-items:center; gap:8px; }
.rtab.active { color:var(--forest-ink); border-bottom-color:var(--forest-ink); font-weight:700; }
.tab-count { background:var(--peach-dim); color:#a03020; font-size:10px; font-weight:700; padding:1px 6px; border-radius:20px; }
.rtab.active .tab-count { background:var(--forest-ink); color:#fff; }

.req-filters { display:flex; gap:10px; padding:14px 22px; border-bottom:1px solid var(--border); flex-wrap:wrap; }
.fsearch { display:flex; align-items:center; gap:8px; background:var(--stone-ghost); border:1px solid var(--border); border-radius:var(--r-sm); padding:7px 12px; flex:1; min-width:160px; }
.fsearch svg { width:13px; height:13px; color:var(--text-3); flex-shrink:0; }
.fsearch input { border:none; background:transparent; font-size:13px; font-family:inherit; color:var(--text-1); outline:none; width:100%; }
.fselect { border:1px solid var(--border); background:var(--bg-card); border-radius:var(--r-sm); padding:7px 12px; font-size:13px; font-family:inherit; color:var(--text-1); outline:none; cursor:pointer; }

.leave-table { width:100%; border-collapse:collapse; }
.leave-table thead th { padding:10px 18px; background:var(--stone-ghost); font-size:11px; font-weight:700; color:var(--text-3); text-align:left; letter-spacing:.5px; text-transform:uppercase; border-bottom:1px solid var(--border); }
.leave-table tbody tr { border-bottom:1px solid var(--border); transition:background .15s; cursor:pointer; }
.leave-table tbody tr:last-child { border-bottom:none; }
.leave-table tbody tr:hover { background:var(--stone-ghost); }
.leave-table tbody tr.selected { background:var(--mint-ghost); }
.leave-table td { padding:13px 18px; }

.emp-cell { display:flex; align-items:center; gap:10px; }
.emp-av { width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:#fff; flex-shrink:0; }
.emp-name { font-size:13.5px; font-weight:600; color:var(--text-1); }
.emp-dept { font-size:11px; color:var(--text-3); }
.ltype-chip { font-size:11px; font-weight:600; padding:3px 10px; border-radius:20px; white-space:nowrap; }
.tc { font-size:13px; color:var(--text-2); }
.muted { color:var(--text-3) !important; }
.date-range { font-size:12.5px; font-weight:500; color:var(--text-1); }
.date-to    { font-size:11px; color:var(--text-3); }
.days-badge { background:var(--stone-dim); color:var(--stone); font-size:11.5px; font-weight:700; padding:2px 9px; border-radius:20px; }
.status-chip { font-size:11px; font-weight:700; padding:3px 10px; border-radius:20px; white-space:nowrap; }
.sc-pending  { background:#fef9ec; color:#9c6f0c; }
.sc-approved { background:var(--mint-ghost); color:var(--forest-deep); }
.sc-rejected { background:var(--peach-dim);  color:#a03020; }

.action-row { display:flex; gap:6px; flex-wrap:wrap; }
.act-approve, .act-reject, .act-view {
  display:flex; align-items:center; gap:4px;
  padding:5px 10px; border-radius:var(--r-xs);
  font-size:11.5px; font-weight:600; cursor:pointer; border:1px solid;
  transition:all .18s; font-family:inherit;
}
.act-approve svg,.act-reject svg,.act-view svg { width:12px; height:12px; }
.act-approve { background:var(--mint-ghost); border-color:var(--mint); color:var(--forest-deep); }
.act-approve:hover { background:var(--mint-dim); }
.act-reject  { background:var(--peach-dim);  border-color:var(--peach); color:#a03020; }
.act-reject:hover  { background:#ffd5c8; }
.act-view    { background:var(--stone-ghost); border-color:var(--border); color:var(--text-2); }
.act-view:hover    { background:var(--stone-dim); }
.act-approve.full,.act-reject.full { width:100%; justify-content:center; padding:9px; font-size:13px; border-radius:var(--r-sm); }

.empty-row { text-align:center; }
.empty-state { padding:40px 0; }
.es-icon  { font-size:36px; margin-bottom:8px; }
.es-title { font-family:'Lora',serif; font-size:16px; font-weight:600; color:var(--text-2); margin-bottom:4px; }
.es-sub   { font-size:12.5px; color:var(--text-3); }

.table-foot { display:flex; align-items:center; justify-content:space-between; padding:12px 18px; border-top:1px solid var(--border); }
.tf-info { font-size:12px; color:var(--text-3); }
.pagination { display:flex; gap:4px; }
.pg { width:28px; height:28px; border-radius:var(--r-xs); border:1px solid var(--border); background:var(--bg-card); font-size:12.5px; font-weight:500; color:var(--text-2); cursor:pointer; }
.pg.active { background:var(--forest-ink); color:#fff; border-color:var(--forest-ink); }

/* Right col */
.right-col { display:flex; flex-direction:column; gap:14px; }
.card { background:var(--bg-card); border:1px solid var(--border); border-radius:var(--r-lg); box-shadow:var(--shadow-xs); overflow:hidden; }
.card-hd { padding:20px 22px 14px; display:flex; align-items:flex-start; justify-content:space-between; }
.card-title { font-family:'Lora',serif; font-size:15px; font-weight:600; color:var(--text-1); }
.card-sub   { font-size:11.5px; color:var(--text-3); margin-top:2px; }

/* Detail */
.detail-header { padding:22px; }
.dh-type { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; color:rgba(255,255,255,.7); margin-bottom:4px; }
.dh-name { font-family:'Lora',serif; font-size:19px; font-weight:600; color:#fff; margin-bottom:2px; }
.dh-dept { font-size:12px; color:rgba(255,255,255,.6); margin-bottom:12px; }
.dh-status { font-size:11px; font-weight:700; padding:3px 10px; border-radius:20px; background:rgba(255,255,255,.2); color:#fff; }
.detail-body { padding:18px 22px 22px; }
.detail-row { display:flex; align-items:flex-start; gap:12px; margin-bottom:14px; }
.detail-row svg { width:16px; height:16px; color:var(--text-3); margin-top:2px; flex-shrink:0; }
.dr-label { font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:.5px; color:var(--text-3); margin-bottom:2px; }
.dr-val   { font-size:13.5px; font-weight:500; color:var(--text-1); }
.reason-box { background:var(--stone-ghost); border-radius:var(--r-sm); padding:12px; margin-bottom:16px; }
.reason-label { font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:.5px; color:var(--text-3); margin-bottom:5px; }
.reason-text  { font-size:13px; color:var(--text-2); line-height:1.5; }
.detail-actions { display:flex; flex-direction:column; gap:8px; }
.approved-banner { text-align:center; padding:12px; background:var(--mint-ghost); border-radius:var(--r-sm); font-size:13px; font-weight:600; color:var(--forest-deep); }
.rejected-banner { text-align:center; padding:12px; background:var(--peach-dim); border-radius:var(--r-sm); font-size:13px; font-weight:600; color:#a03020; }

.detail-placeholder { min-height:200px; display:flex; align-items:center; justify-content:center; }
.placeholder-inner { text-align:center; padding:30px; }
.ph-icon  { font-size:36px; margin-bottom:10px; }
.ph-title { font-family:'Lora',serif; font-size:16px; font-weight:600; color:var(--text-2); margin-bottom:5px; }
.ph-sub   { font-size:12px; color:var(--text-3); }

/* Balance */
.balance-list { padding:0 22px 18px; display:flex; flex-direction:column; gap:12px; }
.balance-row { display:flex; align-items:center; gap:12px; }
.bal-left { width:110px; flex-shrink:0; }
.bal-type { font-size:12.5px; font-weight:600; color:var(--text-1); }
.bal-used { font-size:11px; color:var(--text-3); margin-top:2px; }
.bal-bar-wrap { flex:1; }
.bal-bar  { height:5px; background:var(--border); border-radius:4px; overflow:hidden; }
.bal-fill { height:100%; border-radius:4px; }
.bal-remaining { font-size:12px; font-weight:700; width:50px; text-align:right; flex-shrink:0; }

/* Type breakdown */
.type-breakdown { padding:0 22px 18px; display:flex; flex-direction:column; gap:10px; }
.tb-row { display:flex; align-items:center; gap:8px; }
.tb-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
.tb-label { font-size:12px; color:var(--text-2); flex:1; }
.tb-count { font-size:12px; font-weight:700; color:var(--text-1); width:20px; text-align:center; }
.tb-bar-wrap { width:60px; }
.tb-bar  { height:4px; background:var(--border); border-radius:4px; overflow:hidden; }
.tb-fill { height:100%; border-radius:4px; }

/* Policy modal */
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.4); z-index:500; display:flex; align-items:center; justify-content:center; }
.modal { background:var(--bg-card); border-radius:var(--r-lg); width:520px; max-width:95vw; }
.modal-hd { display:flex; align-items:center; justify-content:space-between; padding:22px 24px 0; }
.modal-title { font-family:'Lora',serif; font-size:18px; font-weight:600; color:var(--text-1); }
.modal-close { background:none; border:none; font-size:16px; color:var(--text-3); cursor:pointer; width:30px; height:30px; border-radius:50%; }
.modal-close:hover { background:var(--stone-ghost); }
.modal-body { padding:20px 24px; }
.policy-list { display:flex; flex-direction:column; gap:10px; }
.policy-row { display:grid; grid-template-columns:140px 80px 1fr; gap:14px; align-items:center; padding:12px; background:var(--stone-ghost); border-radius:var(--r-sm); border:1px solid var(--border); }
.pol-type { font-size:12px; font-weight:700; padding:4px 10px; border-radius:20px; text-align:center; }
.pol-days { font-size:13px; font-weight:700; color:var(--text-1); text-align:center; }
.pol-desc { font-size:12px; color:var(--text-3); line-height:1.4; }
.modal-ft { display:flex; justify-content:flex-end; gap:10px; padding:0 24px 22px; }
.btn-cancel { padding:9px 20px; border:1px solid var(--border); background:var(--bg-card); border-radius:var(--r-sm); font-size:13px; font-weight:600; color:var(--text-2); cursor:pointer; }
.btn-save { padding:9px 20px; background:var(--forest-ink); color:#fff; border:none; border-radius:var(--r-sm); font-size:13px; font-weight:600; cursor:pointer; }
.btn-save:hover { background:var(--forest-deep); }

@media (max-width: 1024px) {
  .kpi-strip { grid-template-columns: repeat(3, 1fr); }
  .leave-grid { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .kpi-strip { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .kpi { padding: 12px; }
  .kpi-val { font-size: 18px; }

  .req-tabs {
    overflow-x: auto;
    white-space: nowrap;
    padding: 0 12px;
  }
  .rtab { flex: 0 0 auto; }

  .req-filters {
    padding: 12px;
    gap: 8px;
  }

  .fsearch,
  .fselect {
    width: 100%;
    min-width: 0;
  }

  .leave-table {
    min-width: 720px;
  }

  .requests-card {
    overflow-x: auto;
  }

  .card-hd {
    padding: 16px 14px 12px;
  }

  .balance-list,
  .type-breakdown,
  .detail-body {
    padding-left: 14px;
    padding-right: 14px;
  }

  .policy-row {
    grid-template-columns: 1fr;
    gap: 8px;
    text-align: left;
  }

  .modal-ft {
    padding: 0 16px 16px;
  }
}

@media (max-width: 480px) {
  .kpi-strip { grid-template-columns: 1fr; }

  .table-foot {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .pagination {
    width: 100%;
  }

  .pg {
    flex: 1;
  }
}
</style>
