import {
  UserCheck,
  UserPlus,
  CreditCard,
  CheckCircle2,
  FolderPlus,
  Clock,
} from 'lucide-react'

const ICON_MAP = {
  UserCheck,
  UserPlus,
  CreditCard,
  CheckCircle2,
  FolderPlus,
}

function RecentActivity({ items = [] }) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-odw-border bg-white p-5 sm:p-6 shadow-2xs">
      <div>
        {/* Card Header */}
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-odw-charcoal">Recent Activity</h3>
          <p className="text-xs text-odw-text-muted mt-0.5">
            Latest business activity.
          </p>
        </div>

        {/* List Rows or Empty State */}
        <div className="mt-4 space-y-2.5">
          {items.length === 0 ? (
            <div className="py-8 text-center text-xs text-odw-text-muted">
              No recent activity recorded yet.
            </div>
          ) : (
            items.map((item) => {
              const IconComponent = ICON_MAP[item.icon] || CheckCircle2

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-odw-border bg-slate-50/40 p-2.5 sm:p-3 transition-all duration-150 hover:bg-slate-50 hover:border-slate-300"
                >
                  {/* Left: Icon & Title/Entity */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${item.iconBg}`}
                    >
                      <IconComponent className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs sm:text-sm font-semibold text-odw-text">
                        {item.title}
                      </p>
                      <p className="truncate text-[11px] text-odw-text-muted">
                        {item.entity}
                      </p>
                    </div>
                  </div>

                  {/* Right: Relative Timestamp */}
                  <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400 shrink-0">
                    <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
                    <span>{item.timestamp}</span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-odw-text-muted font-medium">Live activity log</span>
      </div>
    </div>
  )
}

export default RecentActivity
