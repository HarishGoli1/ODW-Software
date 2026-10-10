import { supabase } from '../lib/supabase'

/**
 * Format ISO timestamp or date string ('YYYY-MM-DD') into UI display format ('Oct 05, 2026')
 */
export const formatPaymentDate = (dateVal) => {
  if (!dateVal) return ''
  try {
    if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
      const [year, month, day] = dateVal.split('-')
      const d = new Date(Number(year), Number(month) - 1, Number(day))
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      })
    }
    const d = new Date(dateVal)
    if (isNaN(d.getTime())) return dateVal
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    })
  } catch {
    return dateVal
  }
}

/**
 * Parse currency or text string into a clean numeric value for PostgreSQL numeric(12,2)
 */
export const parseNumericAmount = (val) => {
  if (val === null || val === undefined || val === '') return 0
  if (typeof val === 'number') return isNaN(val) ? 0 : Math.max(0, val)
  const clean = String(val).replace(/[^0-9.-]+/g, '')
  const num = parseFloat(clean)
  return isNaN(num) ? 0 : Math.max(0, num)
}

/**
 * Maps a public.payments database row to the Phase 1 UI-compatible object
 * @param {Object} row - public.payments row
 * @param {Object} clientMap - Map of client_id -> { id, name, company }
 * @param {Object} projectMap - Map of project_id -> { id, project_name, client_id }
 * @param {Object} proposalMap - Map of proposal_id -> { id, proposal_number, title, client_id }
 */
export const mapPaymentFromDB = (
  row,
  clientMap = {},
  projectMap = {},
  proposalMap = {}
) => {
  if (!row) return null

  const client = clientMap[row.client_id] || {}
  const project = projectMap[row.project_id] || {}
  const proposal = proposalMap[row.proposal_id] || {}

  return {
    id: row.id,
    paymentNumber: row.payment_number || '',
    clientId: row.client_id,
    clientName: client.name || 'Unknown Client',
    company: client.company || client.name || 'Unknown Company',
    projectId: row.project_id || '',
    projectName: project.project_name || project.name || '',
    proposalId: row.proposal_id || '',
    proposalNumber: proposal.proposal_number || '',
    amount: Number(row.amount) || 0,
    paymentDate: row.payment_date || '',
    paymentMethod: row.payment_method || 'Bank Transfer',
    status: row.status || 'Pending',
    reference: row.reference || '',
    notes: row.notes || '',
    createdAt: formatPaymentDate(row.created_at),
    rawCreatedAt: row.created_at,
  }
}

/**
 * Fetch lookup options required by Add/Edit Payment forms:
 * - Live clients from public.clients
 * - Live projects from public.projects
 * - Live proposals from public.proposals
 */
export const getPaymentFormData = async () => {
  const [
    { data: clientsData, error: clientsError },
    { data: projectsData, error: projectsError },
    { data: proposalsData, error: proposalsError },
  ] = await Promise.all([
    supabase.from('clients').select('id, name, company').order('name', { ascending: true }),
    supabase.from('projects').select('id, project_name, client_id').order('project_name', { ascending: true }),
    supabase.from('proposals').select('id, proposal_number, title, client_id').order('proposal_number', { ascending: true }),
  ])

  if (clientsError) console.warn('paymentsService clients lookup warning:', clientsError)
  if (projectsError) console.warn('paymentsService projects lookup warning:', projectsError)
  if (proposalsError) console.warn('paymentsService proposals lookup warning:', proposalsError)

  return {
    clients: clientsData || [],
    projects: projectsData || [],
    proposals: proposalsData || [],
  }
}

/**
 * Safely generates next sequential payment number (e.g. PAY-001, PAY-002)
 * by querying existing payment_number values from public.payments
 */
export const getNextPaymentNumber = async () => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('payment_number')

    if (error) {
      console.warn('Could not query payments for payment number generation:', error)
      return 'PAY-001'
    }

    let maxNum = 0
    ;(data || []).forEach((p) => {
      if (p.payment_number) {
        const match = p.payment_number.match(/\d+/)
        if (match) {
          const num = parseInt(match[0], 10)
          if (num > maxNum) maxNum = num
        }
      }
    })

    const nextNum = maxNum + 1
    return `PAY-${String(nextNum).padStart(3, '0')}`
  } catch {
    return 'PAY-001'
  }
}

/**
 * 1. Fetch payments from public.payments with joined client, project, and proposal information
 */
export const getPayments = async () => {
  const [
    { data: paymentsData, error: paymentsError },
    { data: clientsData, error: clientsError },
    { data: projectsData, error: projectsError },
    { data: proposalsData, error: proposalsError },
  ] = await Promise.all([
    supabase.from('payments').select('*').order('created_at', { ascending: false }),
    supabase.from('clients').select('id, name, company'),
    supabase.from('projects').select('id, project_name, client_id'),
    supabase.from('proposals').select('id, proposal_number, title, client_id'),
  ])

  if (paymentsError) {
    console.error('paymentsService.getPayments error:', paymentsError)
    throw paymentsError
  }
  if (clientsError) console.warn('paymentsService clients fetch warning:', clientsError)
  if (projectsError) console.warn('paymentsService projects fetch warning:', projectsError)
  if (proposalsError) console.warn('paymentsService proposals fetch warning:', proposalsError)

  const rawPayments = paymentsData || []
  const clients = clientsData || []
  const projects = projectsData || []
  const proposals = proposalsData || []

  // Build lookup maps
  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c]))
  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p]))
  const proposalMap = Object.fromEntries(proposals.map((pr) => [pr.id, pr]))

  // Map each payment row
  const payments = rawPayments.map((row) =>
    mapPaymentFromDB(row, clientMap, projectMap, proposalMap)
  )

  return payments
}

/**
 * 2. Fetch single payment by ID
 */
export const getPaymentById = async (id) => {
  const [
    { data: paymentData, error: paymentError },
    { data: clientsData },
    { data: projectsData },
    { data: proposalsData },
  ] = await Promise.all([
    supabase.from('payments').select('*').eq('id', id).single(),
    supabase.from('clients').select('id, name, company'),
    supabase.from('projects').select('id, project_name, client_id'),
    supabase.from('proposals').select('id, proposal_number, title, client_id'),
  ])

  if (paymentError) {
    console.error(`paymentsService.getPaymentById(${id}) error:`, paymentError)
    throw paymentError
  }

  const clientMap = Object.fromEntries((clientsData || []).map((c) => [c.id, c]))
  const projectMap = Object.fromEntries((projectsData || []).map((p) => [p.id, p]))
  const proposalMap = Object.fromEntries((proposalsData || []).map((pr) => [pr.id, pr]))

  return mapPaymentFromDB(paymentData, clientMap, projectMap, proposalMap)
}

/**
 * 3. Create a new payment in public.payments
 * Persists ONLY approved columns:
 * payment_number, client_id, proposal_id, project_id, amount, payment_date, payment_method, status, reference, notes
 *
 * Excludes: id, created_at, clientName, company, projectName, proposalNumber, formatted strings
 */
export const createPayment = async (payload) => {
  let paymentNumber = (payload.paymentNumber || payload.payment_number || '').trim()
  if (!paymentNumber) {
    paymentNumber = await getNextPaymentNumber()
  }

  const dbPayload = {
    payment_number: paymentNumber,
    client_id: payload.clientId || payload.client_id,
    proposal_id: payload.proposalId || payload.proposal_id || null,
    project_id: payload.projectId || payload.project_id || null,
    amount: parseNumericAmount(payload.amount),
    payment_date: payload.paymentDate || payload.payment_date,
    payment_method: payload.paymentMethod || payload.payment_method || 'Bank Transfer',
    status: payload.status || 'Pending',
    reference: payload.reference ? payload.reference.trim() : null,
    notes: payload.notes ? payload.notes.trim() : null,
  }

  const { data, error } = await supabase
    .from('payments')
    .insert([dbPayload])
    .select()
    .single()

  if (error) {
    console.error('paymentsService.createPayment error:', error)
    if (error.code === '23505' || error.message?.includes('payments_payment_number_key')) {
      throw new Error(`Payment number "${paymentNumber}" already exists. Please choose a different payment number.`)
    }
    if (error.code === '23503') {
      throw new Error('Selected client, project, or proposal does not exist or has been removed.')
    }
    throw error
  }

  const { clients, projects, proposals } = await getPaymentFormData()
  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c]))
  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p]))
  const proposalMap = Object.fromEntries(proposals.map((pr) => [pr.id, pr]))

  return mapPaymentFromDB(data, clientMap, projectMap, proposalMap)
}

/**
 * 4. Update an existing payment in public.payments
 * Updates ONLY approved columns:
 * client_id, proposal_id, project_id, amount, payment_date, payment_method, status, reference, notes
 *
 * Must NOT modify: id, payment_number, created_at
 */
export const updatePayment = async (id, payload) => {
  const dbPayload = {}

  if (payload.clientId !== undefined || payload.client_id !== undefined) {
    dbPayload.client_id = payload.clientId ?? payload.client_id
  }
  if (payload.proposalId !== undefined || payload.proposal_id !== undefined) {
    const val = payload.proposalId ?? payload.proposal_id
    dbPayload.proposal_id = val ? val : null
  }
  if (payload.projectId !== undefined || payload.project_id !== undefined) {
    const val = payload.projectId ?? payload.project_id
    dbPayload.project_id = val ? val : null
  }
  if (payload.amount !== undefined) {
    dbPayload.amount = parseNumericAmount(payload.amount)
  }
  if (payload.paymentDate !== undefined || payload.payment_date !== undefined) {
    dbPayload.payment_date = payload.paymentDate ?? payload.payment_date
  }
  if (payload.paymentMethod !== undefined || payload.payment_method !== undefined) {
    dbPayload.payment_method = payload.paymentMethod ?? payload.payment_method
  }
  if (payload.status !== undefined) {
    dbPayload.status = payload.status
  }
  if (payload.reference !== undefined) {
    dbPayload.reference = payload.reference ? payload.reference.trim() : null
  }
  if (payload.notes !== undefined) {
    dbPayload.notes = payload.notes ? payload.notes.trim() : null
  }

  const { data, error } = await supabase
    .from('payments')
    .update(dbPayload)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error(`paymentsService.updatePayment(${id}) error:`, error)
    if (error.code === '23503') {
      throw new Error('Selected client, project, or proposal does not exist or has been removed.')
    }
    throw error
  }

  const { clients, projects, proposals } = await getPaymentFormData()
  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c]))
  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p]))
  const proposalMap = Object.fromEntries(proposals.map((pr) => [pr.id, pr]))

  return mapPaymentFromDB(data, clientMap, projectMap, proposalMap)
}

/**
 * 5. Delete a payment from public.payments by UUID
 */
export const deletePayment = async (id) => {
  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('id', id)

  if (error) {
    console.error(`paymentsService.deletePayment(${id}) error:`, error)
    throw error
  }

  return true
}
