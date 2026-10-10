import PipelineCard from './PipelineCard'
import ProjectDeliveryCard from './ProjectDeliveryCard'
import PaymentHealthCard from './PaymentHealthCard'
import TaskHealthCard from './TaskHealthCard'
import BusinessActivityChart from './BusinessActivityChart'

function BusinessOverview({ overview = {} }) {
  return (
    <section aria-label="Business Overview" className="space-y-4">
      {/* Section Heading */}
      <div className="flex items-center justify-between pt-1">
        <h2 className="text-xs font-bold uppercase tracking-wider text-odw-text-muted">
          Business Overview
        </h2>
      </div>

      {/* Row 1: Pipeline & Project Delivery (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PipelineCard
          pipeline={overview.leadPipeline}
          totalLeads={overview.totalLeads}
        />
        <ProjectDeliveryCard
          projectDelivery={overview.projectDelivery}
        />
      </div>

      {/* Row 2: Payment Health & Task Health (2 Columns or 1 Column if restricted) */}
      <div className={`grid grid-cols-1 ${overview.paymentHealth ? 'lg:grid-cols-2' : ''} gap-4`}>
        {overview.paymentHealth && (
          <PaymentHealthCard
            paymentHealth={overview.paymentHealth}
          />
        )}
        <TaskHealthCard
          taskHealth={overview.taskHealth}
        />
      </div>

      {/* Row 3: 6-Month Business Activity Trend (Full Width) */}
      <div>
        <BusinessActivityChart
          activityTrend={overview.activityTrend}
          totalLeads={overview.totalLeads}
        />
      </div>
    </section>
  )
}

export default BusinessOverview
