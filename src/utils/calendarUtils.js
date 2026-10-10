/**
 * Calendar Utilities
 * Date parsing, Monday-first calendar grid calculations, and deadline helpers.
 */

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const MONTH_ABBR = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

/**
 * Normalizes any deadline format to 'YYYY-MM-DD'.
 * Handles 'Oct 08, 2026', '2026-10-08', ISO strings, etc.
 * Returns null if input is missing or invalid.
 */
export function normalizeDeadline(val) {
  if (!val) return null

  if (typeof val === 'string') {
    const trimmed = val.trim()
    // Already in YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed
    }
    // Starts with YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.slice(0, 10)
    }

    // Try 'MMM DD, YYYY' format like 'Oct 08, 2026' or 'Oct 8, 2026'
    const parts = trimmed.match(/^([A-Za-z]{3})\s+(\d{1,2}),?\s+(\d{4})$/)
    if (parts) {
      const monthIdx = MONTH_ABBR.findIndex(
        (m) => m.toLowerCase() === parts[1].toLowerCase()
      )
      if (monthIdx !== -1) {
        const year = parts[3]
        const month = String(monthIdx + 1).padStart(2, '0')
        const day = String(parseInt(parts[2], 10)).padStart(2, '0')
        return `${year}-${month}-${day}`
      }
    }
  }

  // Fallback to JS Date constructor
  const d = new Date(val)
  if (isNaN(d.getTime())) return null

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Format year, month (0-indexed), and day into 'YYYY-MM-DD'.
 */
export function formatDateKey(year, month, day) {
  const m = String(month + 1).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${year}-${m}-${d}`
}

/**
 * Get normalized string for today: 'YYYY-MM-DD'
 */
export function getTodayKey() {
  const now = new Date()
  return formatDateKey(now.getFullYear(), now.getMonth(), now.getDate())
}

/**
 * Formats 'YYYY-MM-DD' or date object to 'Month YYYY', e.g. 'October 2026'
 */
export function formatMonthYear(year, month) {
  return `${MONTH_NAMES[month]} ${year}`
}

/**
 * Formats 'YYYY-MM-DD' to 'Monday, October 8, 2026'
 */
export function formatFullDisplayDate(dateStr) {
  if (!dateStr) return ''
  const normalized = normalizeDeadline(dateStr)
  if (!normalized) return dateStr

  const [yearStr, monthStr, dayStr] = normalized.split('-')
  const year = parseInt(yearStr, 10)
  const month = parseInt(monthStr, 10) - 1
  const day = parseInt(dayStr, 10)

  const d = new Date(year, month, day)
  const dayName = DAY_NAMES[d.getDay()]
  const monthName = MONTH_NAMES[month]

  return `${dayName}, ${monthName} ${day}, ${year}`
}

/**
 * Formats 'YYYY-MM-DD' to 'Oct 08, 2026'
 */
export function formatShortDisplayDate(dateStr) {
  if (!dateStr) return ''
  const normalized = normalizeDeadline(dateStr)
  if (!normalized) return dateStr

  const [yearStr, monthStr, dayStr] = normalized.split('-')
  const month = parseInt(monthStr, 10) - 1
  const day = String(parseInt(dayStr, 10)).padStart(2, '0')

  return `${MONTH_ABBR[month]} ${day}, ${yearStr}`
}

/**
 * Returns human-readable relative days remaining string.
 */
export function getRelativeDeadlineStatus(deadlineStr, status) {
  if (status === 'Completed') return 'Completed'
  const normDeadline = normalizeDeadline(deadlineStr)
  if (!normDeadline) return deadlineStr

  const todayKey = getTodayKey()
  if (normDeadline === todayKey) return 'Due today'

  const [tY, tM, tD] = todayKey.split('-').map(Number)
  const [dY, dM, dD] = normDeadline.split('-').map(Number)

  const todayDate = new Date(tY, tM - 1, tD)
  const deadlineDate = new Date(dY, dM - 1, dD)

  const diffTime = deadlineDate.getTime() - todayDate.getTime()
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 1) return '1 day remaining'
  if (diffDays > 1) return `${diffDays} days remaining`
  if (diffDays === -1) return 'Overdue by 1 day'
  return `Overdue by ${Math.abs(diffDays)} days`
}

/**
 * Generates Monday-first calendar grid cells for given year and month (0-indexed).
 * Returns array of cells:
 * [
 *   {
 *     dateString: '2026-09-28',
 *     dayNumber: 28,
 *     isCurrentMonth: false,
 *     isToday: false,
 *     year: 2026,
 *     month: 8,
 *     day: 28
 *   },
 *   ...
 * ]
 */
export function getCalendarGrid(year, month) {
  const todayKey = getTodayKey()

  const firstDayOfMonth = new Date(year, month, 1)
  // Monday start: 0 = Mon, ..., 6 = Sun
  const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7

  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const cells = []

  // 1. Previous month trailing overflow days
  const prevMonthIndex = month === 0 ? 11 : month - 1
  const prevMonthYear = month === 0 ? year - 1 : year
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i
    const dateString = formatDateKey(prevMonthYear, prevMonthIndex, day)
    cells.push({
      dateString,
      dayNumber: day,
      isCurrentMonth: false,
      isToday: dateString === todayKey,
      year: prevMonthYear,
      month: prevMonthIndex,
      day,
    })
  }

  // 2. Current month days
  for (let day = 1; day <= daysInCurrentMonth; day++) {
    const dateString = formatDateKey(year, month, day)
    cells.push({
      dateString,
      dayNumber: day,
      isCurrentMonth: true,
      isToday: dateString === todayKey,
      year,
      month,
      day,
    })
  }

  // 3. Next month leading overflow days to complete the weeks
  const totalDaysSoFar = cells.length
  const totalRequiredCells = Math.ceil(totalDaysSoFar / 7) * 7
  const nextMonthDaysToAdd = totalRequiredCells - totalDaysSoFar

  const nextMonthIndex = month === 11 ? 0 : month + 1
  const nextMonthYear = month === 11 ? year + 1 : year
  for (let day = 1; day <= nextMonthDaysToAdd; day++) {
    const dateString = formatDateKey(nextMonthYear, nextMonthIndex, day)
    cells.push({
      dateString,
      dayNumber: day,
      isCurrentMonth: false,
      isToday: dateString === todayKey,
      year: nextMonthYear,
      month: nextMonthIndex,
      day,
    })
  }

  return cells
}
