import { FolderKanban, ListChecks, CreditCard, ArrowRight, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'

const ICON_MAP = {
  FolderKanban,
  ListChecks,
  CreditCard,
}

function UpcomingWork({ items = [] }) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-odw-border bg-white p-5 sm:p-6 shadow-2xs">
      <div>
        {/* Card Header */}
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-odw-charcoal">Upcoming Work</h3>
          <p className="text-xs text-odw-text-muted mt-0.5">
            What needs your attention next.
          </p>
        </div>

        {/* List Rows or Empty State */}
        <div className="mt-4 space-y-3">
          {items.length === 0 ? (
            <div className="py-8 text-center text-xs text-odw-text-muted">
              No upcoming deliverables pending.
            </div>
          ) : (
            items.map((item) => {
              const IconComponent = ICON_MAP[item.icon] || ListChecks

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-odw-border bg-slate-50/50 p-3 sm:p-3.5 transition-all duration-150 hover:bg-slate-50 hover:border-slate-300"
                >
                  {/* Left: Icon & Title/Metadata */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200/60 ${item.iconBg}`}
                    >
                      <IconComponent className="h-4.5 w-4.5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs sm:text-sm font-semibold text-odw-text">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-odw-text-muted mt-0.5">
                        {item.type === 'Payment' ? `Amount: ${item.meta}` : `Type: ${item.meta}`}
                      </p>
                    </div>
                  </div>

                  {/* Right: Due Date & Priority */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                      <Clock className="h-3 w-3 text-slate-400 shrink-0" aria-hidden="true" />
                      <span className={item.isUrgent ? 'font-bold text-rose-600' : 'text-slate-600'}>
                        {item.due}
                      </span>
                    </div>
                    <span
                      className={`inline-block rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${item.priorityBadge}`}
                    >
                      {item.priority}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-odw-text-muted font-medium">
          {items.length} {items.length === 1 ? 'deliverable' : 'deliverables'} pending
        </span>
        <Link
          to="/tasks"
          className="inline-flex items-center gap-1 font-semibold text-odw-primary hover:text-odw-primary-hover transition-colors"
        >
          <span>View tasks</span>
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}

export default UpcomingWork
