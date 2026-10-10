function TaskHealthCard({ taskHealth = {} }) {
  const {
    completionPercentage = 0,
    supportingText = 'No tasks tracked yet',
    breakdown = [],
    totalTracked = 0,
  } = taskHealth

  // SVG Circular Gauge calculation (radius = 32, circumference = 201.06)
  const radius = 32
  const circumference = 2 * Math.PI * radius
  const strokeOffset =
    circumference - (completionPercentage / 100) * circumference

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-odw-border bg-white p-5 sm:p-6 shadow-2xs">
      <div>
        {/* Card Header */}
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-odw-charcoal">Task Health</h3>
          <p className="text-xs text-odw-text-muted mt-0.5">
            Current workload across active projects.
          </p>
        </div>

        {/* Content: Circular Indicator + Breakdown Rows */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5 items-center">
          {/* Left: Circular Completion Indicator */}
          <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50/50 border border-slate-100">
            <div className="relative flex h-24 w-24 items-center justify-center">
              <svg className="h-24 w-24 -rotate-90" viewBox="0 0 80 80">
                {/* Track */}
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  fill="none"
                  stroke="#F1F5F9"
                  strokeWidth="7"
                />
                {/* Progress Ring in ODW Orange */}
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  fill="none"
                  stroke="#EF520B"
                  strokeWidth="7"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeOffset}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-odw-charcoal">
                  {completionPercentage}%
                </span>
                <span className="text-[8px] uppercase tracking-wider font-semibold text-slate-400">
                  Completion
                </span>
              </div>
            </div>

            <p className="mt-2 text-center text-xs font-medium text-odw-text-muted">
              {supportingText}
            </p>
          </div>

          {/* Right: Task Status Rows */}
          <div className="space-y-2">
            {breakdown.map((item) => (
              <div
                key={item.status}
                className="flex items-center justify-between rounded-lg p-2 bg-slate-50/60 border border-slate-100 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.dotColor }}
                  />
                  <span className="font-medium text-slate-700">
                    {item.status}
                  </span>
                </div>
                <span className={`text-sm font-bold ${item.textColor}`}>
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Summary */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-odw-text-muted">
        <span>Active Project Tasks</span>
        <span className="font-medium text-odw-text">{totalTracked} Total Tasks</span>
      </div>
    </div>
  )
}

export default TaskHealthCard
