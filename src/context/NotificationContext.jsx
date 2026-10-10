import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from './AuthContext'
import { getNotifications } from '../services/notificationsService'

const NotificationContext = createContext({
  notifications: [],
  unreadCount: 0,
  isLoading: true,
  error: null,
  markAsRead: () => {},
  markAllAsRead: () => {},
  clearNotification: () => {},
  clearAllNotifications: () => {},
  refreshNotifications: async () => {},
})

/**
 * Safe LocalStorage helpers with resilient JSON parsing
 */
const getStoredIds = (key) => {
  if (!key) return []
  try {
    const item = window.localStorage.getItem(key)
    if (!item) return []
    const parsed = JSON.parse(item)
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    console.warn(`[NotificationContext] Failed to parse localStorage key "${key}":`, err)
    return []
  }
}

const setStoredIds = (key, ids) => {
  if (!key) return
  try {
    window.localStorage.setItem(key, JSON.stringify(ids))
  } catch (err) {
    console.warn(`[NotificationContext] Failed to write to localStorage key "${key}":`, err)
  }
}

export function NotificationProvider({ children }) {
  const { user, employee, loading: authLoading } = useAuth()

  const [rawNotifications, setRawNotifications] = useState([])
  const [readIds, setReadIds] = useState([])
  const [dismissedIds, setDismissedIds] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Use employee UUID if available, fallback to user ID
  const employeeId = employee?.id || user?.id || null
  const readStorageKey = employeeId ? `odw_read_notifs_${employeeId}` : null
  const dismissedStorageKey = employeeId ? `odw_dismissed_notifs_${employeeId}` : null

  // Fetch notifications from service
  const fetchNotifications = useCallback(async (currentEmployee) => {
    if (!currentEmployee) {
      setRawNotifications([])
      setIsLoading(false)
      setError(null)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const data = await getNotifications(currentEmployee)
      setRawNotifications(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('[NotificationContext] Failed to fetch notifications:', err)
      setError(err)
      setRawNotifications([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Sync state whenever employee or auth status changes
  useEffect(() => {
    if (authLoading) {
      setIsLoading(true)
      return
    }

    if (!employee) {
      setRawNotifications([])
      setReadIds([])
      setDismissedIds([])
      setIsLoading(false)
      setError(null)
      return
    }

    // Load persisted read & dismissed lists for this specific employee
    if (readStorageKey) {
      setReadIds(getStoredIds(readStorageKey))
    }
    if (dismissedStorageKey) {
      setDismissedIds(getStoredIds(dismissedStorageKey))
    }

    // Initial load of live notifications
    fetchNotifications(employee)
  }, [authLoading, employee, readStorageKey, dismissedStorageKey, fetchNotifications])

  // Derive notifications excluding dismissed ones and applying read status
  const notifications = useMemo(() => {
    return rawNotifications
      .filter((n) => !dismissedIds.includes(n.id))
      .map((n) => ({
        ...n,
        isRead: readIds.includes(n.id),
      }))
  }, [rawNotifications, dismissedIds, readIds])

  // Derive unread count dynamically
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length
  }, [notifications])

  // Mark single notification as read
  const markAsRead = useCallback(
    (id) => {
      if (!id) return
      setReadIds((prev) => {
        if (prev.includes(id)) return prev
        const updated = [...prev, id]
        if (readStorageKey) {
          setStoredIds(readStorageKey, updated)
        }
        return updated
      })
    },
    [readStorageKey]
  )

  // Mark all active notifications as read
  const markAllAsRead = useCallback(() => {
    const activeIds = notifications.map((n) => n.id)
    if (activeIds.length === 0) return

    setReadIds((prev) => {
      const merged = Array.from(new Set([...prev, ...activeIds]))
      if (readStorageKey) {
        setStoredIds(readStorageKey, merged)
      }
      return merged
    })
  }, [notifications, readStorageKey])

  // Dismiss a single notification
  const clearNotification = useCallback(
    (id) => {
      if (!id) return
      setDismissedIds((prev) => {
        if (prev.includes(id)) return prev
        const updated = [...prev, id]
        if (dismissedStorageKey) {
          setStoredIds(dismissedStorageKey, updated)
        }
        return updated
      })
    },
    [dismissedStorageKey]
  )

  // Dismiss all active notifications
  const clearAllNotifications = useCallback(() => {
    const activeIds = notifications.map((n) => n.id)
    if (activeIds.length === 0) return

    setDismissedIds((prev) => {
      const merged = Array.from(new Set([...prev, ...activeIds]))
      if (dismissedStorageKey) {
        setStoredIds(dismissedStorageKey, merged)
      }
      return merged
    })
  }, [notifications, dismissedStorageKey])

  // Refresh notifications on demand
  const refreshNotifications = useCallback(async () => {
    if (!employee) return
    await fetchNotifications(employee)
  }, [employee, fetchNotifications])

  const value = {
    notifications,
    unreadCount,
    isLoading: authLoading || isLoading,
    error,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    refreshNotifications,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

export default NotificationContext
