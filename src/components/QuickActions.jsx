import QuickActionCard from './QuickActionCard'
import { QUICK_ACTIONS } from '../data/quickActions'
import { useAuth } from '../context/AuthContext'

function QuickActions() {
  const { employee } = useAuth()
  const role = employee?.system_role?.toLowerCase() || 'member'

  if (role === 'member') {
    return null
  }

  return (
    <section aria-label="Quick Actions" className="space-y-2.5">
      {/* Section Header */}
      <div className="flex flex-col gap-0.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-odw-text-muted">
          Quick Actions
        </h2>
        <p className="text-xs text-odw-text-muted">
          Common actions to manage your business faster.
        </p>
      </div>

      {/* Responsive Grid: 6 cols on Desktop (xl), 3 cols on Tablet (md), 2 cols on Mobile */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {QUICK_ACTIONS.map((action) => (
          <QuickActionCard key={action.id} action={action} />
        ))}
      </div>
    </section>
  )
}

export default QuickActions
