import { ListTodo, Clock, PlayCircle, Eye, CheckCircle2, AlertOctagon } from 'lucide-react'

function ProjectTaskProgress({ tasks = [] }) {
  const totalTasks = tasks.length
  const todoTasks = tasks.filter((t) => t.status === 'To Do').length
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress').length
  const reviewTasks = tasks.filter((t) => t.status === 'Review').length
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length
  const blockedTasks = tasks.filter((t) => t.status === 'Blocked').length

  const progress =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)

  const summaryCards = [
    {
      label: 'Total Tasks',
      value: totalTasks,
      icon: ListTodo,
      color: 'text-slate-700',
      bg: 'bg-slate-100',
    },
    {
      label: 'To Do',
      value: todoTasks,
      icon: Clock,
      color: 'text-blue-700',
      bg: 'bg-blue-50',
    },
    {
      label: 'In Progress',
      value: inProgressTasks,
      icon: PlayCircle,
      color: 'text-odw-primary',
      bg: 'bg-orange-50',
    },
    {
      label: 'Review',
      value: reviewTasks,
      icon: Eye,
      color: 'text-purple-700',
      bg: 'bg-purple-50',
    },
    {
      label: 'Completed',
      value: completedTasks,
      icon: CheckCircle2,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
    },
  ]

  return (
    <div className="rounded-xl border border-odw-border bg-white p-4 sm:p-5 shadow-2xs space-y-4">
      {/* Progress Header & Bar */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <h2 className="text-sm font-bold text-odw-text">Project Progress</h2>
            <p className="text-xs text-odw-text-muted">
              {totalTasks > 0 ? (
                <>
                  <span className="font-semibold text-odw-text">{completedTasks}</span> of{' '}
                  <span className="font-semibold text-odw-text">{totalTasks}</span> tasks completed
                </>
              ) : (
                'No tasks assigned to this project yet.'
              )}
            </p>
          </div>
          <span className="text-xl sm:text-2xl font-extrabold text-odw-text">
            {progress}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200/60">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              progress === 100
                ? 'bg-emerald-500'
                : progress >= 60
                ? 'bg-odw-primary'
                : progress > 0
                ? 'bg-amber-500'
                : 'bg-slate-300'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2 border-t border-odw-border">
        {summaryCards.map((card) => {
          const IconComp = card.icon
          return (
            <div
              key={card.label}
              className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <div className={`p-1 rounded-md ${card.bg} ${card.color}`}>
                  <IconComp className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-medium text-slate-600">
                  {card.label}
                </span>
              </div>
              <span className={`text-xs font-bold ${card.color}`}>
                {card.value}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ProjectTaskProgress
