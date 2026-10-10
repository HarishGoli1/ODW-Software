function TeamStatusBadge({ status }) {
  const styles = {
    Active: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
      dot: 'bg-emerald-500',
    },
    'On Leave': {
      bg: 'bg-amber-50 text-amber-700 border-amber-200/70',
      dot: 'bg-amber-500',
    },
    Inactive: {
      bg: 'bg-slate-100 text-slate-700 border-slate-200/80',
      dot: 'bg-slate-400',
    },
  }

  const current = styles[status] || {
    bg: 'bg-slate-50 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${current.bg}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${current.dot}`} />
      <span>{status}</span>
    </span>
  )
}

export default TeamStatusBadge
