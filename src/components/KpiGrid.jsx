import KpiCard from './KpiCard'

function KpiGrid({ kpis = [] }) {
  return (
    <section aria-label="Key Performance Indicators" className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-odw-text-muted">
          Key Metrics
        </h2>
      </div>

      {/* Responsive card grid */}
      <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${kpis.length <= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3 xl:grid-cols-5'}`}>
        {kpis.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} />
        ))}
      </div>
    </section>
  )
}

export default KpiGrid
