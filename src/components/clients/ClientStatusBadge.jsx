function ClientStatusBadge({ status }) {
  const styles = {
    Active: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
    'On Hold': 'bg-orange-50 text-orange-700 border-orange-200/70',
    Completed: 'bg-slate-100 text-slate-700 border-slate-200/80',
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

export default ClientStatusBadge
