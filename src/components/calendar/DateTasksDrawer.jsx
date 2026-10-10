import { useState, useEffect } from 'react'
import {
  X,
  Calendar,
  User,
  Clock,
  ChevronDown,
  ChevronUp,
  FolderKanban,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react'
import TaskStatusBadge from '../tasks/TaskStatusBadge'
import TaskPriorityBadge from '../tasks/TaskPriorityBadge'
import {
  formatFullDisplayDate,
  getRelativeDeadlineStatus,
} from '../../utils/calendarUtils'

function DateTasksDrawer({
  isOpen,
  onClose,
  selectedDateString,
  tasks = [],
}) {
  const [expandedTaskId, setExpandedTaskId] = useState(null)

  // Reset expanded task when drawer closes or date changes
  useEffect(() => {
    if (!isOpen) {
      setExpandedTaskId(null)
    }
  }, [isOpen, selectedDateString])

  // ESC key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const formattedDate = formatFullDisplayDate(selectedDateString)
  const taskCount = tasks.length

  const toggleExpand = (taskId) => {
    setExpandedTaskId((prev) => (prev === taskId ? null : taskId))
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="date-tasks-drawer-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <aside
          className="w-screen max-w-[440px] sm:max-w-[480px] bg-white shadow-2xl border-l border-odw-border flex flex-col justify-between"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-odw-border p-5 shrink-0 bg-white">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-odw-primary border border-orange-200/60 shrink-0 mt-0.5">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2
                    id="date-tasks-drawer-title"
                    className="text-base sm:text-lg font-bold text-odw-text truncate"
                  >
                    {formattedDate || 'Scheduled Deadlines'}
                  </h2>
                  <p className="text-xs text-odw-text-muted mt-0.5">
                    {taskCount === 0
                      ? 'No tasks scheduled'
                      : `${taskCount} ${taskCount === 1 ? 'task deadline' : 'task deadlines'}`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                aria-label="Close drawer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {taskCount === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 border border-slate-200 text-slate-400">
                  <Calendar className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-odw-text">
                    No tasks scheduled for this date.
                  </h3>
                  <p className="text-xs text-odw-text-muted max-w-xs mx-auto">
                    There are no task deadlines due on this day. Select another date on the calendar to view its schedule.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => {
                  const isExpanded = expandedTaskId === task.id
                  const deadlinePlan = getRelativeDeadlineStatus(
                    task.deadline,
                    task.status
                  )
                  const isCompleted = task.status === 'Completed'

                  return (
                    <div
                      key={task.id}
                      className="rounded-xl border border-odw-border bg-white shadow-2xs transition-all hover:border-slate-300"
                    >
                      {/* Task Summary Card */}
                      <div className="p-4 space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-odw-text line-clamp-2">
                            {task.taskName}
                          </h4>
                          <TaskPriorityBadge priority={task.priority} />
                        </div>

                        {/* Project / Company info */}
                        <div className="flex items-center gap-1.5 text-xs text-odw-text-muted">
                          <FolderKanban className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                          <span className="truncate font-medium text-slate-700">
                            {task.projectName}
                          </span>
                          <span>·</span>
                          <span className="truncate text-slate-500">
                            {task.company || task.clientName}
                          </span>
                        </div>

                        {/* Status & Assignee Bar */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                          <TaskStatusBadge status={task.status} />

                          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] border border-slate-200">
                              {task.assignedTo ? task.assignedTo.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <span className="text-xs">{task.assignedTo}</span>
                          </div>
                        </div>

                        {/* Toggle Expand / Collapse button */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span
                            className={`text-[11px] font-medium ${
                              isCompleted
                                ? 'text-emerald-600'
                                : deadlinePlan.includes('Overdue')
                                ? 'text-rose-600'
                                : 'text-odw-primary'
                            }`}
                          >
                            {deadlinePlan}
                          </span>

                          <button
                            type="button"
                            onClick={() => toggleExpand(task.id)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-odw-primary transition-colors cursor-pointer"
                          >
                            <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                            {isExpanded ? (
                              <ChevronUp className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expandable Task Detail Section */}
                      {isExpanded && (
                        <div className="border-t border-slate-100 bg-slate-50/70 p-4 rounded-b-xl space-y-3 text-xs">
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-odw-text-muted block mb-1">
                              What Needs To Be Done
                            </span>
                            <p className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-odw-border leading-relaxed">
                              {task.description || 'No detailed instructions provided.'}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-white p-2.5 rounded-lg border border-odw-border">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-odw-text-muted block">
                                Deadline
                              </span>
                              <span className="font-semibold text-slate-800">
                                {task.deadline}
                              </span>
                            </div>
                            <div className="bg-white p-2.5 rounded-lg border border-odw-border">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-odw-text-muted block">
                                Service Scope
                              </span>
                              <span className="font-semibold text-slate-800 truncate block">
                                {task.service || 'Project Deliverable'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-odw-border p-4 bg-slate-50/70 shrink-0 flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-odw-border bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default DateTasksDrawer
