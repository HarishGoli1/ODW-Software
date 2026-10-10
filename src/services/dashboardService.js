import { supabase } from '../lib/supabase'

/**
 * Format number into Indian Rupee currency string ('₹1,42,000' or '₹0')
 */
export const formatINR = (val) => {
  const num = Number(val) || 0
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num)
}

/**
 * Format ISO timestamp into user-friendly relative or date string
 */
const formatRelativeTime = (isoString) => {
  if (!isoString) return 'recently'
  try {
    const diffMs = Date.now() - new Date(isoString).getTime()
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHr = Math.floor(diffMin / 60)
    const diffDays = Math.floor(diffHr / 24)

    if (diffMin < 1) return 'Just now'
    if (diffMin < 60) return `${diffMin} min ago`
    if (diffHr < 24) return `${diffHr} hr${diffHr > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return 'recently'
  }
}

/**
 * Generates the last 6 calendar month buckets for timeline trends
 */
const getPast6Months = () => {
  const months = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      year: d.getFullYear(),
      monthNum: d.getMonth(),
    })
  }
  return months
}

/**
 * Safe percentage calculation with zero-division protection
 */
const calcPercent = (count, total) => {
  if (!total || total <= 0) return 0
  return Math.round((count / total) * 100)
}

/**
 * Main Dashboard Data Fetcher & Aggregator
 * Strictly uses live data from the 5 approved business tables:
 * - public.leads
 * - public.clients
 * - public.projects
 * - public.tasks
 * - public.payments
 */
export const getDashboardData = async (employee = null) => {
  const role = (employee?.system_role || 'member').toLowerCase()
  const isMember = role === 'member'

  // Safe concurrent fetch across approved tables; Members must NOT query payments
  const queryPromises = [
    supabase.from('leads').select('*').order('created_at', { ascending: false }),
    supabase.from('clients').select('*').order('created_at', { ascending: false }),
    supabase.from('projects').select('*').order('created_at', { ascending: false }),
    supabase.from('tasks').select('*').order('created_at', { ascending: false }),
  ]

  if (!isMember) {
    queryPromises.push(
      supabase.from('payments').select('*').order('created_at', { ascending: false })
    )
  }

  const results = await Promise.all(queryPromises)

  const leadsRes = results[0] || {}
  const clientsRes = results[1] || {}
  const projectsRes = results[2] || {}
  const tasksRes = results[3] || {}
  const paymentsRes = !isMember ? results[4] || {} : { data: [], error: null }

  if (leadsRes.error) console.error('Error fetching leads for dashboard:', leadsRes.error)
  if (clientsRes.error) console.error('Error fetching clients for dashboard:', clientsRes.error)
  if (projectsRes.error) console.error('Error fetching projects for dashboard:', projectsRes.error)
  if (tasksRes.error) console.error('Error fetching tasks for dashboard:', tasksRes.error)
  if (paymentsRes.error) console.error('Error fetching payments for dashboard:', paymentsRes.error)

  const leads = leadsRes.data || []
  const clients = clientsRes.data || []
  const projects = projectsRes.data || []
  const tasks = tasksRes.data || []
  const payments = paymentsRes.data || []

  // ---------------------------------------------------------------------------
  // 1. KPI DEFINITIONS & DERIVATIONS
  // ---------------------------------------------------------------------------

  // Total Leads: Count all records from public.leads
  const totalLeads = leads.length

  // Active Clients: Count clients where status = 'Active'
  const activeClients = clients.filter((c) => c.status === 'Active').length

  // Active Projects:
  // Approved project_status column values: 'Planning', 'In Progress', 'Review', 'On Hold', 'Completed'.
  // Count active project statuses: 'Planning', 'In Progress', 'Review', 'On Hold' (exclude 'Completed').
  const activeProjectStatuses = ['Planning', 'In Progress', 'Review', 'On Hold']
  const activeProjects = projects.filter((p) =>
    activeProjectStatuses.includes(p.project_status)
  ).length

  // Pending Tasks:
  // In public.tasks, valid statuses are: 'To Do', 'In Progress', 'Review', 'Completed', 'Blocked'.
  // Note: There is NO 'Pending' task status in the database schema.
  // The 'Pending Tasks' business metric comprises open active workload:
  // 'To Do', 'In Progress', 'Review', and 'Blocked' (excluding 'Completed').
  const pendingTaskStatuses = ['To Do', 'In Progress', 'Review', 'Blocked']
  const pendingTasks = tasks.filter((t) =>
    pendingTaskStatuses.includes(t.status)
  ).length

  // Pending Payments: Sum payment.amount where status = 'Pending'. Empty result = 0.
  const pendingPaymentsTotal = payments
    .filter((p) => p.status === 'Pending')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

  const pendingPaymentsCount = payments.filter((p) => p.status === 'Pending').length

  const kpis = [
    {
      id: 'total-leads',
      label: 'Total Leads',
      value: String(totalLeads),
      icon: 'UsersRound',
      description: 'total registered',
      trend: totalLeads > 0 ? `${totalLeads} in pipeline` : null,
      trendDirection: 'neutral',
    },
    {
      id: 'active-clients',
      label: 'Active Clients',
      value: String(activeClients),
      icon: 'ContactRound',
      description: 'active accounts',
      trend: activeClients > 0 ? `${activeClients} retained` : null,
      trendDirection: 'neutral',
    },
    {
      id: 'active-projects',
      label: 'Active Projects',
      value: String(activeProjects),
      icon: 'FolderKanban',
      description: 'in delivery',
      trend: activeProjects > 0 ? 'Active workload' : null,
      trendDirection: 'neutral',
    },
    {
      id: 'pending-tasks',
      label: 'Pending Tasks',
      value: String(pendingTasks),
      icon: 'ListChecks',
      description: 'open workload',
      trend: pendingTasks > 0 ? 'Open items' : null,
      trendDirection: 'neutral',
    },
    ...(!isMember
      ? [
          {
            id: 'pending-payments',
            label: 'Pending Payments',
            value: formatINR(pendingPaymentsTotal),
            icon: 'CreditCard',
            description: 'outstanding balance',
            trend: pendingPaymentsCount > 0 ? `${pendingPaymentsCount} pending` : null,
            trendDirection: 'neutral',
          },
        ]
      : []),
  ]

  // ---------------------------------------------------------------------------
  // 2. LEAD PIPELINE DERIVATION
  // ---------------------------------------------------------------------------
  // Approved statuses: New, Qualified, Converted, Lost
  const newLeadsCount = leads.filter((l) => l.status === 'New').length
  const qualifiedLeadsCount = leads.filter((l) => l.status === 'Qualified').length
  const convertedLeadsCount = leads.filter((l) => l.status === 'Converted').length
  const lostLeadsCount = leads.filter((l) => l.status === 'Lost').length

  const leadPipeline = [
    {
      stage: 'New Leads',
      count: newLeadsCount,
      percentage: calcPercent(newLeadsCount, totalLeads),
      context: `${calcPercent(newLeadsCount, totalLeads)}% of pipeline`,
      barColor: 'bg-odw-primary',
      textColor: 'text-odw-primary',
      badgeBg: 'bg-odw-primary-soft text-odw-primary',
      dotColor: '#EF520B',
    },
    {
      stage: 'Qualified',
      count: qualifiedLeadsCount,
      percentage: calcPercent(qualifiedLeadsCount, totalLeads),
      context: `${calcPercent(qualifiedLeadsCount, totalLeads)}% of pipeline`,
      barColor: 'bg-slate-400',
      textColor: 'text-slate-700',
      badgeBg: 'bg-slate-100 text-slate-600',
      dotColor: '#94A3B8',
    },
    {
      stage: 'Converted',
      count: convertedLeadsCount,
      percentage: calcPercent(convertedLeadsCount, totalLeads),
      context: `${calcPercent(convertedLeadsCount, totalLeads)}% conversion`,
      barColor: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      badgeBg: 'bg-emerald-50 text-emerald-700',
      dotColor: '#10B981',
    },
    {
      stage: 'Lost',
      count: lostLeadsCount,
      percentage: calcPercent(lostLeadsCount, totalLeads),
      context: `${calcPercent(lostLeadsCount, totalLeads)}% dropped`,
      barColor: 'bg-rose-400',
      textColor: 'text-rose-600',
      badgeBg: 'bg-rose-50 text-rose-600',
      dotColor: '#F87171',
    },
  ]

  // ---------------------------------------------------------------------------
  // 3. PROJECT DELIVERY DERIVATION
  // ---------------------------------------------------------------------------
  // Uses public.projects.project_status
  // Approved statuses: Planning, In Progress, Review, On Hold, Completed
  // Project progress is task-derived: completed tasks / total tasks * 100
  const planningCount = projects.filter((p) => p.project_status === 'Planning').length
  const inProgressProjCount = projects.filter((p) => p.project_status === 'In Progress').length
  const reviewProjCount = projects.filter((p) => p.project_status === 'Review').length
  const completedProjCount = projects.filter((p) => p.project_status === 'Completed').length
  const onHoldProjCount = projects.filter((p) => p.project_status === 'On Hold').length

  const totalProjects = projects.length

  const projectDelivery = {
    total: totalProjects,
    statuses: [
      {
        name: 'Planning',
        count: planningCount,
        percentage: calcPercent(planningCount, totalProjects),
        dotColor: '#94A3B8',
        barColor: 'bg-slate-300',
        isHighlighted: false,
      },
      {
        name: 'In Progress',
        count: inProgressProjCount,
        percentage: calcPercent(inProgressProjCount, totalProjects),
        dotColor: '#EF520B',
        barColor: 'bg-odw-primary',
        isHighlighted: true,
      },
      {
        name: 'Review',
        count: reviewProjCount,
        percentage: calcPercent(reviewProjCount, totalProjects),
        dotColor: '#F59E0B',
        barColor: 'bg-amber-400',
        isHighlighted: false,
      },
      {
        name: 'Completed',
        count: completedProjCount,
        percentage: calcPercent(completedProjCount, totalProjects),
        dotColor: '#10B981',
        barColor: 'bg-emerald-500',
        isHighlighted: true,
      },
      ...(onHoldProjCount > 0
        ? [
            {
              name: 'On Hold',
              count: onHoldProjCount,
              percentage: calcPercent(onHoldProjCount, totalProjects),
              dotColor: '#64748B',
              barColor: 'bg-slate-400',
              isHighlighted: false,
            },
          ]
        : []),
    ],
  }

  // ---------------------------------------------------------------------------
  // 4. TASK HEALTH DERIVATION
  // ---------------------------------------------------------------------------
  // Approved task statuses: To Do, In Progress, Review, Completed, Blocked
  // Task completion: completed tasks / total tasks * 100 (0% if total tasks = 0)
  const completedTasksCount = tasks.filter((t) => t.status === 'Completed').length
  const inProgressTasksCount = tasks.filter((t) => t.status === 'In Progress').length
  const toDoTasksCount = tasks.filter((t) => t.status === 'To Do').length
  const reviewTasksCount = tasks.filter((t) => t.status === 'Review').length
  const blockedTasksCount = tasks.filter((t) => t.status === 'Blocked').length

  const totalTasks = tasks.length
  const taskCompletionPercentage = calcPercent(completedTasksCount, totalTasks)

  const taskHealth = {
    completionPercentage: taskCompletionPercentage,
    completedCount: completedTasksCount,
    totalTracked: totalTasks,
    supportingText:
      totalTasks > 0
        ? `${completedTasksCount} of ${totalTasks} tracked tasks completed`
        : 'No tasks tracked yet',
    breakdown: [
      {
        status: 'Completed',
        count: completedTasksCount,
        dotColor: '#10B981',
        textColor: 'text-emerald-600',
        barColor: 'bg-emerald-500',
      },
      {
        status: 'In Progress',
        count: inProgressTasksCount,
        dotColor: '#EF520B',
        textColor: 'text-odw-primary',
        barColor: 'bg-odw-primary',
      },
      {
        status: 'To Do',
        count: toDoTasksCount,
        dotColor: '#64748B',
        textColor: 'text-slate-600',
        barColor: 'bg-slate-400',
      },
      {
        status: 'Review',
        count: reviewTasksCount,
        dotColor: '#F59E0B',
        textColor: 'text-amber-600',
        barColor: 'bg-amber-400',
      },
      {
        status: 'Blocked',
        count: blockedTasksCount,
        dotColor: '#EF4444',
        textColor: 'text-rose-600',
        barColor: 'bg-rose-500',
      },
    ],
  }

  // ---------------------------------------------------------------------------
  // 5. PAYMENT HEALTH DERIVATION
  // ---------------------------------------------------------------------------
  // Approved statuses: Received, Pending, Partial, Refunded
  const receivedAmount = payments
    .filter((p) => p.status === 'Received')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

  const pendingAmount = payments
    .filter((p) => p.status === 'Pending')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

  const partialAmount = payments
    .filter((p) => p.status === 'Partial')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

  const refundedAmount = payments
    .filter((p) => p.status === 'Refunded')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

  const totalTrackedPayments =
    receivedAmount + pendingAmount + partialAmount + refundedAmount

  const paymentHealth = {
    totalTracked: formatINR(totalTrackedPayments),
    figures: [
      {
        label: 'Received',
        amount: formatINR(receivedAmount),
        percentage: calcPercent(receivedAmount, totalTrackedPayments),
        color: 'text-emerald-600',
        barColor: 'bg-emerald-500',
        dotColor: '#10B981',
      },
      {
        label: 'Pending',
        amount: formatINR(pendingAmount),
        percentage: calcPercent(pendingAmount, totalTrackedPayments),
        color: 'text-odw-primary',
        barColor: 'bg-odw-primary',
        dotColor: '#EF520B',
      },
      {
        label: 'Partial',
        amount: formatINR(partialAmount),
        percentage: calcPercent(partialAmount, totalTrackedPayments),
        color: 'text-amber-600',
        barColor: 'bg-amber-500',
        dotColor: '#F59E0B',
      },
    ],
  }

  // ---------------------------------------------------------------------------
  // 6. ACTIVITY TREND (6-MONTH TIMELINE)
  // ---------------------------------------------------------------------------
  const past6Months = getPast6Months()
  const activityTrend = past6Months.map(({ month, year, monthNum }) => {
    const monthLeads = leads.filter((l) => {
      if (!l.created_at) return false
      const d = new Date(l.created_at)
      return d.getFullYear() === year && d.getMonth() === monthNum
    }).length

    const monthProjects = projects.filter((p) => {
      if (!p.created_at) return false
      const d = new Date(p.created_at)
      return d.getFullYear() === year && d.getMonth() === monthNum
    }).length

    return {
      month,
      leads: monthLeads,
      projects: monthProjects,
    }
  })

  // ---------------------------------------------------------------------------
  // 7. BUSINESS PULSE: UPCOMING WORK & RECENT ACTIVITY
  // ---------------------------------------------------------------------------
  const upcomingItems = []

  // Projects not completed
  projects
    .filter((p) => p.project_status !== 'Completed')
    .slice(0, 3)
    .forEach((p) => {
      upcomingItems.push({
        id: `proj-${p.id}`,
        title: p.name || 'Untitled Project',
        type: 'Project',
        meta: p.service || 'Project',
        icon: 'FolderKanban',
        due: p.deadline || 'In Progress',
        isUrgent: p.priority === 'Urgent' || p.priority === 'High',
        priority: p.priority || 'Medium',
        priorityBadge:
          p.priority === 'Urgent' || p.priority === 'High'
            ? 'bg-rose-50 text-rose-600 border-rose-200/70'
            : 'bg-amber-50 text-amber-700 border-amber-200/70',
        iconBg: 'bg-odw-primary-soft text-odw-primary',
      })
    })

  // Tasks not completed
  tasks
    .filter((t) => t.status !== 'Completed')
    .slice(0, 3)
    .forEach((t) => {
      upcomingItems.push({
        id: `task-${t.id}`,
        title: t.task_name || 'Untitled Task',
        type: 'Task',
        meta: 'Task',
        icon: 'ListChecks',
        due: t.deadline || 'Open',
        isUrgent: t.priority === 'Urgent' || t.priority === 'High',
        priority: t.priority || 'Medium',
        priorityBadge:
          t.priority === 'Urgent' || t.priority === 'High'
            ? 'bg-rose-50 text-rose-600 border-rose-200/70'
            : 'bg-amber-50 text-amber-700 border-amber-200/70',
        iconBg: 'bg-slate-100 text-slate-600',
      })
    })

  // Pending payments (excluded for members)
  if (!isMember) {
    payments
      .filter((p) => p.status === 'Pending')
      .slice(0, 2)
      .forEach((p) => {
        upcomingItems.push({
          id: `pay-${p.id}`,
          title: p.payment_number ? `Payment ${p.payment_number}` : 'Pending Payment',
          type: 'Payment',
          meta: formatINR(p.amount),
          icon: 'CreditCard',
          due: p.payment_date || 'Awaiting Clearance',
          isUrgent: false,
          priority: 'High',
          priorityBadge: 'bg-rose-50 text-rose-600 border-rose-200/70',
          iconBg: 'bg-emerald-50 text-emerald-600',
        })
      })
  }

  // Recent operational activity across tables
  const activityEvents = []

  leads.slice(0, 3).forEach((l) => {
    activityEvents.push({
      id: `act-lead-${l.id}`,
      title: l.status === 'Converted' ? 'Lead converted' : 'New lead received',
      entity: l.name || l.company || 'New Lead',
      timestamp: formatRelativeTime(l.created_at),
      created_at: l.created_at,
      icon: l.status === 'Converted' ? 'UserCheck' : 'UserPlus',
      iconBg:
        l.status === 'Converted'
          ? 'bg-emerald-50 text-emerald-600 border-emerald-200/60'
          : 'bg-odw-primary-soft text-odw-primary border-orange-200/60',
    })
  })

  projects.slice(0, 3).forEach((p) => {
    activityEvents.push({
      id: `act-proj-${p.id}`,
      title:
        p.project_status === 'Completed'
          ? 'Project completed'
          : 'Project active',
      entity: p.name || 'Project',
      timestamp: formatRelativeTime(p.created_at),
      created_at: p.created_at,
      icon: 'FolderPlus',
      iconBg: 'bg-slate-100 text-slate-700 border-slate-200/60',
    })
  })

  tasks.slice(0, 3).forEach((t) => {
    activityEvents.push({
      id: `act-task-${t.id}`,
      title: t.status === 'Completed' ? 'Task completed' : 'Task updated',
      entity: t.task_name || 'Project Task',
      timestamp: formatRelativeTime(t.created_at),
      created_at: t.created_at,
      icon: 'CheckCircle2',
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200/60',
    })
  })

  if (!isMember) {
    payments.slice(0, 3).forEach((p) => {
      activityEvents.push({
        id: `act-pay-${p.id}`,
        title: p.status === 'Received' ? 'Payment received' : 'Payment recorded',
        entity: formatINR(p.amount),
        timestamp: formatRelativeTime(p.created_at),
        created_at: p.created_at,
        icon: 'CreditCard',
        iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200/60',
      })
    })
  }

  activityEvents.sort(
    (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
  )

  return {
    kpis,
    overview: {
      leadPipeline,
      totalLeads,
      projectDelivery,
      paymentHealth: !isMember ? paymentHealth : null,
      taskHealth,
      activityTrend,
    },
    pulse: {
      upcomingWork: upcomingItems.slice(0, 4),
      recentActivity: activityEvents.slice(0, 5),
    },
  }
}
