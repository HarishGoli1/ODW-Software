function PaymentHealthCard({ paymentHealth = { totalTracked: '₹0', figures: [] } }) {
  const { totalTracked = '₹0', figures = [] } = paymentHealth

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-odw-border bg-white p-5 sm:p-6 shadow-2xs">
      <div>
        {/* Card Header */}
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-odw-charcoal">Payment Health</h3>
          <p className="text-xs text-odw-text-muted mt-0.5">
            Current outstanding and collected payments.
          </p>
        </div>

        {/* 3 Financial Figures */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {figures.map((item) => (
            <div
              key={item.label}
              className={`rounded-xl border p-3.5 ${
                item.label === 'Paid' || item.label === 'Received'
                  ? 'border-emerald-200/60 bg-emerald-50/30'
                  : item.label === 'Pending'
                  ? 'border-orange-200/60 bg-odw-primary-soft/30'
                  : 'border-rose-200/60 bg-rose-50/30'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-odw-text-muted">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: item.dotColor }}
                />
                <span>{item.label}</span>
              </div>
              <p className={`mt-2 text-xl sm:text-2xl font-bold tracking-tight ${item.color}`}>
                {item.amount}
              </p>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {item.percentage}% of tracked
              </span>
            </div>
          ))}
        </div>

        {/* Horizontal Payment Health Visualization Bar */}
        <div className="mt-5 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-odw-text-muted font-medium">
            <span>Portfolio Distribution</span>
            <span>100% Accounted</span>
          </div>
          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100 gap-0.5 p-0.5">
            {figures.map((item) => (
              <div
                key={item.label}
                className={`h-full rounded-sm transition-all duration-300 ${item.barColor}`}
                style={{ width: `${item.percentage}%` }}
                title={`${item.label}: ${item.amount} (${item.percentage}%)`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Summary */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-odw-text-muted">Total Receivables Value</span>
        <span className="font-bold text-odw-charcoal">Total tracked: {totalTracked}</span>
      </div>
    </div>
  )
}

export default PaymentHealthCard
