<template>
  <div class="shell">

    <!-- ── SIDEBAR OVERLAY (Mobile) ── -->
    <div
      class="sidebar-overlay"
      v-if="isMobile && sidebarOpen"
      @click="sidebarOpen = false"
    ></div>

    <!-- ── SIDEBAR ── -->
    <aside class="sidebar" :class="{ 'sidebar-mobile-open': isMobile && sidebarOpen }">

      <!-- Mobile Header (hamburger + company name) — only on mobile -->
      <div class="sb-mobile-header" v-if="isMobile">
        <button class="sb-close-btn" @click="sidebarOpen = false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div class="sb-mobile-company">
          <div class="sb-name">TWO ELEPHANTS TECHNOLOGIES LLP</div>
          <div class="sb-sub">My Workspace</div>
        </div>
      </div>

      <!-- Brand (Desktop only) -->
      <div class="sb-brand">
        <div class="sb-logo-mark">
          <img class="sb-logo-img" src="../assets/logo.svg" alt="TWO ELEPHANTS TECHNOLOGIES LLP logo">
        </div>
        <div>
          <div class="sb-name">TWO ELEPHANTS TECHNOLOGIES LLP</div>
          <div class="sb-sub">My Workspace</div>
        </div>
      </div>

      <!-- Nav -->
      <nav class="sb-nav">
        <router-link
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="sb-link"
          active-class="sb-link-active"
          @click="isMobile && (sidebarOpen = false)"
        >
          <div class="sb-icon" v-html="item.icon"></div>
          <span>{{ item.label }}</span>
          <span v-if="item.badge" class="sb-badge">{{ item.badge }}</span>
        </router-link>
      </nav>

      <!-- ── SIDEBAR FOOTER — user card + logout popup (matches Admin) ── -->
      <div class="sb-footer">
        <div class="sb-user-wrap" ref="userWrap">
          <div class="sb-user" @click="toggleUserMenu">
            <div class="sb-avatar">{{ currentUser.initials }}</div>
            <div class="sb-user-info">
              <div class="sb-user-name">{{ currentUser.name }}</div>
              <div class="sb-user-role">{{ currentUser.role }}</div>
            </div>
            <svg
              class="sb-chevron"
              :class="{ rotated: showUserMenu }"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            >
              <polyline points="18 15 12 9 6 15"/>
            </svg>
          </div>

          <!-- Popup (same structure as Admin) -->
          <transition name="pop">
            <div v-if="showUserMenu" class="user-popup">
              <div class="up-header">
                <div class="up-av">{{ currentUser.initials }}</div>
                <div>
                  <div class="up-name">{{ currentUser.name }}</div>
                  <div class="up-role">{{ currentUser.role }}</div>
                  <div class="up-email">{{ currentUser.email }}</div>
                </div>
              </div>
              <div class="up-divider"></div>
              <button class="up-item logout" @click="logout" :disabled="loggingOut">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                {{ loggingOut ? 'Logging out…' : 'Logout' }}
              </button>
            </div>
          </transition>
        </div>
      </div>
    </aside>

    <!-- ── mY TOPBAR ── -->
    <header class="topbar">
      <!-- Hamburger Button (Mobile only) -->
      <button class="mobile-toggle" @click="sidebarOpen = !sidebarOpen" v-if="isMobile" aria-label="Toggle sidebar">
        ☰
      </button>

      <div class="tb-left">
        <div class="tb-title">{{ pageTitle }}</div>
        <div class="tb-crumb">Home &rsaquo; <span>{{ pageTitle }}</span></div>
      </div>
      <div class="tb-spacer1"></div>
      
      <div class="tb-actions">
        <router-link to="/user/notifications" class="tb-icon" title="Notifications">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
          <span class="pip" v-if="unreadCount > 0"></span>
        </router-link>
      </div>
    </header>

    <!-- ── MAIN ── -->
    <main class="page-main">
      <!-- PAGE HERO -->
      <section class="page-hero">
        <div class="hero-inner">
          <div class="hero-left">
            <slot name="hero-left">
              <div class="hero-kicker" v-if="pageSub">{{ pageSub }}</div>
              <div class="hero-title">{{ pageTitle }}</div>
            </slot>
          </div>
          <div class="hero-right">
            <slot name="hero-right" />
          </div>
        </div>
      </section>
      <slot />
    </main>
  </div>
</template>

<script>
import { jwtDecode } from 'jwt-decode'

export default {
  name: 'UserLayout',
  props: {
    pageTitle:         { type: String, default: 'Dashboard' },
    pageSub:           { type: String, default: '' },
    searchPlaceholder: { type: String, default: 'Search…' },
    unreadCount:       { type: Number, default: 3 },
  },
  data() {
    return {
      q: '',
      sidebarOpen: false,
      isMobile: false,
      showUserMenu: false,
      loggingOut: false,

      // Populated dynamically from JWT — same pattern as AdminLayout
      currentUser: {
        name:     'Employee',
        email:    '',
        role:     'Employee',
        initials: 'EE',
      },

      nav: [
        {
          to: '/user/dashboard',
          label: 'Dashboard',
          icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>'
        },
        {
          to: '/user/profile',
          label: 'Profile',
          icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a8.38 8.38 0 0113 0"/></svg>'
        },
        {
          to: '/user/attendance',
          label: 'Attendance',
          icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>'
        },
        {
          to: '/user/leave',
          label: 'Leave',
          icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'
        },
        {
          to: '/user/calendar',
          label: 'Calendar',
          icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'
        },
        {
          to: '/user/notifications',
          label: 'Notifications',
          icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>'
        },
      ],
    }
  },

  mounted() {
    this.loadUserFromToken()
    this.checkMobile()
    window.addEventListener('resize', this.checkMobile)
    document.addEventListener('click', this.handleOutsideClick)
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobile)
    document.removeEventListener('click', this.handleOutsideClick)
  },

  methods: {
    // ── Load user info from JWT — identical logic to AdminLayout ──────
    loadUserFromToken() {
      const token = sessionStorage.getItem('hrms_token') || localStorage.getItem('hrms_token')
      if (!token) return

      try {
        const decoded = jwtDecode(token)

        const fullName = decoded.name
          || `${decoded.given_name || ''} ${decoded.family_name || ''}`.trim()
          || decoded.preferred_username
          || 'Employee'

        this.currentUser.name  = fullName
        this.currentUser.email = decoded.email || decoded.preferred_username || ''
        this.currentUser.initials = fullName
          .split(' ')
          .map(w => w[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)

        const roles = decoded.realm_access?.roles || []
        this.currentUser.role = roles.includes('admin')
          ? 'HR Administrator'
          : roles.includes('employee')
          ? 'Employee'
          : decoded.preferred_username || 'Employee'
      } catch (e) {
        console.error('Token decode failed:', e)
      }
    },

    // ── Popup toggle ──────────────────────────────────────────────────
    toggleUserMenu() {
      this.showUserMenu = !this.showUserMenu
    },

    handleOutsideClick(e) {
      if (this.$refs.userWrap && !this.$refs.userWrap.contains(e.target)) {
        this.showUserMenu = false
      }
    },

    // ── Logout — same flow as AdminLayout ────────────────────────────
    async logout() {
      this.loggingOut = true
      const token = sessionStorage.getItem('hrms_token') || localStorage.getItem('hrms_token')

      try {
        await fetch('http://localhost:3000/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        })
      } catch (_) { /* non-blocking */ }

      localStorage.clear()
      sessionStorage.clear()
      this.$router.push('/login')
    },

    // ── Responsive ───────────────────────────────────────────────────
    checkMobile() {
      this.isMobile = window.innerWidth < 768
      if (!this.isMobile) this.sidebarOpen = false
    }
  }
}
</script>

<style scoped>
/* ─────────────────────────────────────────
   CSS Variables / Root
───────────────────────────────────────── */
:root { --sidebar-w: 240px; }

/* ─────────────────────────────────────────
   Shell
───────────────────────────────────────── */
.shell { display: flex; min-height: 100vh; background: var(--bg-main); }

/* ─────────────────────────────────────────
   Sidebar — Desktop
───────────────────────────────────────── */
.sidebar {
  width: var(--sidebar-w);
  background: var(--bg-sidebar);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  position: fixed;
  top: 0; left: 0; bottom: 0;
  display: flex;
  flex-direction: column;
  z-index: 200;
  overflow-y: auto;
}

/* Brand */
.sb-brand {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 22px 20px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.sb-logo-mark {
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.sb-logo-img { width: auto; height: 44px; object-fit: contain; display: block; }
.sb-name {
  font-family: 'Lora', serif;
  font-size: 16px; font-weight: 600; color: #fff; line-height: 1.3;
}
.sb-sub {
  font-size: 10px; color: #7a9a7a;
  letter-spacing: 1.2px; text-transform: uppercase; margin-top: 2px;
}

/* Nav */
.sb-nav {
  flex: 1; padding: 6px 12px;
  display: flex; flex-direction: column; gap: 2px;
}
.sb-link {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; border-radius: var(--r-sm);
  color: rgba(255,255,255,.55); font-size: 13.5px; font-weight: 500;
  text-decoration: none; transition: all 0.18s; position: relative;
}
.sb-link:hover { background: rgba(255,255,255,.07); color: rgba(255,255,255,.9); }
.sb-link-active {
  background: var(--mint) !important;
  color: var(--forest-ink) !important;
  font-weight: 600;
}
.sb-icon { width: 18px; height: 18px; display: flex; align-items: center; flex-shrink: 0; color: currentColor; }
.sb-icon svg { width: 18px; height: 18px; stroke: currentColor; opacity: .65; }
.sb-badge {
  margin-left: auto; background: rgba(255,255,255,.12); color: rgba(255,255,255,.7);
  font-size: 10px; font-weight: 700; padding: 1px 7px; border-radius: 20px;
}

/* ── Footer / user-wrap (matches Admin exactly) ── */
.sb-footer {
  border-top: 1px solid rgba(255,255,255,.07);
}
.sb-user-wrap { position: relative; padding: 10px 12px; }

.sb-user {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 10px; border-radius: var(--r-sm);
  cursor: pointer; user-select: none; transition: background .18s;
}
.sb-user:hover { background: rgba(255,255,255,.07); }

.sb-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  background: linear-gradient(135deg, var(--mint), var(--forest));
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; color: #fff; flex-shrink: 0;
}
.sb-user-info { flex: 1; overflow: hidden; min-width: 0; }
.sb-user-name { font-size: 12.5px; font-weight: 600; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sb-user-role { font-size: 11px; color: rgba(255,255,255,.4); }

.sb-chevron {
  width: 14px; height: 14px;
  color: rgba(255,255,255,.35); flex-shrink: 0;
  transition: transform 0.22s ease;
}
.sb-chevron.rotated { transform: rotate(180deg); }

/* ── User popup (white card, same as Admin) ── */
.user-popup {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 8px; right: 8px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  overflow: hidden;
  z-index: 500;
}
.up-header { display: flex; align-items: center; gap: 12px; padding: 16px 16px 12px; }
.up-av {
  width: 40px; height: 40px; border-radius: 50%;
  background: linear-gradient(135deg, #2e7d32, #43a047);
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700; color: #fff; flex-shrink: 0;
}
.up-name  { font-size: 13.5px; font-weight: 700; color: #1a2e1a; }
.up-role  { font-size: 11px; color: #2e7d32; font-weight: 600; margin-top: 1px; }
.up-email { font-size: 11px; color: #8aaa8a; margin-top: 2px; }
.up-divider { height: 1px; background: #f0f7f0; }
.up-item {
  display: flex; align-items: center; gap: 10px;
  width: 100%; padding: 13px 16px;
  border: none; background: none;
  font-family: inherit; font-size: 13.5px; font-weight: 500;
  cursor: pointer; transition: background .15s; text-align: left;
}
.up-item svg { width: 15px; height: 15px; flex-shrink: 0; }
.up-item.logout { color: #c62828; }
.up-item.logout:hover { background: #fbe9e7; }
.up-item:disabled { opacity: 0.6; cursor: not-allowed; }

/* Popup transition */
.pop-enter-active { animation: popUp 0.16s ease; }
.pop-leave-active { animation: popUp 0.12s ease reverse; }
@keyframes popUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Mobile header inside sidebar — hidden on desktop */
.sb-mobile-header { display: none; }

/* ── Topbar ── */
.topbar {
  position: fixed; top: 0;
  left: var(--sidebar-w); right: 0;
  height: var(--topbar-h, 64px);
  background: var(--bg-card, #fff);
  border-bottom: 1px solid var(--border, #e2eee5);
  display: flex; align-items: center;
  padding: 0 26px; gap: 12px; z-index: 100;
}
.mobile-toggle {
  display: none;
  width: 36px; height: 36px;
  border: none; border-radius: var(--r-sm, 8px);
  background: var(--forest-ink, #1f3d2b);
  color: #fff; cursor: pointer;
}
.tb-left { display: flex; flex-direction: column; }
.tb-title {
  font-family: 'Lora', serif; font-size: 17px;
  font-weight: 600; color: var(--text-1, #1a2e1a);
}
.tb-crumb { font-size: 11.5px; color: var(--text-3, #6b7d6f); margin-top: 1px; }
.tb-crumb span { color: var(--text-2, #3d5240); font-weight: 500; }
.tb-spacer { flex: 1; }
.tb-actions { display: flex; align-items: center; gap: 100px;margin-left:40px }
.tb-icon {
  width: 40px; height: 40px;
  border: 1.5px solid var(--border, #090a0a);
  background: var(--bg-card, #fff);
  border-radius: var(--r-sm, 8px);
  display: flex; align-items: center; justify-content: center;
  position: relative; transition: background .18s; text-decoration: none;
}
.tb-icon:hover { background: var(--stone-ghost, #f4faf4); }
.tb-icon svg { width: 16px; height: 16px; color: var(--text-2, #3d5240); }
.pip {
  position: absolute; top: 7px; right: 7px;
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--peach-mid, #f0a090);
  border: 1.5px solid var(--bg-card, #fff);
}

/* ── Main ── */
.page-main {
  margin-left: var(--sidebar-w);
  margin-top: var(--topbar-h, 64px);
  padding: 28px 28px 40px;
  min-height: calc(100vh - var(--topbar-h, 64px));
  flex: 1;
}

/* ── Hero ── */
.page-hero {
  background: linear-gradient(135deg, #1a2e1a 0%, #2e7d32 100%);
  border-radius: 18px; padding: 18px 24px;
  box-shadow: 0 4px 20px rgba(46,125,50,0.22);
  margin-bottom: 18px; position: relative; overflow: hidden;
}
.page-hero::after {
  content: ''; position: absolute;
  right: -40px; top: -40px;
  width: 200px; height: 200px; border-radius: 50%;
  background: rgba(255,255,255,0.04);
}
.hero-inner {
  display: flex; align-items: center;
  justify-content: space-between; gap: 14px;
  position: relative; z-index: 1;
}
.hero-left { min-width: 0; }
.hero-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
.hero-kicker { font-size: 12px; color: rgba(255,255,255,0.55); margin-bottom: 6px; letter-spacing: 0.04em; }
.hero-title  { font-family: 'DM Serif Display', serif; font-size: 28px; color: #fff; font-weight: 400; line-height: 1.1; }

/* ── Sidebar Overlay (Mobile) ── */
.sidebar-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(3px);
  z-index: 180;
  animation: fadeIn 0.25s ease;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

/* ─────────────────────────────────────────
   MOBILE — ≤ 768px
───────────────────────────────────────── */
@media (max-width: 768px) {
  .mobile-toggle { display: inline-flex; align-items: center; justify-content: center; }
  .sidebar { left: -260px; }
  .sidebar.sidebar-mobile-open { left: 0; }

  .sb-mobile-header {
    display: flex; align-items: center; gap: 12px;
    padding: 18px 16px 14px;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    flex-shrink: 0;
  }
  .sb-close-btn {
    width: 38px; height: 38px;
    background: rgba(255,255,255,0.1);
    border: 1.5px solid rgba(255,255,255,0.18);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    color: rgba(255,255,255,0.9); cursor: pointer; flex-shrink: 0;
    transition: background 0.18s;
  }
  .sb-close-btn:hover { background: rgba(255,255,255,0.18); }
  .sb-close-btn svg { width: 18px; height: 18px; }
  .sb-mobile-company .sb-name { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.92); }
  .sb-mobile-company .sb-sub { font-size: 9px; color: rgba(255,255,255,0.45); letter-spacing: 1px; text-transform: uppercase; margin-top: 2px; }

  .sb-brand { display: none; }

  .topbar { left: 0; padding-left: 60px; }
  .page-main { margin-left: 0; padding: 20px; }
  .page-hero { padding: 16px; border-radius: 14px; margin-bottom: 14px; }
  .hero-inner { flex-direction: column; align-items: flex-start; gap: 12px; }
  .hero-title { font-size: 22px; }
  .hero-right { width: 100%; flex-wrap: wrap; }
}

@media (max-width: 600px) {
  .sb-nav { padding: 4px 8px; gap: 1px; }
  .sb-link { padding: 9px 8px; font-size: 12.5px; }
  .sb-icon { width: 16px; height: 16px; }
  .sb-icon svg { width: 16px; height: 16px; }
}

@media (max-width: 480px) {
  .sb-close-btn { width: 34px; height: 34px; border-radius: 8px; }
  .sb-close-btn svg { width: 16px; height: 16px; }
  .sb-mobile-company .sb-name { font-size: 12px; }
  .sb-avatar { width: 28px; height: 28px; font-size: 9px; }
  .sb-user-name { font-size: 11px; }
  .sb-user-role { font-size: 9px; }
  .topbar { padding-right: 10px; gap: 6px; }
}
</style>