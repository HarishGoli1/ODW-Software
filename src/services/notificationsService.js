import { supabase } from '../lib/supabase.js'

/**
 * Returns current date in local YYYY-MM-DD format (date-only safe)
 */
export const getLocalTodayString = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Returns a future/past date YYYY-MM-DD string offset by days from today (date-only safe)
 */
export const getOffsetDateString = (daysOffset = 0) => {
  const d = new Date()
  d.setDate(d.getDate() + daysOffset)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Normalizes an ISO string or date value to a clean YYYY-MM-DD string
 */
export const toDateOnlyString = (val) => {
  if (!val) return ''
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) {
    return val.slice(0, 10)
  }
  try {
    const d = new Date(val)
    if (isNaN(d.getTime())) return ''
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } catch {
    return ''
  }
}

/**
 * Severity priority ordering: urgent (1) > warning (2) > info (3) > success (4)
 */
export const SEVERITY_RANK = {
  urgent: 1,
  warning: 2,
  info: 3,
  success: 4,
}

/**
 * Pure function: Derives normalized notification objects from raw data
 * @param {Object} datasets - { tasks, projects, payments, proposals, leads }
 * @returns {Array} Array of normalized notification objects
 */
export const deriveNotifications = ({
  tasks = [],
  projects = [],
  payments = [],
  proposals = [],
  leads = [],
} = {}) => {
  const today = getLocalTodayString()
  const in48Hours = getOffsetDateString(2)
  const in3Days = getOffsetDateString(3)

  const notifications = []

  // ==========================================
  // 1. TASK NOTIFICATIONS
  // Columns: status, priority, deadline, task_name, assigned_to
  // Only for tasks where status !== 'Completed'
  // ==========================================
  tasks.forEach((task) => {
    if (!task || task.status === 'Completed') return

    const deadline = toDateOnlyString(task.deadline)
    const taskName = task.task_name ? `"${task.task_name}"` : 'Untitled task'

    // Condition 1: Overdue
    if (deadline && deadline < today) {
      notifications.push({
        id: `task-overdue-${task.id}`,
        type: 'task',
        severity: 'urgent',
        title: 'Task overdue',
        message: `Task ${taskName} was due on ${deadline}.`,
        createdAt: task.created_at || today,
        entityId: task.id,
        actionUrl: '/tasks',
        isRead: false,
        metadata: {
          assigned_to: task.assigned_to,
          status: task.status,
          priority: task.priority,
          deadline: task.deadline,
        },
      })
    }
    // Condition 2: Due Today
    else if (deadline && deadline === today) {
      notifications.push({
        id: `task-due-today-${task.id}`,
        type: 'task',
        severity: 'warning',
        title: 'Task due today',
        message: `Task ${taskName} is due today.`,
        createdAt: task.created_at || today,
        entityId: task.id,
        actionUrl: '/tasks',
        isRead: false,
        metadata: {
          assigned_to: task.assigned_to,
          status: task.status,
          priority: task.priority,
          deadline: task.deadline,
        },
      })
    }
    // Condition 3: Upcoming (within next 48 hours)
    else if (deadline && deadline > today && deadline <= in48Hours) {
      notifications.push({
        id: `task-upcoming-${task.id}`,
        type: 'task',
        severity: 'warning',
        title: 'Upcoming task deadline',
        message: `Task ${taskName} is due on ${deadline}.`,
        createdAt: task.created_at || today,
        entityId: task.id,
        actionUrl: '/tasks',
        isRead: false,
        metadata: {
          assigned_to: task.assigned_to,
          status: task.status,
          priority: task.priority,
          deadline: task.deadline,
        },
      })
    }

    // Condition 4: Blocked task
    if (task.status === 'Blocked') {
      notifications.push({
        id: `task-blocked-${task.id}`,
        type: 'task',
        severity: 'urgent',
        title: 'Task blocked',
        message: `Task ${taskName} is currently blocked and requires attention.`,
        createdAt: task.created_at || today,
        entityId: task.id,
        actionUrl: '/tasks',
        isRead: false,
        metadata: {
          assigned_to: task.assigned_to,
          status: task.status,
          priority: task.priority,
        },
      })
    }

    // Condition 5: Urgent task
    if (task.priority === 'Urgent') {
      notifications.push({
        id: `task-urgent-${task.id}`,
        type: 'task',
        severity: 'urgent',
        title: 'Urgent task',
        message: `Task ${taskName} has urgent priority.`,
        createdAt: task.created_at || today,
        entityId: task.id,
        actionUrl: '/tasks',
        isRead: false,
        metadata: {
          assigned_to: task.assigned_to,
          status: task.status,
          priority: task.priority,
        },
      })
    }
  })

  // ==========================================
  // 2. PROJECT NOTIFICATIONS
  // Columns: project_status, deadline, project_name, assigned_to
  // Only for projects where project_status !== 'Completed'
  // ==========================================
  projects.forEach((project) => {
    if (!project || project.project_status === 'Completed') return

    const deadline = toDateOnlyString(project.deadline)
    const projectName = project.project_name ? `"${project.project_name}"` : 'Untitled project'

    // Condition 1: Overdue project
    if (deadline && deadline < today) {
      notifications.push({
        id: `project-overdue-${project.id}`,
        type: 'project',
        severity: 'urgent',
        title: 'Project overdue',
        message: `Project ${projectName} passed its deadline (${deadline}).`,
        createdAt: project.created_at || today,
        entityId: project.id,
        actionUrl: '/projects',
        isRead: false,
        metadata: {
          assigned_to: project.assigned_to,
          project_status: project.project_status,
          deadline: project.deadline,
        },
      })
    }
    // Condition 2: Upcoming project deadline (within next 3 days)
    else if (deadline && deadline >= today && deadline <= in3Days) {
      notifications.push({
        id: `project-upcoming-${project.id}`,
        type: 'project',
        severity: 'warning',
        title: 'Upcoming project deadline',
        message: `Project ${projectName} is due on ${deadline}.`,
        createdAt: project.created_at || today,
        entityId: project.id,
        actionUrl: '/projects',
        isRead: false,
        metadata: {
          assigned_to: project.assigned_to,
          project_status: project.project_status,
          deadline: project.deadline,
        },
      })
    }

    // Condition 3: Project in Review
    if (project.project_status === 'Review') {
      notifications.push({
        id: `project-review-${project.id}`,
        type: 'project',
        severity: 'info',
        title: 'Project in review',
        message: `Project ${projectName} is currently in client review phase.`,
        createdAt: project.created_at || today,
        entityId: project.id,
        actionUrl: '/projects',
        isRead: false,
        metadata: {
          assigned_to: project.assigned_to,
          project_status: project.project_status,
        },
      })
    }
  })

  // ==========================================
  // 3. PAYMENT NOTIFICATIONS
  // Columns: status, amount, payment_number
  // Valid statuses: Received, Pending, Partial, Refunded
  // ==========================================
  payments.forEach((payment) => {
    if (!payment) return

    const payNum = payment.payment_number || 'Payment'
    const amt = typeof payment.amount === 'number' ? `₹${payment.amount.toLocaleString('en-IN')}` : '₹0'

    // Condition 1: Pending payment
    if (payment.status === 'Pending') {
      notifications.push({
        id: `payment-pending-${payment.id}`,
        type: 'payment',
        severity: 'warning',
        title: 'Pending payment',
        message: `${payNum} of ${amt} is pending clearance.`,
        createdAt: payment.created_at || today,
        entityId: payment.id,
        actionUrl: '/payments',
        isRead: false,
        metadata: {
          amount: payment.amount,
          status: payment.status,
          client_id: payment.client_id,
        },
      })
    }
    // Condition 2: Partial payment
    else if (payment.status === 'Partial') {
      notifications.push({
        id: `payment-partial-${payment.id}`,
        type: 'payment',
        severity: 'warning',
        title: 'Partial payment',
        message: `${payNum} was recorded with partial installment of ${amt}.`,
        createdAt: payment.created_at || today,
        entityId: payment.id,
        actionUrl: '/payments',
        isRead: false,
        metadata: {
          amount: payment.amount,
          status: payment.status,
          client_id: payment.client_id,
        },
      })
    }
    // Condition 3: Received payment
    else if (payment.status === 'Received') {
      notifications.push({
        id: `payment-received-${payment.id}`,
        type: 'payment',
        severity: 'success',
        title: 'Payment received',
        message: `${payNum} of ${amt} received and settled.`,
        createdAt: payment.created_at || today,
        entityId: payment.id,
        actionUrl: '/payments',
        isRead: false,
        metadata: {
          amount: payment.amount,
          status: payment.status,
          client_id: payment.client_id,
        },
      })
    }
  })

  // ==========================================
  // 4. PROPOSAL NOTIFICATIONS
  // Columns: status, valid_until, title, proposal_number
  // Valid statuses: Draft, Sent, Viewed, Accepted, Rejected, Expired
  // ==========================================
  proposals.forEach((proposal) => {
    if (!proposal) return

    const propTitle = proposal.title
      ? `"${proposal.title}"`
      : proposal.proposal_number || 'Proposal'
    const validUntil = toDateOnlyString(proposal.valid_until)

    // Condition 1: Expiring proposal (within next 3 days for Sent or Viewed)
    if (
      validUntil &&
      validUntil >= today &&
      validUntil <= in3Days &&
      (proposal.status === 'Sent' || proposal.status === 'Viewed')
    ) {
      notifications.push({
        id: `proposal-expiring-${proposal.id}`,
        type: 'proposal',
        severity: 'warning',
        title: 'Proposal expiring soon',
        message: `Proposal ${propTitle} will expire on ${validUntil}.`,
        createdAt: proposal.created_at || today,
        entityId: proposal.id,
        actionUrl: '/proposals',
        isRead: false,
        metadata: {
          status: proposal.status,
          valid_until: proposal.valid_until,
          client_id: proposal.client_id,
        },
      })
    }
    // Condition 2: Accepted
    else if (proposal.status === 'Accepted') {
      notifications.push({
        id: `proposal-accepted-${proposal.id}`,
        type: 'proposal',
        severity: 'success',
        title: 'Proposal accepted',
        message: `Proposal ${propTitle} was accepted by the client.`,
        createdAt: proposal.created_at || today,
        entityId: proposal.id,
        actionUrl: '/proposals',
        isRead: false,
        metadata: {
          status: proposal.status,
          client_id: proposal.client_id,
        },
      })
    }
    // Condition 3: Rejected
    else if (proposal.status === 'Rejected') {
      notifications.push({
        id: `proposal-rejected-${proposal.id}`,
        type: 'proposal',
        severity: 'urgent',
        title: 'Proposal rejected',
        message: `Proposal ${propTitle} was marked as rejected.`,
        createdAt: proposal.created_at || today,
        entityId: proposal.id,
        actionUrl: '/proposals',
        isRead: false,
        metadata: {
          status: proposal.status,
          client_id: proposal.client_id,
        },
      })
    }
    // Condition 4: Expired
    else if (proposal.status === 'Expired') {
      notifications.push({
        id: `proposal-expired-${proposal.id}`,
        type: 'proposal',
        severity: 'urgent',
        title: 'Proposal expired',
        message: `Proposal ${propTitle} has expired.`,
        createdAt: proposal.created_at || today,
        entityId: proposal.id,
        actionUrl: '/proposals',
        isRead: false,
        metadata: {
          status: proposal.status,
          client_id: proposal.client_id,
        },
      })
    }
  })

  // ==========================================
  // 5. LEAD NOTIFICATIONS
  // Columns: status, name, company, service
  // Valid statuses: New, Qualified, Converted, Lost
  // ==========================================
  leads.forEach((lead) => {
    if (!lead) return

    const leadName = lead.name || 'New lead'
    const companyInfo = lead.company ? ` (${lead.company})` : ''

    // Condition 1: New lead
    if (lead.status === 'New') {
      notifications.push({
        id: `lead-new-${lead.id}`,
        type: 'lead',
        severity: 'info',
        title: 'New lead received',
        message: `New prospect ${leadName}${companyInfo} awaiting qualification.`,
        createdAt: lead.created_at || today,
        entityId: lead.id,
        actionUrl: '/leads',
        isRead: false,
        metadata: {
          status: lead.status,
        },
      })
    }
    // Condition 2: Converted lead
    else if (lead.status === 'Converted') {
      notifications.push({
        id: `lead-converted-${lead.id}`,
        type: 'lead',
        severity: 'success',
        title: 'Lead converted',
        message: `Lead ${leadName}${companyInfo} successfully converted to client.`,
        createdAt: lead.created_at || today,
        entityId: lead.id,
        actionUrl: '/leads',
        isRead: false,
        metadata: {
          status: lead.status,
        },
      })
    }
    // Condition 3: Lost lead
    else if (lead.status === 'Lost') {
      notifications.push({
        id: `lead-lost-${lead.id}`,
        type: 'lead',
        severity: 'warning',
        title: 'Lead lost',
        message: `Lead ${leadName}${companyInfo} was marked as lost.`,
        createdAt: lead.created_at || today,
        entityId: lead.id,
        actionUrl: '/leads',
        isRead: false,
        metadata: {
          status: lead.status,
        },
      })
    }
  })

  return notifications
}

/**
 * Filters derived notifications according to the employee's system role and assignment
 * @param {Array} notifications - Array of notification objects
 * @param {Object|null} employee - Current employee profile from AuthContext
 * @returns {Array} Filtered notification objects
 */
export const filterNotificationsForEmployee = (notifications = [], employee = null) => {
  if (!employee) return notifications

  const systemRole = (employee.system_role || 'member').toLowerCase()

  // Admin and Manager roles receive workspace-wide operational notifications
  if (systemRole === 'admin' || systemRole === 'manager') {
    return notifications
  }

  // Member role receives personal assignments only
  const employeeId = employee.id

  return notifications.filter((notif) => {
    if (notif.type === 'task' || notif.type === 'project') {
      return notif.metadata?.assigned_to === employeeId
    }
    // Exclude general financial and lead items for regular members
    return false
  })
}

/**
 * Sorts notifications by severity rank (urgent -> warning -> info -> success)
 * and then by newest createdAt date first.
 * @param {Array} notifications - Array of notification objects
 * @returns {Array} Sorted notifications
 */
export const sortNotifications = (notifications = []) => {
  return [...notifications].sort((a, b) => {
    // 1. Severity rank
    const rankA = SEVERITY_RANK[a.severity] || 5
    const rankB = SEVERITY_RANK[b.severity] || 5
    if (rankA !== rankB) {
      return rankA - rankB
    }

    // 2. Newest date first
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return timeB - timeA
  })
}

/**
 * 1. Fetch live operational data from Supabase and derive notifications
 * @param {Object|null} employee - Current employee object from AuthContext
 * @returns {Promise<Array>} Capped at 25 notifications
 */
export const getNotifications = async (employee = null) => {
  const role = (employee?.system_role || 'member').toLowerCase()
  const isMember = role === 'member'

  // Members must NOT query payments; they only receive personal project and task notifications
  const queryPromises = [
    supabase
      .from('tasks')
      .select('id, task_name, status, priority, deadline, assigned_to, created_at'),
    supabase
      .from('projects')
      .select('id, project_name, project_status, deadline, assigned_to, created_at'),
  ]

  if (!isMember) {
    queryPromises.push(
      supabase
        .from('payments')
        .select('id, payment_number, amount, status, client_id, created_at'),
      supabase
        .from('proposals')
        .select('id, proposal_number, title, status, valid_until, client_id, created_at'),
      supabase
        .from('leads')
        .select('id, name, company, service, status, created_at')
    )
  }

  const results = await Promise.all(queryPromises)

  const tasksRes = results[0] || {}
  const projectsRes = results[1] || {}
  const paymentsRes = !isMember ? results[2] || {} : { data: [], error: null }
  const proposalsRes = !isMember ? results[3] || {} : { data: [], error: null }
  const leadsRes = !isMember ? results[4] || {} : { data: [], error: null }

  if (tasksRes.error) {
    console.warn('notificationsService tasks fetch warning:', tasksRes.error)
  }
  if (projectsRes.error) {
    console.warn('notificationsService projects fetch warning:', projectsRes.error)
  }
  if (paymentsRes.error) {
    console.warn('notificationsService payments fetch warning:', paymentsRes.error)
  }
  if (proposalsRes.error) {
    console.warn('notificationsService proposals fetch warning:', proposalsRes.error)
  }
  if (leadsRes.error) {
    console.warn('notificationsService leads fetch warning:', leadsRes.error)
  }

  const tasks = tasksRes.data || []
  const projects = projectsRes.data || []
  const payments = paymentsRes.data || []
  const proposals = proposalsRes.data || []
  const leads = leadsRes.data || []

  // 1. Derive notifications
  const rawNotifications = deriveNotifications({
    tasks: tasks || [],
    projects: projects || [],
    payments: payments || [],
    proposals: proposals || [],
    leads: leads || [],
  })

  // 2. Target by employee role
  const targeted = filterNotificationsForEmployee(rawNotifications, employee)

  // 3. Sort by severity and timestamp
  const sorted = sortNotifications(targeted)

  // 4. Cap at maximum 25 items
  return sorted.slice(0, 25)
}

/**
 * 2. Get high-level notification summary metrics
 * @param {Object|null} employee - Current employee object from AuthContext
 * @returns {Promise<Object>} Aggregated counts
 */
export const getNotificationSummary = async (employee = null) => {
  const notifications = await getNotifications(employee)

  return {
    total: notifications.length,
    unread: notifications.filter((n) => !n.isRead).length,
    urgent: notifications.filter((n) => n.severity === 'urgent').length,
    warning: notifications.filter((n) => n.severity === 'warning').length,
    info: notifications.filter((n) => n.severity === 'info').length,
    success: notifications.filter((n) => n.severity === 'success').length,
    byType: {
      task: notifications.filter((n) => n.type === 'task').length,
      project: notifications.filter((n) => n.type === 'project').length,
      payment: notifications.filter((n) => n.type === 'payment').length,
      proposal: notifications.filter((n) => n.type === 'proposal').length,
      lead: notifications.filter((n) => n.type === 'lead').length,
    },
  }
}
