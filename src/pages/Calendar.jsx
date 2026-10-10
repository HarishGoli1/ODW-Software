import { useState, useMemo, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { getTasks } from '../services/tasksService'
import {
  getCalendarGrid,
  formatMonthYear,
  normalizeDeadline,
} from '../utils/calendarUtils'
import DateTasksDrawer from '../components/calendar/DateTasksDrawer'
import UpcomingDeadlines from '../components/calendar/UpcomingDeadlines'

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function Calendar() {
  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)

  // Calendar view year and month (initialized to user's system current date)
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Fetch live tasks from Supabase
  const loadTasks = useCallback(async () => {
    setIsLoading(true)
    setFetchError(null)
    try {
      const data = await getTasks()
      setTasks(Array.isArray(data) ? data : data?.tasks || [])
    } catch (err) {
      console.error('Failed to load calendar tasks:', err)
      setFetchError(err?.message || 'Unable to load calendar tasks.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const viewYear = currentDate.getFullYear()
  const viewMonth = currentDate.getMonth()

  // Map tasks by normalized deadline string ('YYYY-MM-DD') for fast lookup
  const tasksByDate = useMemo(() => {
    const map = {}
    tasks.forEach((task) => {
      const norm = normalizeDeadline(task.deadline)
      if (norm) {
        if (!map[norm]) {
          map[norm] = []
        }
        map[norm].push(task)
      }
    })
    return map
  }, [tasks])

  // Generate grid cells for current view
  const calendarCells = useMemo(() => {
    return getCalendarGrid(viewYear, viewMonth)
  }, [viewYear, viewMonth])

  // Count total deadlines falling in the current viewed month
  const totalMonthDeadlines = useMemo(() => {
    return calendarCells.reduce((acc, cell) => {
      if (cell.isCurrentMonth && tasksByDate[cell.dateString]) {
        return acc + tasksByDate[cell.dateString].length
      }
      return acc
    }, 0)
  }, [calendarCells, tasksByDate])

  // Handlers for month navigation
  const handlePrevMonth = () => {
    setCurrentDate((prev) => {
      const prevDate = new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
      return prevDate
    })
  }

  const handleNextMonth = () => {
    setCurrentDate((prev) => {
      const nextDate = new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
      return nextDate
    })
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleCellClick = (dateString) => {
    setSelectedDate(dateString)
    setIsDrawerOpen(true)
  }

  const selectedDateTasks = useMemo(() => {
    if (!selectedDate) return []
    return tasksByDate[selectedDate] || []
  }, [selectedDate, tasksByDate])

  return (
    <div className="space-y-6">
      {/* 1. Header: Breadcrumbs & Title */}
      <div>
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs text-odw-text-muted"
        >
          <Link
            to="/dashboard"
            className="hover:text-odw-primary transition-colors font-medium"
          >
            Dashboard
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-odw-text font-semibold">Calendar</span>
        </nav>
        <h1 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-odw-text">
          Calendar
        </h1>
        <p className="mt-0.5 text-xs sm:text-sm text-odw-text-muted">
          View your task deadlines and upcoming work.
        </p>
      </div>

      {/* 2. Calendar Card Container */}
      <div className="rounded-xl border border-odw-border bg-white shadow-2xs overflow-hidden">
        {/* Month Toolbar */}
        <div className="p-4 sm:p-5 border-b border-odw-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white">
          <div className="flex items-center gap-2">
            {/* Prev Month */}
            <button
              type="button"
              onClick={handlePrevMonth}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-odw-border bg-white text-slate-600 hover:bg-slate-50 hover:text-odw-text transition-colors cursor-pointer"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Current Month & Year */}
            <h2 className="text-base sm:text-lg font-bold text-odw-text px-2 min-w-[150px] text-center sm:text-left">
              {formatMonthYear(viewYear, viewMonth)}
            </h2>

            {/* Next Month */}
            <button
              type="button"
              onClick={handleNextMonth}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-odw-border bg-white text-slate-600 hover:bg-slate-50 hover:text-odw-text transition-colors cursor-pointer"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Today Button */}
            <button
              type="button"
              onClick={handleToday}
              className="ml-1 sm:ml-2 rounded-lg border border-odw-border bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Today
            </button>
          </div>

          {/* Month Summary Info */}
          <div className="flex items-center gap-2 text-xs text-odw-text-muted">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
              <Clock className="h-3.5 w-3.5 text-odw-primary" />
              <span>
                {totalMonthDeadlines}{' '}
                {totalMonthDeadlines === 1 ? 'Deadline' : 'Deadlines'} This Month
              </span>
            </span>
          </div>
        </div>

        {/* Calendar Grid Container */}
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-odw-primary" />
            <p className="text-xs font-medium text-odw-text-muted">
              Loading calendar deadlines from Supabase...
            </p>
          </div>
        ) : fetchError ? (
          <div className="p-12 flex flex-col items-center justify-center gap-2 text-center bg-rose-50/50">
            <AlertCircle className="h-6 w-6 text-rose-500" />
            <p className="text-xs font-semibold text-rose-800">{fetchError}</p>
            <button
              type="button"
              onClick={loadTasks}
              className="mt-2 text-xs font-semibold text-odw-primary hover:underline cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="p-2 sm:p-4">
            {/* 7-Column Day Header (Monday-first) */}
            <div className="grid grid-cols-7 border-b border-odw-border pb-2 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
              {WEEK_DAYS.map((day) => (
                <div key={day} className="py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Grid Cells */}
            <div className="grid grid-cols-7 border-l border-t border-odw-border">
              {calendarCells.map((cell) => {
                const cellTasks = tasksByDate[cell.dateString] || []
                const hasTasks = cellTasks.length > 0
                const isToday = cell.isToday
                const isCurrentMonth = cell.isCurrentMonth

                return (
                  <div
                    key={cell.dateString}
                    onClick={() => handleCellClick(cell.dateString)}
                    className={`min-h-[85px] sm:min-h-[105px] border-r border-b border-odw-border p-1.5 sm:p-2 flex flex-col justify-between transition-colors cursor-pointer ${
                      isCurrentMonth ? 'bg-white' : 'bg-slate-50/60'
                    } ${
                      isToday ? 'bg-orange-50/30 ring-1 ring-inset ring-odw-primary/40' : ''
                    } hover:bg-slate-50`}
                  >
                    {/* Cell Header: Day Number */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs sm:text-sm font-semibold inline-flex items-center justify-center h-6 w-6 rounded-full ${
                          isToday
                            ? 'bg-odw-primary text-white font-bold shadow-2xs'
                            : isCurrentMonth
                            ? 'text-odw-text'
                            : 'text-slate-400'
                        }`}
                      >
                        {cell.dayNumber}
                      </span>

                      {/* Small dot on mobile if tasks exist */}
                      {hasTasks && (
                        <span className="sm:hidden flex h-2 w-2 rounded-full bg-odw-primary" />
                      )}
                    </div>

                    {/* Cell Body: Task Chips */}
                    <div className="mt-1 space-y-1 overflow-hidden">
                      {hasTasks && (
                        <>
                          {/* Desktop task items (up to 2) */}
                          <div className="hidden sm:block space-y-1">
                            {cellTasks.slice(0, 2).map((t) => {
                              const isComp = t.status === 'Completed'
                              return (
                                <div
                                  key={t.id}
                                  title={`${t.taskName} (${t.status})`}
                                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium truncate border ${
                                    isComp
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                                      : 'bg-orange-50 text-odw-primary border-orange-200/60'
                                  }`}
                                >
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                                      isComp ? 'bg-emerald-500' : 'bg-odw-primary'
                                    }`}
                                  />
                                  <span className="truncate">{t.taskName}</span>
                                </div>
                              )
                            })}
                            {cellTasks.length > 2 && (
                              <span className="block text-[10px] font-medium text-slate-500 pl-1">
                                +{cellTasks.length - 2} more
                              </span>
                            )}
                          </div>

                          {/* Mobile task pill */}
                          <div className="sm:hidden">
                            <span className="inline-block text-[9px] font-semibold text-odw-primary bg-orange-50 px-1 py-0.5 rounded">
                              {cellTasks.length} {cellTasks.length === 1 ? 'task' : 'tasks'}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. Upcoming Deadlines Section */}
      <UpcomingDeadlines
        tasks={tasks}
        onSelectDate={handleCellClick}
      />

      {/* 4. Slide-over Date Tasks Drawer */}
      <DateTasksDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        selectedDateString={selectedDate}
        tasks={selectedDateTasks}
      />
    </div>
  )
}

export default Calendar
