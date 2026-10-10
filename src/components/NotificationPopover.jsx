import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  CheckCheck,
  RotateCw,
  X,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  CheckSquare,
  Briefcase,
  CreditCard,
  FileText,
  Users,
  Inbox,
  Loader2,
  Trash2,
} from 'lucide-react'
import { useNotifications } from '../context/NotificationContext'

/**
 * Format timestamp into safe human-readable relative time
 */
const formatRelativeTime = (dateString) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    if (diffMs < 0) return 'Just now'
    const diffSecs = Math.floor(diffMs / 1000)
    if (diffSecs < 60) return 'Just now'
    const diffMins = Math.floor(diffSecs / 60)
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

/**
 * Severity visual mapping
 */
const SEVERITY_CONFIG = {
  urgent: {
    label: 'Urgent',
    icon: AlertCircle,
    badgeClasses: 'bg-rose-50 text-rose-600 border-rose-200/80',
    dotClasses: 'bg-rose-500',
  },
  warning: {
    label: 'Warning',
    icon: AlertTriangle,
    badgeClasses: 'bg-amber-50 text-amber-700 border-amber-200/80',
    dotClasses: 'bg-amber-500',
  },
  info: {
    label: 'Info',
    icon: Info,
    badgeClasses: 'bg-sky-50 text-sky-600 border-sky-200/80',
    dotClasses: 'bg-sky-500',
  },
  success: {
    label: 'Success',
    icon: CheckCircle2,
    badgeClasses: 'bg-emerald-50 text-emerald-600 border-emerald-200/80',
    dotClasses: 'bg-emerald-500',
  },
}

/**
 * Entity type icon mapping
 */
const TYPE_ICONS = {
  task: CheckSquare,
  project: Briefcase,
  payment: CreditCard,
  proposal: FileText,
  lead: Users,
}

function NotificationPopover({ isOpen, onClose }) {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState('all') // 'all' | 'unread'

  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    refreshNotifications,
  } = useNotifications()

  // Close popover on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Filter notifications by All / Unread
  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'unread') {
      return notifications.filter((n) => !n.isRead)
    }
    return notifications
  }, [notifications, activeFilter])

  // Handle clicking a notification item
  const handleItemClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id)
    }
    if (notification.actionUrl) {
      onClose()
      navigate(notification.actionUrl)
    }
  }

  // Handle dismissing a single notification
  const handleDismiss = (e, id) => {
    e.stopPropagation()
    clearNotification(id)
  }

  if (!isOpen) return null

  return (
    <div
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] rounded-xl border border-odw-border bg-white shadow-xl z-50 flex flex-col overflow-hidden text-odw-text"
      role="region"
      aria-label="Notifications panel"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-odw-border px-4 py-3 bg-slate-50/70">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-odw-charcoal">Notifications</h2>
          {unreadCount > 0 && (
            <span className="inline-flex items-center rounded-full bg-odw-primary/10 px-2 py-0.5 text-[11px] font-semibold text-odw-primary">
              {unreadCount} new
            </span>
          )}
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={refreshNotifications}
            disabled={isLoading}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-odw-text-muted hover:bg-white hover:text-odw-text transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh notifications"
            aria-label="Refresh notifications"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-odw-primary hover:bg-odw-primary/10 transition-colors cursor-pointer"
              title="Mark all as read"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Mark all read</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              type="button"
              onClick={clearAllNotifications}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-odw-text-muted hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Clear all notifications"
              aria-label="Clear all notifications"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-odw-text-muted hover:bg-white hover:text-odw-text transition-colors cursor-pointer sm:hidden"
            aria-label="Close notifications panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tabs: All vs Unread */}
      <div className="flex border-b border-odw-border px-4 bg-white text-xs font-medium">
        <button
          type="button"
          onClick={() => setActiveFilter('all')}
          className={`flex items-center gap-1.5 py-2.5 border-b-2 font-medium transition-colors cursor-pointer mr-4 ${
            activeFilter === 'all'
              ? 'border-odw-primary text-odw-primary font-semibold'
              : 'border-transparent text-odw-text-muted hover:text-odw-text'
          }`}
        >
          <span>All</span>
          <span
            className={`rounded-full px-1.5 py-0.2 text-[10px] ${
              activeFilter === 'all'
                ? 'bg-odw-primary/10 text-odw-primary'
                : 'bg-slate-100 text-odw-text-muted'
            }`}
          >
            {notifications.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('unread')}
          className={`flex items-center gap-1.5 py-2.5 border-b-2 font-medium transition-colors cursor-pointer ${
            activeFilter === 'unread'
              ? 'border-odw-primary text-odw-primary font-semibold'
              : 'border-transparent text-odw-text-muted hover:text-odw-text'
          }`}
        >
          <span>Unread</span>
          {unreadCount > 0 && (
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                activeFilter === 'unread'
                  ? 'bg-odw-primary text-white'
                  : 'bg-odw-primary/10 text-odw-primary'
              }`}
            >
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Popover Body */}
      <div className="max-h-[360px] overflow-y-auto divide-y divide-odw-border/60">
        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center p-8 text-center text-odw-text-muted">
            <Loader2 className="h-6 w-6 animate-spin text-odw-primary mb-2" />
            <p className="text-xs">Loading notifications...</p>
          </div>
        )}

        {/* Error state */}
        {!isLoading && error && (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-600 mb-2">
              <AlertCircle className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold text-odw-charcoal">Unable to load notifications</p>
            <p className="text-[11px] text-odw-text-muted mt-0.5">Please check your connection and try again.</p>
            <button
              type="button"
              onClick={refreshNotifications}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-odw-border bg-white px-3 py-1.5 text-xs font-medium text-odw-text hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
            >
              <RotateCw className="h-3 w-3 text-odw-primary" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && filteredNotifications.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-odw-text-subtle mb-3 border border-odw-border">
              {activeFilter === 'unread' ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              ) : (
                <Inbox className="h-6 w-6 text-odw-text-subtle" />
              )}
            </div>
            <p className="text-xs font-semibold text-odw-charcoal">
              {activeFilter === 'unread' ? 'No unread notifications' : "You're all caught up"}
            </p>
            <p className="text-[11px] text-odw-text-muted mt-1 max-w-[220px]">
              {activeFilter === 'unread'
                ? 'All of your notifications have been marked as read.'
                : 'New notifications from projects, tasks, payments, proposals, and leads will appear here.'}
            </p>
          </div>
        )}

        {/* Notifications list */}
        {!isLoading &&
          !error &&
          filteredNotifications.map((notification) => {
            const severity = SEVERITY_CONFIG[notification.severity] || SEVERITY_CONFIG.info
            const TypeIcon = TYPE_ICONS[notification.type] || Bell
            const relativeTime = formatRelativeTime(notification.createdAt)

            return (
              <div
                key={notification.id}
                onClick={() => handleItemClick(notification)}
                className={`group relative flex items-start gap-3 p-3.5 transition-colors cursor-pointer ${
                  notification.isRead
                    ? 'bg-white hover:bg-slate-50/70 text-odw-text-muted'
                    : 'bg-orange-50/20 hover:bg-orange-50/40 text-odw-text'
                }`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleItemClick(notification)
                  }
                }}
              >
                {/* Severity & Type Icon */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs ${severity.badgeClasses}`}
                  title={`${notification.type} (${severity.label})`}
                >
                  <TypeIcon className="h-4 w-4" aria-hidden="true" />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1 pr-6">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-xs ${
                        notification.isRead
                          ? 'font-medium text-slate-700'
                          : 'font-semibold text-odw-charcoal'
                      }`}
                    >
                      {notification.title}
                    </span>

                    {/* Non-color unread indicator */}
                    {!notification.isRead && (
                      <span
                        className="inline-flex items-center gap-1 rounded bg-odw-primary/10 px-1.5 py-0.2 text-[9px] font-bold text-odw-primary uppercase tracking-wider"
                        title="Unread"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-odw-primary" />
                        NEW
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-odw-text-muted mt-0.5 line-clamp-2 leading-relaxed">
                    {notification.message}
                  </p>

                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-odw-text-subtle">
                    <span className="capitalize font-medium text-slate-500">
                      {notification.type}
                    </span>
                    <span>•</span>
                    <span>{relativeTime}</span>
                    {notification.actionUrl && (
                      <>
                        <span>•</span>
                        <span className="text-odw-primary hover:underline">View details</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Individual Dismiss Button */}
                <button
                  type="button"
                  onClick={(e) => handleDismiss(e, notification.id)}
                  className="absolute top-3 right-3 inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Dismiss notification"
                  aria-label="Dismiss notification"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )
          })}
      </div>

      {/* Footer info */}
      <div className="border-t border-odw-border px-4 py-2 bg-slate-50/70 text-[10px] text-odw-text-muted flex items-center justify-between">
        <span>Derived from live CRM activity</span>
        {filteredNotifications.length > 0 && (
          <span>Showing {filteredNotifications.length} of {notifications.length}</span>
        )}
      </div>
    </div>
  )
}

export default NotificationPopover
