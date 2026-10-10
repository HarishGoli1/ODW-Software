import { Users, UserCheck, FolderKanban, CreditCard } from 'lucide-react'

function ClientSummary({ summary }) {
  const cards = [
    {
      label: 'Total Clients',
      value: summary.total,
      context: 'All active client relationships',
      icon: Users,
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
      badgeBorder: 'border-slate-200/70',
    },
    {
      label: 'Active Clients',
      value: summary.active,
      context: 'Currently working with ODW',
      icon: UserCheck,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      badgeBorder: 'border-emerald-200/70',
    },
    {
      label: 'Active Projects',
      value: summary.activeProjects,
      context: 'Projects currently in progress',
      icon: FolderKanban,
      iconBg: 'bg-orange-50',
      iconColor: 'text-odw-primary',
      badgeBorder: 'border-orange-200/70',
    },
    ...(summary.pendingPayments !== null && summary.pendingPayments !== undefined
      ? [
          {
            label: 'Pending Payments',
            value: summary.pendingPayments,
            context: 'Outstanding client balance',
            icon: CreditCard,
            iconBg: 'bg-orange-50',
            iconColor: 'text-amber-600',
            badgeBorder: 'border-amber-200/70',
          },
        ]
      : []),
  ]

  const gridClass = cards.length <= 3
    ? 'grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4'
    : 'grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4'

  return (
    <div className={gridClass}>
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

export default ClientSummary
