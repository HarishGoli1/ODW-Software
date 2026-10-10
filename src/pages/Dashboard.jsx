import { useState, useEffect, useCallback } from 'react'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import DashboardHeader from '../components/DashboardHeader'
import KpiGrid from '../components/KpiGrid'
import BusinessOverview from '../components/BusinessOverview'
import BusinessPulse from '../components/BusinessPulse'
import QuickActions from '../components/QuickActions'
import { getDashboardData } from '../services/dashboardService'
import { useAuth } from '../context/AuthContext'

function Dashboard() {
  const { employee } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getDashboardData(employee)
      setDashboardData(data)
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
      setError(err.message || 'Failed to aggregate dashboard metrics from database.')
    } finally {
      setIsLoading(false)
    }
  }, [employee])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  return (
    <div className="space-y-6">
      {/* 1. Header Shell */}
      <DashboardHeader />

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-odw-border bg-white shadow-2xs">
          <Loader2 className="h-8 w-8 animate-spin text-odw-primary mb-3" />
          <p className="text-sm font-semibold text-odw-charcoal">Loading dashboard metrics...</p>
          <p className="text-xs text-odw-text-muted mt-1">Aggregating live data from Supabase</p>
        </div>
      )}

      {/* Error State with Retry Button */}
      {!isLoading && error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-rose-900 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold">Failed to load live metrics</p>
                <p className="text-xs text-rose-700 mt-0.5">{error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={fetchDashboard}
              className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-800 shadow-2xs hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      )}

      {/* Live Content */}
      {!isLoading && !error && dashboardData && (
        <>
          {/* 2. Key Metrics Grid */}
          <KpiGrid kpis={dashboardData.kpis} />

          {/* 3. Business Overview */}
          <BusinessOverview overview={dashboardData.overview} />

          {/* 4. Business Pulse */}
          <BusinessPulse pulse={dashboardData.pulse} />

          {/* 5. Quick Actions */}
          <QuickActions />
        </>
      )}
    </div>
  )
}

export default Dashboard
