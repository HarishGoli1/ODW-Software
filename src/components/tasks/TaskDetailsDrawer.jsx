import { useEffect } from 'react'
import {
  X,
  Calendar,
  User,
  Clock,
  ArrowRight,
  CheckSquare,
  CheckCircle2,
  FolderKanban,
} from 'lucide-react'
import TaskStatusBadge from './TaskStatusBadge'
import TaskPriorityBadge from './TaskPriorityBadge'

function TaskDetailsDrawer({
  task,
  project,
  projectTasks = [],
  isOpen,
  onClose,
  onEdit = () => {},
  onDelete = () => {},
  canEdit = true,
  canDelete = true,
}) {
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

  if (!isOpen || !task) return null

  // Calculate project progress from its tasks
  const totalTasks = projectTasks.length
  const completedTasks = projectTasks.filter((t) => t.status === 'Completed').length
  const projectProgress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Calculate deadline plan (relative to mock system date Oct 05, 2026)
  const getDeadlineStatus = (deadlineStr, status) => {
    if (status === 'Completed') return 'Completed'
    try {
      const deadlineDate = new Date(deadlineStr)
      const now = new Date('2026-10-05')
      if (isNaN(deadlineDate.getTime())) return deadlineStr

      const diffTime = deadlineDate.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays > 1) return `${diffDays} days remaining`
      if (diffDays === 1) return '1 day remaining'
      if (diffDays === 0) return 'Due today'
      return `Overdue by ${Math.abs(diffDays)} days`
    } catch {
      return deadlineStr
    }
  }

  const deadlinePlanText = getDeadlineStatus(task.deadline, task.status)
  const isCompleted = task.status === 'Completed'

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-details-title"
    >
      {/* Dimmed & Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <aside
          className="w-screen max-w-[420px] sm:max-w-[460px] bg-white shadow-2xl border-l border-odw-border flex flex-col justify-between"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 1. Drawer Header */}
          <div className="border-b border-odw-border p-5 shrink-0 bg-white">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm shrink-0 border mt-0.5 ${
                    isCompleted
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200/60'
                      : 'bg-orange-50 text-odw-primary border-orange-200/60'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <CheckSquare className="h-5 w-5" />
                  )}
                </div>

                <div className="min-w-0">
                  <h2
                    id="task-details-title"
                    className="text-base sm:text-lg font-bold text-odw-text truncate"
                  >
                    {task.taskName}
                  </h2>
                  <p className="text-xs text-odw-text-muted mt-0.5 truncate">
                    {project ? project.projectName : task.projectName} ·{' '}
                    {project ? project.company : task.company}
                  </p>
                </div>
              </div>

              {/* Close Button */}
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

          {/* 2. Drawer Body (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50/70 rounded-xl p-3.5 border border-slate-100 text-xs">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-odw-text-muted block mb-1">
                  Status
                </span>
                <TaskStatusBadge status={task.status} />
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-odw-text-muted block mb-1">
                  Priority
                </span>
                <TaskPriorityBadge priority={task.priority} />
              </div>

              <div className="pt-2 border-t border-slate-200/60">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-odw-text-muted block mb-1">
                  Deadline
                </span>
                <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>{task.deadline}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-odw-text-muted block mb-1">
                  Assigned To
                </span>
                <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-slate-700 font-bold text-[10px]">
                    {task.assignedTo ? task.assignedTo.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span>{task.assignedTo}</span>
                </div>
              </div>
            </div>

            {/* WHAT NEEDS TO BE DONE */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                What Needs To Be Done
              </h3>
              <p className="text-xs text-slate-600 bg-white p-3.5 rounded-lg border border-odw-border leading-relaxed">
                {task.description || 'No detailed instructions provided.'}
              </p>
            </div>

            {/* PROJECT PROGRESS */}
            <div className="space-y-2 rounded-lg border border-odw-border bg-white p-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-odw-text">Project Progress</span>
                <span className="font-bold text-odw-text">{projectProgress}%</span>
              </div>

              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200/60">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    projectProgress === 100
                      ? 'bg-emerald-500'
                      : projectProgress >= 60
                      ? 'bg-odw-primary'
                      : projectProgress > 0
                      ? 'bg-amber-500'
                      : 'bg-slate-300'
                  }`}
                  style={{ width: `${projectProgress}%` }}
                />
              </div>

              <p className="text-[11px] text-odw-text-muted">
                {totalTasks > 0
                  ? `${completedTasks} / ${totalTasks} project tasks completed`
                  : 'No tasks registered'}
              </p>
            </div>

            {/* DEADLINE PLAN */}
            <div className="space-y-2 rounded-lg border border-odw-border bg-white p-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-odw-text">Deadline Plan</span>
                <span
                  className={`font-semibold text-xs ${
                    isCompleted
                      ? 'text-emerald-600'
                      : deadlinePlanText.includes('Overdue')
                      ? 'text-rose-600'
                      : 'text-odw-primary'
                  }`}
                >
                  {deadlinePlanText}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 text-xs">
                <span className="text-[10px] uppercase font-semibold text-odw-text-muted block mb-0.5">
                  Next Action
                </span>
                <p className="text-slate-600 leading-relaxed">
                  {isCompleted
                    ? 'Task is finished. Verified and ready for delivery.'
                    : `Finish ${task.taskName.toLowerCase()} and send it for client review.`}
                </p>
              </div>
            </div>
          </div>

          {/* 3. Drawer Footer */}
          <div className="border-t border-odw-border p-4 bg-slate-50/70 shrink-0 flex items-center justify-between">
            {canDelete ? (
              <button
                type="button"
                onClick={() => onDelete(task)}
                className="rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                Delete Task
              </button>
            ) : <div />}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-odw-border bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Close
              </button>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(task)}
                  className="rounded-lg bg-odw-primary px-4 py-2 text-xs font-semibold text-white hover:bg-odw-primary-hover transition-colors cursor-pointer"
                >
                  Edit Task
                </button>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default TaskDetailsDrawer
