/**
 * Dashboard KPI Mock Data Foundation
 * Designed to be replaced with live Supabase query data in subsequent phases.
 * Preview/demo values only.
 */

export const DASHBOARD_KPIS = [
  {
    id: 'total-leads',
    label: 'Total Leads',
    value: '128',
    icon: 'UsersRound',
    description: 'vs last month',
    trend: '+12.4%',
    trendDirection: 'up',
    dataState: 'preview',
  },
  {
    id: 'active-clients',
    label: 'Active Clients',
    value: '24',
    icon: 'ContactRound',
    description: 'vs last month',
    trend: '+8.2%',
    trendDirection: 'up',
    dataState: 'preview',
  },
  {
    id: 'active-projects',
    label: 'Active Projects',
    value: '16',
    icon: 'FolderKanban',
    description: '3 due this month',
    trend: 'On track',
    trendDirection: 'neutral',
    dataState: 'preview',
  },
  {
    id: 'pending-tasks',
    label: 'Pending Tasks',
    value: '42',
    icon: 'ListChecks',
    description: '7 due this week',
    trend: 'Priority',
    trendDirection: 'neutral',
    dataState: 'preview',
  },
  {
    id: 'pending-payments',
    label: 'Pending Payments',
    value: '₹84,500',
    icon: 'CreditCard',
    description: 'outstanding balance',
    trend: '4 invoices',
    trendDirection: 'neutral',
    dataState: 'preview',
  },
]

export default DASHBOARD_KPIS
