import {
  UsersRound,
  ContactRound,
  FolderKanban,
  ListChecks,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'

const ICON_MAP = {
  UsersRound,
  ContactRound,
  FolderKanban,
  ListChecks,
  CreditCard,
}

function KpiCard({ kpi }) {
  const { label, value, icon, description, trend, trendDirection } = kpi
  const IconComponent = ICON_MAP[icon] || UsersRound

  return (
    <article className="group flex flex-col justify-between rounded-xl border border-odw-border bg-white p-4 sm:p-5 shadow-2xs transition-all duration-150 hover:border-slate-300 hover:shadow-xs">
      {/* Top: Small label + icon */}
      <div className="flex items-start justify-between gap-2.5">
        <h3 className="text-xs sm:text-sm font-medium text-odw-text-muted leading-snug">
          {label}
        </h3>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-odw-primary-soft text-odw-primary border border-orange-200/40 transition-colors group-hover:bg-orange-100/70">
          <IconComponent className="h-4.5 w-4.5" aria-hidden="true" />
        </div>
      </div>

      {/* Middle: Large primary metric number */}
      <div className="my-3">
        <p className="text-2xl sm:text-3xl font-bold tracking-tight text-odw-charcoal">
          {value}
        </p>
      </div>

      {/* Bottom: Supporting context / trend */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-odw-text-muted">
        {trend && (
          <span
            className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 font-medium ${
              trendDirection === 'up'
                ? 'bg-emerald-50 text-emerald-600'
                : trendDirection === 'down'
                ? 'bg-rose-50 text-rose-600'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {trendDirection === 'up' && (
              <ArrowUpRight className="h-3 w-3 shrink-0" aria-hidden="true" />
            )}
            {trendDirection === 'down' && (
              <ArrowDownRight className="h-3 w-3 shrink-0" aria-hidden="true" />
            )}
            <span>{trend}</span>
          </span>
        )}
        {description && (
          <span className="text-odw-text-muted">
            {description}
          </span>
        )}
      </div>
    </article>
  )
}

export default KpiCard
