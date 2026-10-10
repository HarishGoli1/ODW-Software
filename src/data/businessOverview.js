/**
 * Business Overview Mock / Preview Data Foundation
 * Designed for the Executive CRM Dashboard.
 * Replaceable with Supabase live aggregation queries in subsequent phases.
 * Preview/demo values only.
 */

export const BUSINESS_OVERVIEW_DATA = {
  // Row 1: Lead Pipeline & Project Delivery
  leadPipeline: [
    {
      stage: 'New Leads',
      count: 58,
      context: '45% of pipeline',
      barColor: 'bg-odw-primary',
      textColor: 'text-odw-primary',
      badgeBg: 'bg-odw-primary-soft text-odw-primary',
      dotColor: '#EF520B',
    },
    {
      stage: 'Qualified',
      count: 34,
      context: '27% of pipeline',
      barColor: 'bg-slate-400',
      textColor: 'text-slate-700',
      badgeBg: 'bg-slate-100 text-slate-600',
      dotColor: '#94A3B8',
    },
    {
      stage: 'Converted',
      count: 24,
      context: '19% conversion',
      barColor: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      badgeBg: 'bg-emerald-50 text-emerald-700',
      dotColor: '#10B981',
    },
    {
      stage: 'Lost',
      count: 12,
      context: '9% dropped',
      barColor: 'bg-rose-400',
      textColor: 'text-rose-600',
      badgeBg: 'bg-rose-50 text-rose-600',
      dotColor: '#F87171',
    },
  ],

  projectDelivery: {
    total: 16,
    statuses: [
      {
        name: 'Planning',
        count: 3,
        total: 16,
        percentage: 19,
        dotColor: '#94A3B8',
        barColor: 'bg-slate-300',
        isHighlighted: false,
      },
      {
        name: 'In Progress',
        count: 7,
        total: 16,
        percentage: 44,
        dotColor: '#EF520B',
        barColor: 'bg-odw-primary',
        isHighlighted: true,
      },
      {
        name: 'Review',
        count: 2,
        total: 16,
        percentage: 12,
        dotColor: '#F59E0B',
        barColor: 'bg-amber-400',
        isHighlighted: false,
      },
      {
        name: 'Completed',
        count: 4,
        total: 16,
        percentage: 25,
        dotColor: '#10B981',
        barColor: 'bg-emerald-500',
        isHighlighted: true,
      },
    ],
  },

  // Row 2: Payment Health & Task Health
  paymentHealth: {
    totalTracked: '₹2,44,500',
    figures: [
      {
        label: 'Paid',
        amount: '₹1,42,000',
        percentage: 58,
        color: 'text-emerald-600',
        barColor: 'bg-emerald-500',
        dotColor: '#10B981',
      },
      {
        label: 'Pending',
        amount: '₹84,500',
        percentage: 35,
        color: 'text-odw-primary',
        barColor: 'bg-odw-primary',
        dotColor: '#EF520B',
      },
      {
        label: 'Overdue',
        amount: '₹18,000',
        percentage: 7,
        color: 'text-rose-600',
        barColor: 'bg-rose-500',
        dotColor: '#EF4444',
      },
    ],
  },

  taskHealth: {
    completionPercentage: 24,
    completedCount: 17,
    totalTracked: 70,
    supportingText: '17 of 70 tracked tasks completed',
    breakdown: [
      {
        status: 'Completed',
        count: 17,
        dotColor: '#10B981',
        textColor: 'text-emerald-600',
        barColor: 'bg-emerald-500',
      },
      {
        status: 'In Progress',
        count: 8,
        dotColor: '#EF520B',
        textColor: 'text-odw-primary',
        barColor: 'bg-odw-primary',
      },
      {
        status: 'Pending',
        count: 42,
        dotColor: '#64748B',
        textColor: 'text-slate-600',
        barColor: 'bg-slate-400',
      },
      {
        status: 'Overdue',
        count: 3,
        dotColor: '#EF4444',
        textColor: 'text-rose-600',
        barColor: 'bg-rose-500',
      },
    ],
  },

  // Row 3: Business Activity 6-Month Trend
  activityTrend: [
    { month: 'May', leads: 45, projects: 8 },
    { month: 'Jun', leads: 62, projects: 11 },
    { month: 'Jul', leads: 78, projects: 12 },
    { month: 'Aug', leads: 95, projects: 14 },
    { month: 'Sep', leads: 110, projects: 15 },
    { month: 'Oct', leads: 128, projects: 16 },
  ],
}

export default BUSINESS_OVERVIEW_DATA
