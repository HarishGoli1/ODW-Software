import { supabase } from '../lib/supabase'

/**
 * Format ISO timestamp into UI display string ('Oct 5, 2026')
 */
const formatClientDate = (isoString) => {
  if (!isoString) return ''
  try {
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return isoString
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return isoString
  }
}

/**
 * Derive 2-letter uppercase initials from full name
 */
const deriveInitials = (name) => {
  if (!name) return 'CL'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }
  return name.trim().slice(0, 2).toUpperCase()
}

/**
 * Format a number into Indian Rupee currency string ('₹1,42,000' or '₹0')
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
 * Maps a public.clients database row to the Phase 1 UI-compatible object
 * @param {Object} row - public.clients database row
 * @param {number} projectCount - Derived count of projects linked via public.projects.client_id
 */
export const mapClientFromDB = (row, projectCount = 0) => {
  if (!row) return null
  return {
    id: row.id,
    name: row.name || '',
    company: row.company || '',
    email: row.email || '',
    phone: row.phone || '',
    service: row.service || 'Business Website',
    status: row.status || 'Active',
    payment: row.payment || 'Pending',
    projects: projectCount,
    created: formatClientDate(row.created_at),
    createdAt: row.created_at,
    initials: deriveInitials(row.name),
    notes: null, // Notes are unpersisted in DB; UI displays empty-state fallback
  }
}

/**
 * 1. Fetch all clients from public.clients with:
 * - Project counts derived from public.projects.client_id
 * - Associated active projects and pending payments counts for dynamic summary
 */
export const getClients = async (employee = null) => {
  const role = employee?.system_role?.toLowerCase() || 'member'
  const canAccessPayments = role === 'admin' || role === 'manager'

  // Fetch clients, projects, and payments (if authorized) concurrently
  const queries = [
    supabase.from('clients').select('*').order('created_at', { ascending: false }),
    supabase.from('projects').select('id, client_id, project_status'),
  ]

  if (canAccessPayments) {
    queries.push(supabase.from('payments').select('id, client_id, amount, status'))
  }

  const results = await Promise.all(queries)
  const { data: clientsData, error: clientsError } = results[0]
  const { data: projectsData, error: projectsError } = results[1]
  const paymentsResult = canAccessPayments ? results[2] : { data: [], error: null }
  const paymentsData = paymentsResult.data
  const paymentsError = paymentsResult.error

  if (clientsError) {
    console.error('clientsService.getClients error:', clientsError)
    throw clientsError
  }
  if (projectsError) {
    console.warn('clientsService.getClients projects fetch warning:', projectsError)
  }
  if (paymentsError) {
    console.warn('clientsService.getClients payments fetch warning:', paymentsError)
  }

  const rawClients = clientsData || []
  const projects = projectsData || []
  const payments = paymentsData || []

  // Count projects per client_id
  const projectCountByClient = {}
  projects.forEach((proj) => {
    if (proj.client_id) {
      projectCountByClient[proj.client_id] = (projectCountByClient[proj.client_id] || 0) + 1
    }
  })

  const clients = rawClients.map((row) =>
    mapClientFromDB(row, projectCountByClient[row.id] || 0)
  )

  // Derive dynamic summary metrics strictly from real data
  const clientIdsSet = new Set(clients.map((c) => c.id))

  // Active Projects: projects linked to these clients with active status
  // (or all projects linked to existing clients that are in active project statuses)
  const activeStatuses = ['Planning', 'In Progress', 'Review', 'On Hold']
  const activeProjectsCount = projects.filter(
    (p) => p.client_id && clientIdsSet.has(p.client_id) && activeStatuses.includes(p.project_status)
  ).length

  // Pending Payments: payments linked to these clients where status = 'Pending' (only for admin/manager)
  let pendingPaymentsValue = null
  if (canAccessPayments) {
    const pendingPaymentsSum = payments
      .filter((p) => p.client_id && clientIdsSet.has(p.client_id) && p.status === 'Pending')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
    pendingPaymentsValue = formatINR(pendingPaymentsSum)
  }

  const summary = {
    total: clients.length,
    active: clients.filter((c) => c.status === 'Active').length,
    activeProjects: activeProjectsCount,
    pendingPayments: pendingPaymentsValue,
  }

  return {
    clients,
    summary,
  }
}

/**
 * 2. Fetch single client by ID
 */
export const getClientById = async (id) => {
  const [
    { data: clientData, error: clientError },
    { data: projectsData, error: projectsError },
  ] = await Promise.all([
    supabase.from('clients').select('*').eq('id', id).single(),
    supabase.from('projects').select('id').eq('client_id', id),
  ])

  if (clientError) {
    console.error(`clientsService.getClientById(${id}) error:`, clientError)
    throw clientError
  }
  if (projectsError) {
    console.warn(`clientsService.getClientById(${id}) projects count warning:`, projectsError)
  }

  const projectCount = (projectsData || []).length
  return mapClientFromDB(clientData, projectCount)
}

/**
 * 3. Create a new client in public.clients
 * Inserts ONLY approved columns:
 * name, company, email, phone, service, status, payment
 *
 * Excludes: projects, initials, created, notes, id, created_at
 */
export const createClient = async (payload) => {
  const dbPayload = {
    name: payload.name.trim(),
    company: payload.company ? payload.company.trim() : null,
    email: payload.email ? payload.email.trim() : null,
    phone: payload.phone ? payload.phone.trim() : null,
    service: payload.service || 'Business Website',
    status: payload.status || 'Active',
    payment: payload.payment || 'Pending',
  }

  const { data, error } = await supabase
    .from('clients')
    .insert([dbPayload])
    .select()
    .single()

  if (error) {
    console.error('clientsService.createClient error:', error)
    throw error
  }

  return mapClientFromDB(data, 0)
}

/**
 * 4. Update an existing client in public.clients
 * Updates ONLY approved columns:
 * name, company, email, phone, service, status, payment
 *
 * Excludes: id, projects, initials, created_at, created, notes
 */
export const updateClient = async (id, payload) => {
  const dbPayload = {}
  if (payload.name !== undefined) dbPayload.name = payload.name.trim()
  if (payload.company !== undefined) dbPayload.company = payload.company ? payload.company.trim() : null
  if (payload.email !== undefined) dbPayload.email = payload.email ? payload.email.trim() : null
  if (payload.phone !== undefined) dbPayload.phone = payload.phone ? payload.phone.trim() : null
  if (payload.service !== undefined) dbPayload.service = payload.service
  if (payload.status !== undefined) dbPayload.status = payload.status
  if (payload.payment !== undefined) dbPayload.payment = payload.payment

  const { data, error } = await supabase
    .from('clients')
    .update(dbPayload)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error(`clientsService.updateClient(${id}) error:`, error)
    throw error
  }

  // Preserve the existing projects count passed in payload if available
  const existingProjectsCount = typeof payload.projects === 'number' ? payload.projects : 0
  return mapClientFromDB(data, existingProjectsCount)
}

/**
 * 5. Delete a client from public.clients by UUID
 * Handles foreign key constraint (code 23503) gracefully
 */
export const deleteClient = async (id) => {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)

  if (error) {
    console.error(`clientsService.deleteClient(${id}) error:`, error)

    // Handle foreign key violation 23503 from projects, proposals, or payments
    if (
      error.code === '23503' ||
      (error.message && error.message.toLowerCase().includes('violates foreign key constraint'))
    ) {
      const friendlyError = new Error(
        'Cannot delete this client because they have associated projects, proposals, or payments. Please remove linked records first.'
      )
      friendlyError.code = '23503'
      throw friendlyError
    }

    throw error
  }

  return true
}
