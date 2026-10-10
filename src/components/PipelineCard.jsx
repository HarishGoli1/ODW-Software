function PipelineCard({ pipeline = [], totalLeads = 0 }) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-odw-border bg-white p-5 sm:p-6 shadow-2xs">
      <div>
        {/* Card Header */}
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-odw-charcoal">Lead Pipeline</h3>
          <p className="text-xs text-odw-text-muted mt-0.5">
            Track how opportunities move through your sales process.
          </p>
        </div>

        {/* Pipeline Stages - Horizontal Flow */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
          {pipeline.map((stage) => (
            <div
              key={stage.stage}
              className={`relative flex flex-col justify-between rounded-xl border p-3 sm:p-3.5 transition-all duration-150 ${
                stage.stage === 'New Leads'
                  ? 'border-orange-200/80 bg-odw-primary-soft/40 shadow-2xs'
                  : 'border-odw-border bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              {/* Stage Name & Context */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-odw-text whitespace-nowrap">
                  {stage.stage}
                </span>
              </div>

              {/* Large Metric Number */}
              <div className="my-2">
                <p className={`text-2xl sm:text-3xl font-bold tracking-tight ${stage.textColor}`}>
                  {stage.count}
                </p>
              </div>

              {/* Context Tag & Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap ${stage.badgeBg}`}>
                  {stage.context}
                </span>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200/70">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${stage.barColor}`}
                    style={{
                      width: `${stage.percentage || 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Summary */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-odw-text-muted">
        <span>Current Pipeline</span>
        <span className="font-medium text-odw-text">{totalLeads} Total Leads</span>
      </div>
    </div>
  )
}

export default PipelineCard
