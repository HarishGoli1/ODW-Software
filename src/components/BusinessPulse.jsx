import UpcomingWork from './UpcomingWork'
import RecentActivity from './RecentActivity'

function BusinessPulse({ pulse = {} }) {
  return (
    <section aria-label="Business Pulse" className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between pt-1">
        <h2 className="text-xs font-bold uppercase tracking-wider text-odw-text-muted">
          Business Pulse
        </h2>
      </div>

      {/* Two-Column Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <UpcomingWork items={pulse.upcomingWork} />
        <RecentActivity items={pulse.recentActivity} />
      </div>
    </section>
  )
}

export default BusinessPulse
