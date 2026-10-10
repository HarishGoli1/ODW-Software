import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  ContactRound,
  FolderKanban,
  ListChecks,
  CalendarDays,
  FileText,
  CreditCard,
  UsersRound,
  Workflow,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import odwLogo from '../assets/Optimum logo.jpg'
import { NAV_ITEMS, BOTTOM_NAV_ITEMS } from '../data/navigation'

const ICON_MAP = {
  LayoutDashboard,
  Users,
  ContactRound,
  FolderKanban,
  ListChecks,
  CalendarDays,
  FileText,
  CreditCard,
  UsersRound,
  Workflow,
  Sparkles,
  Settings,
}

function Sidebar({
  isMobileOpen = false,
  setIsMobileOpen = () => {},
  isCollapsed = false,
  setIsCollapsed = () => {},
}) {
  const { user, employee, signOut } = useAuth()

  const displayName = employee?.name || user?.email?.split('@')[0] || 'ODW Member'
  const displayRole = employee?.system_role
    ? employee.system_role.charAt(0).toUpperCase() + employee.system_role.slice(1)
    : employee?.role || 'Team Member'

  const getInitials = (name) => {
    if (!name) return 'ODW'
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  const initials = employee?.name
    ? getInitials(employee.name)
    : user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'ODW'

  const handleLogout = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await signOut()
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  const renderNavItem = (item, isBottom = false) => {
    const IconComponent = ICON_MAP[item.icon] || LayoutDashboard

    if (item.enabled) {
      return (
        <NavLink
          key={item.name}
          to={item.path}
          onClick={() => setIsMobileOpen(false)}
          title={isCollapsed ? item.name : undefined}
          className={({ isActive }) =>
            `group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-odw-primary-soft text-odw-text font-semibold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-odw-text'
            } ${isCollapsed ? 'justify-center px-2' : ''}`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span
                  className="absolute left-0 top-1 bottom-1 w-1 rounded-r-md bg-odw-primary"
                  aria-hidden="true"
                />
              )}
              <IconComponent
                className={`h-4.5 w-4.5 shrink-0 transition-colors ${
                  isActive ? 'text-odw-primary' : 'text-slate-500 group-hover:text-odw-text'
                }`}
                aria-hidden="true"
              />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
            </>
          )}
        </NavLink>
      )
    }

    return (
      <div
        key={item.name}
        title={isCollapsed ? `${item.name} (Coming Soon)` : undefined}
        className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm select-none cursor-default transition-colors ${
          isCollapsed ? 'justify-center px-2' : ''
        }`}
        aria-disabled="true"
      >
        <div className={`flex items-center gap-3 min-w-0 ${isCollapsed ? 'justify-center' : ''}`}>
          <IconComponent
            className="h-4.5 w-4.5 shrink-0 text-slate-400"
            aria-hidden="true"
          />
          {!isCollapsed && (
            <span className="truncate font-normal text-slate-600">
              {item.name}
            </span>
          )}
        </div>
        {!isCollapsed && item.badge && (
          <span className="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-medium tracking-wide text-slate-400 bg-slate-100/80 border border-slate-200/50">
            {item.badge}
          </span>
        )}
      </div>
    )
  }

  const sidebarContent = (collapsedMode = false) => (
    <div className="flex h-full flex-col justify-between bg-white text-odw-text">
      {/* Brand Header */}
      <div className="flex flex-col shrink-0">
        {!collapsedMode ? (
          <div className="flex items-center justify-between border-b border-odw-border py-2.5 px-4">
            <div className="flex items-center justify-center h-14 w-[185px] overflow-hidden">
              <img
                src={odwLogo}
                alt="Optimum Digital Works"
                className="w-[190px] max-w-none h-auto object-contain shrink-0"
              />
            </div>

            {/* Desktop Collapse Trigger */}
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:inline-flex items-center justify-center h-7 w-7 rounded-md border border-slate-200/70 text-odw-text-muted hover:bg-slate-100 hover:text-odw-text transition-colors shrink-0"
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden inline-flex items-center justify-center h-8 w-8 rounded-md text-odw-text-muted hover:bg-slate-100 hover:text-odw-text shrink-0"
              aria-label="Close sidebar"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center border-b border-odw-border py-2.5 px-2 gap-2">
            {/* Collapsed Brand Mark Framing - Circular Spiral Emblem Only */}
            <div
              className="relative flex items-center justify-center h-10 w-10 rounded-lg overflow-hidden bg-white border border-slate-200/70 shadow-2xs"
              title="Optimum Digital Works"
            >
              <img
                src={odwLogo}
                alt="Optimum Digital Works"
                style={{
                  clipPath:
                    'polygon(11.7% 26.4%, 44.1% 26.4%, 44.1% 42.2%, 24.6% 42.2%, 24.6% 59.8%, 41.8% 59.8%, 41.8% 68.6%, 11.7% 68.6%)',
                }}
                className="absolute max-w-none w-[108px] h-[72px] -top-[14px] -left-[10px] pointer-events-none select-none object-contain"
              />
            </div>

            {/* Desktop Expand Trigger */}
            <button
              type="button"
              onClick={() => setIsCollapsed(false)}
              className="hidden lg:inline-flex items-center justify-center h-6 w-6 rounded-md border border-slate-200/70 text-odw-text-muted hover:bg-slate-100 hover:text-odw-text transition-colors shrink-0"
              aria-label="Expand sidebar"
              title="Expand sidebar"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Primary Navigation List with Subtle Scrollbar */}
      <nav
        className="flex-1 mt-2 space-y-0.5 px-3 overflow-y-auto custom-scrollbar"
        aria-label="Sidebar Navigation"
      >
        {NAV_ITEMS.filter((item) => {
          const role = employee?.system_role?.toLowerCase() || 'member'
          if (role === 'member' && item.path === '/payments') return false
          return true
        }).map((item) => renderNavItem(item))}
      </nav>

      {/* Footer Area: Settings & Workspace */}
      <div className="shrink-0 border-t border-odw-border p-3 space-y-2 bg-white">
        {/* Settings Navigation Item */}
        <div className="space-y-0.5">
          {BOTTOM_NAV_ITEMS.map((item) => renderNavItem(item, true))}
        </div>

        {/* Workspace / User Indicator */}
        <div
          className={`flex items-center rounded-lg bg-slate-50 border border-slate-200/70 p-2 ${
            collapsedMode ? 'flex-col gap-1.5 justify-center' : 'gap-2.5'
          }`}
          title={collapsedMode ? `${displayName} (${displayRole})` : undefined}
        >
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-odw-charcoal text-white text-[11px] font-semibold tracking-wider select-none"
            title={displayName}
          >
            {initials}
          </div>
          {!collapsedMode && (
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                <p className="truncate text-xs font-semibold text-odw-text" title={displayName}>
                  {displayName}
                </p>
              </div>
              <p className="truncate text-[10px] text-odw-text-muted capitalize" title={displayRole}>
                {displayRole}
              </p>
            </div>
          )}
          {/* Logout Action */}
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center h-6 w-6 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside
        className={`hidden lg:flex flex-col h-screen sticky top-0 shrink-0 border-r border-odw-border bg-white transition-[width] duration-200 z-30 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent(isCollapsed)}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Off-canvas Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white shadow-xl lg:hidden transform transition-transform duration-200 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Mobile Sidebar"
      >
        {sidebarContent(false)}
      </aside>
    </>
  )
}

export default Sidebar
