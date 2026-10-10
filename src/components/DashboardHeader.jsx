import { useMemo, useState, useRef, useEffect } from 'react'
import { Bell, Calendar } from 'lucide-react'
import { useNotifications } from '../context/NotificationContext'
import NotificationPopover from './NotificationPopover'

function DashboardHeader() {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const notificationRef = useRef(null)
  const { unreadCount } = useNotifications()

  // Outside click listener to dismiss notification popover
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationsOpen(false)
      }
    }

    if (isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isNotificationsOpen])

  // Compute greeting dynamically based on local browser time
  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) {
      return 'Good morning, ODW Team'
    } else if (hour >= 12 && hour < 17) {
      return 'Good afternoon, ODW Team'
    } else {
      return 'Good evening, ODW Team'
    }
  }, [])

  // Format dynamic browser local date
  const formattedDate = useMemo(() => {
    const now = new Date()
    return now.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }, [])

  return (
    <header className="flex flex-col gap-4 pb-6 border-b border-odw-border md:flex-row md:items-center md:justify-between">
      {/* Left: Dynamic Greeting & Supporting Text */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-odw-charcoal">
            {greeting}
          </h1>
          <span
            className="inline-block h-2 w-2 rounded-full bg-odw-primary animate-pulse"
            title="System Active"
            aria-hidden="true"
          />
        </div>
        <p className="text-sm text-odw-text-muted">
          Here's your business overview for today.
        </p>
      </div>

      {/* Right: Date, Notifications, Workspace Profile */}
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
        {/* Current Date Display */}
        <div className="inline-flex items-center gap-2 rounded-lg border border-odw-border bg-white px-3 py-1.5 text-xs font-medium text-odw-text-muted shadow-2xs">
          <Calendar className="h-3.5 w-3.5 text-odw-primary shrink-0" aria-hidden="true" />
          <span className="truncate">{formattedDate}</span>
        </div>

        {/* Notification Bell & Popover */}
        <div ref={notificationRef} className="relative">
          <button
            type="button"
            onClick={() => setIsNotificationsOpen((prev) => !prev)}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-odw-border bg-white text-odw-text-muted hover:bg-slate-50 hover:text-odw-text transition-colors shadow-2xs focus-visible:outline-2 focus-visible:outline-odw-primary cursor-pointer"
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
            aria-expanded={isNotificationsOpen}
            aria-haspopup="true"
            title="Notifications"
          >
            <Bell className="h-4 w-4" aria-hidden="true" />
            {unreadCount > 0 && (
              <span
                className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-odw-primary px-1 text-[10px] font-bold text-white shadow-xs"
                aria-hidden="true"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          <NotificationPopover
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
          />
        </div>

        {/* Compact Workspace Identity */}
        <div className="inline-flex items-center gap-2.5 rounded-lg border border-odw-border bg-white px-2.5 py-1.5 shadow-2xs">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-odw-charcoal text-white text-[11px] font-semibold tracking-wider shrink-0">
            ODW
          </div>
          <div className="min-w-0 pr-1 text-left hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" aria-hidden="true" />
              <p className="truncate text-xs font-semibold text-odw-text leading-tight">
                ODW Team
              </p>
            </div>
            <p className="truncate text-[10px] text-odw-text-muted leading-tight">
              Internal Workspace
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader
