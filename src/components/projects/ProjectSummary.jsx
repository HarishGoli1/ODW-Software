import { FolderKanban, PlayCircle, Eye, CheckCircle2 } from 'lucide-react'

function ProjectSummary({ summary }) {
  const cards = [
    {
      label: 'Total Projects',
      value: summary.total,
      context: 'All registered client projects',
      icon: FolderKanban,
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
      badgeBorder: 'border-slate-200/70',
    },
    {
      label: 'In Progress',
      value: summary.inProgress,
      context: 'Active production sprints',
      icon: PlayCircle,
      iconBg: 'bg-orange-50',
      iconColor: 'text-odw-primary',
      badgeBorder: 'border-orange-200/70',
    },
    {
      label: 'In Review',
      value: summary.inReview,
      context: 'Client QA & sign-off phase',
      icon: Eye,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      badgeBorder: 'border-purple-200/70',
    },
    {
      label: 'Completed',
      value: summary.completed,
      context: 'Successfully delivered',
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      badgeBorder: 'border-emerald-200/70',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card) => {
        const IconComponent = card.icon

        return (
          <div
            key={card.label}
            className="flex flex-col justify-between rounded-xl border border-odw-border bg-white p-3.5 sm:p-4 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-medium text-odw-text-muted">
                {card.label}
              </span>
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-lg border ${card.iconBg} ${card.iconColor} ${card.badgeBorder}`}
              >
                <IconComponent className="h-3.5 w-3.5" aria-hidden="true" />
              </div>
            </div>

            <div className="mt-2.5">
              <p className="text-xl sm:text-2xl font-bold tracking-tight text-odw-text">
                {card.value}
              </p>
              <p className="mt-0.5 text-[11px] text-odw-text-muted truncate">
                {card.context}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ProjectSummary
