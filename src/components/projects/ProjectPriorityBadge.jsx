function ProjectPriorityBadge({ priority }) {
  const styles = {
    Low: 'bg-slate-50 text-slate-600 border-slate-200/70',
    Medium: 'bg-blue-50 text-blue-700 border-blue-200/70',
    High: 'bg-amber-50 text-amber-700 border-amber-200/70',
    Urgent: 'bg-rose-50 text-rose-700 border-rose-200/70',
  }

  const badgeClass = styles[priority] || 'bg-slate-50 text-slate-600 border-slate-200'

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${badgeClass}`}
    >
      {priority}
    </span>
  )
}

export default ProjectPriorityBadge
