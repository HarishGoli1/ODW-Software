function LeadStatusBadge({ status }) {
  const styles = {
    New: 'bg-orange-50 text-odw-primary border-orange-200/70',
    Qualified: 'bg-slate-100 text-slate-700 border-slate-200/80',
    Converted: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
    Lost: 'bg-rose-50 text-rose-700 border-rose-200/70',
  }

  const badgeClass = styles[status] || 'bg-slate-50 text-slate-600 border-slate-200'

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${badgeClass}`}
    >
      {status}
    </span>
  )
}

export default LeadStatusBadge
