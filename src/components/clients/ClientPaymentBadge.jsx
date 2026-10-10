function ClientPaymentBadge({ payment }) {
  const styles = {
    Paid: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
    Pending: 'bg-orange-50 text-orange-700 border-orange-200/70',
    Overdue: 'bg-rose-50 text-rose-700 border-rose-200/70',
  }

  const badgeClass = styles[payment] || 'bg-slate-50 text-slate-600 border-slate-200'

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${badgeClass}`}
    >
      {payment}
    </span>
  )
}

export default ClientPaymentBadge
