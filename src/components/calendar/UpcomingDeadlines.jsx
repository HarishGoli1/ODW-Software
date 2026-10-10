import { Clock, Calendar, ArrowRight, FolderKanban } from 'lucide-react'
import TaskStatusBadge from '../tasks/TaskStatusBadge'
import TaskPriorityBadge from '../tasks/TaskPriorityBadge'
import {
  normalizeDeadline,
  getTodayKey,
  formatShortDisplayDate,
  getRelativeDeadlineStatus,
} from '../../utils/calendarUtils'

function UpcomingDeadlines({ tasks = [], onSelectDate }) {
  const todayKey = getTodayKey()

  // Filter tasks: deadline >= today, status !== 'Completed'
  const upcomingTasks = tasks
    .filter((task) => {
      const norm = normalizeDeadline(task.deadline)
      if (!norm) return false
      return norm >= todayKey && task.status !== 'Completed'
    })
    .sort((a, b) => {
      const normA = normalizeDeadline(a.deadline)
      const normB = normalizeDeadline(b.deadline)
      return normA.localeCompare(normB)
    })
    .slice(0, 5)

  return (
    <section aria-labelledby="upcoming-deadlines-title" className="space-y-3">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
        <div>
          <h2
            id="upcoming-deadlines-title"
            className="text-base font-bold text-odw-text flex items-center gap-2"
          >
            <Clock className="h-4 w-4 text-odw-primary" />
            Upcoming Deadlines
          </h2>
          <p className="text-xs text-odw-text-muted">
            Top pending project tasks ordered by nearest due date.
          </p>
        </div>
        <span className="text-xs font-medium text-odw-text-muted">
          Showing {upcomingTasks.length} {upcomingTasks.length === 1 ? 'task' : 'tasks'}
        </span>
      </div>

      {/* List or Empty State */}
      {upcomingTasks.length === 0 ? (
        <div className="rounded-xl border border-odw-border bg-white p-8 text-center space-y-2">
          <p className="text-sm font-semibold text-odw-text">
            No upcoming deadlines.
          </p>
          <p className="text-xs text-odw-text-muted">
            All current task milestones are either completed or past due.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {upcomingTasks.map((task) => {
            const deadlineKey = normalizeDeadline(task.deadline)
            const formattedDate = formatShortDisplayDate(task.deadline)
            const remainingText = getRelativeDeadlineStatus(
              task.deadline,
              task.status
            )

            return (
              <div
                key={task.id}
                onClick={() => onSelectDate && onSelectDate(deadlineKey)}
                className="group flex flex-col justify-between rounded-xl border border-odw-border bg-white p-4 shadow-2xs hover:border-odw-primary hover:shadow-xs transition-all cursor-pointer"
              >
                <div className="space-y-2.5">
                  {/* Deadline & Remaining pill */}
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-800">
                      <Calendar className="h-3.5 w-3.5 text-odw-primary" />
                      {formattedDate}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-odw-primary border border-orange-200/60">
                      {remainingText}
                    </span>
                  </div>

                  {/* Task Name */}
                  <h3 className="text-xs sm:text-sm font-bold text-odw-text line-clamp-2 group-hover:text-odw-primary transition-colors">
                    {task.taskName}
                  </h3>

                  {/* Project & Client */}
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-slate-700 truncate">
                      {task.projectName}
                    </p>
                    <p className="text-[11px] text-odw-text-muted truncate">
                      {task.company || task.clientName}
                    </p>
                  </div>
                </div>

                {/* Footer Badges & Assignee */}
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-1 text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <TaskPriorityBadge priority={task.priority} />
                    <TaskStatusBadge status={task.status} />
                  </div>

                  <div
                    title={`Assigned to ${task.assignedTo}`}
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] border border-slate-200"
                  >
                    {task.assignedTo ? task.assignedTo.charAt(0).toUpperCase() : 'U'}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default UpcomingDeadlines
