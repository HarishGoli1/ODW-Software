function ProjectDeliveryCard({ projectDelivery = { total: 0, statuses: [] } }) {
  const { total = 0, statuses = [] } = projectDelivery

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-odw-border bg-white p-5 sm:p-6 shadow-2xs">
      <div>
        {/* Card Header */}
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-odw-charcoal">Project Delivery</h3>
          <p className="text-xs text-odw-text-muted mt-0.5">
            Current project workload and delivery status.
          </p>
        </div>

        {/* Status Rows */}
        <div className="mt-4 space-y-3.5">
          {statuses.map((item) => {
            const percent = item.percentage ?? (total > 0 ? Math.round((item.count / total) * 100) : 0)

            return (
              <div
                key={item.name}
                className={`rounded-xl p-2.5 transition-all duration-150 ${
                  item.isHighlighted
                    ? item.name === 'In Progress'
                      ? 'bg-odw-primary-soft/30 border border-orange-200/50'
                      : 'bg-emerald-50/40 border border-emerald-200/50'
                    : 'bg-slate-50/50 border border-transparent'
                }`}
              >
                {/* Top row: Indicator, Name, Count */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.dotColor }}
                    />
                    <span
                      className={`font-semibold ${
                        item.isHighlighted ? 'text-odw-text font-bold' : 'text-slate-700'
                      }`}
                    >
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-sm font-bold ${
                        item.name === 'In Progress'
                          ? 'text-odw-primary'
                          : item.name === 'Completed'
                          ? 'text-emerald-600'
                          : 'text-odw-charcoal'
                      }`}
                    >
                      {item.count}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      ({percent}%)
                    </span>
                  </div>
                </div>

                {/* Thin horizontal progress indicator */}
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/60">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${item.barColor}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom Summary */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-odw-text-muted">Total Active Workload</span>
        <span className="font-bold text-odw-charcoal">{total} total projects</span>
      </div>
    </div>
  )
}

export default ProjectDeliveryCard
