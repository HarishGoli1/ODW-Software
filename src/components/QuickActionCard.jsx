import { Link } from 'react-router-dom'
import {
  UserPlus,
  UserRoundPlus,
  FolderPlus,
  ListPlus,
  FilePlus2,
  CreditCard,
  ArrowUpRight,
  Plus,
} from 'lucide-react'

const ICON_MAP = {
  UserPlus,
  UserRoundPlus,
  FolderPlus,
  ListPlus,
  FilePlus2,
  CreditCard,
}

function QuickActionCard({ action }) {
  const IconComponent = ICON_MAP[action.icon] || Plus

  return (
    <Link
      to={action.to || '#'}
      aria-label={`${action.label}: ${action.description}`}
      className="group flex flex-col justify-between text-left rounded-xl border border-odw-border bg-white p-3.5 sm:p-4 shadow-2xs transition-all duration-150 hover:border-slate-300 hover:shadow-xs focus-visible:outline-2 focus-visible:outline-odw-primary h-full cursor-pointer"
    >
      <div>
        {/* Refined Icon Container: soft orange-tinted background, thin subtle border, rounded corners */}
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 border border-orange-200/60 text-odw-primary transition-colors group-hover:bg-orange-100/70 shrink-0">
          <IconComponent className="h-4 w-4" aria-hidden="true" />
        </div>

        {/* Action Title: strong, dark charcoal */}
        <p className="mt-2.5 text-xs sm:text-sm font-semibold text-odw-text transition-colors group-hover:text-odw-primary leading-tight">
          {action.label}
        </p>

        {/* Action Description: muted blue/slate */}
        <p className="mt-1 text-[11px] text-odw-text-muted leading-relaxed line-clamp-2">
          {action.description}
        </p>
      </div>

      {/* Subtle Right-facing Action Affordance (ArrowUpRight) */}
      <div className="mt-3 flex justify-end">
        <ArrowUpRight
          className="h-3.5 w-3.5 text-slate-400 transition-all duration-150 group-hover:text-odw-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0"
          aria-hidden="true"
        />
      </div>
    </Link>
  )
}

export default QuickActionCard
