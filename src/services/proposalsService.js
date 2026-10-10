import { supabase } from '../lib/supabase'

/**
 * Format ISO timestamp or date string ('YYYY-MM-DD') into UI display format ('Oct 25, 2026')
 */
export const formatProposalDate = (dateVal) => {
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
 * Maps a public.proposals database row to the Phase 1 UI-compatible object
 * @param {Object} row - public.proposals row
 * @param {Object} clientMap - Map of client_id -> { id, name, company }
 */
export const mapProposalFromDB = (row, clientMap = {}) => {
  if (!row) return null

  const client = clientMap[row.client_id] || {}

  return {
    id: row.id,
    proposalNumber: row.proposal_number || '',
    clientId: row.client_id,
    clientName: client.name || 'Unknown Client',
    company: client.company || client.name || 'Unknown Company',
    title: row.title || '',
    service: row.service || 'Business Website',
    amount: Number(row.amount) || 0,
    status: row.status || 'Draft',
    validUntil: row.valid_until || '',
    formattedValidUntil: formatProposalDate(row.valid_until),
    description: row.description || '',
    createdAt: formatProposalDate(row.created_at),
    rawCreatedAt: row.created_at,
  }
}

/**
 * Fetch lookup options required by Add/Edit Proposal forms:
 * - Live clients from public.clients
 */
export const getProposalFormData = async () => {
  const { data: clientsData, error: clientsError } = await supabase
    .from('clients')
    .select('id, name, company')
    .order('name', { ascending: true })

  if (clientsError) {
    console.warn('proposalsService.getProposalFormData clients warning:', clientsError)
  }

  return {
    clients: clientsData || [],
  }
}

/**
 * Safely generates next sequential proposal number (e.g. PROP-001, PROP-002)
 * by inspecting existing proposal_number values from public.proposals
 */
export const getNextProposalNumber = async () => {
  try {
    const { data, error } = await supabase
      .from('proposals')
      .select('proposal_number')

    if (error) {
      console.warn('Could not query proposals for proposal number generation:', error)
      return 'PROP-001'
    }

    let maxNum = 0
    ;(data || []).forEach((p) => {
      if (p.proposal_number) {
        const match = p.proposal_number.match(/\d+/)
        if (match) {
          const num = parseInt(match[0], 10)
          if (num > maxNum) maxNum = num
        }
      }
    })

    const nextNum = maxNum + 1
    return `PROP-${String(nextNum).padStart(3, '0')}`
  } catch {
    return 'PROP-001'
  }
}

/**
 * 1. Fetch proposals from public.proposals with joined client information
 * Includes:
 * - Client associations (clientName, company)
 * - Dynamic summary metrics
 */
export const getProposals = async () => {
  const [
    { data: proposalsData, error: proposalsError },
    { data: clientsData, error: clientsError },
  ] = await Promise.all([
    supabase.from('proposals').select('*').order('created_at', { ascending: false }),
    supabase.from('clients').select('id, name, company'),
  ])

  if (proposalsError) {
    console.error('proposalsService.getProposals error:', proposalsError)
    throw proposalsError
  }
  if (clientsError) console.warn('proposalsService clients fetch warning:', clientsError)

  const rawProposals = proposalsData || []
  const clients = clientsData || []

  // Build client lookup map
  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c]))

  // Map each proposal
  const proposals = rawProposals.map((row) => mapProposalFromDB(row, clientMap))

  // Calculate live dynamic summary
  const summary = {
    total: proposals.length,
    draft: proposals.filter((p) => p.status === 'Draft').length,
    sent: proposals.filter((p) => p.status === 'Sent').length,
    accepted: proposals.filter((p) => p.status === 'Accepted').length,
  }

  return {
    proposals,
    summary,
    clients,
  }
}

/**
 * 2. Fetch single proposal by ID
 */
export const getProposalById = async (id) => {
  const [
    { data: proposalData, error: proposalError },
    { data: clientsData },
  ] = await Promise.all([
    supabase.from('proposals').select('*').eq('id', id).single(),
    supabase.from('clients').select('id, name, company'),
  ])

  if (proposalError) {
    console.error(`proposalsService.getProposalById(${id}) error:`, proposalError)
    throw proposalError
  }

  const clientMap = Object.fromEntries((clientsData || []).map((c) => [c.id, c]))
  return mapProposalFromDB(proposalData, clientMap)
}

/**
 * 3. Create a new proposal in public.proposals
 * Persists ONLY approved columns:
 * proposal_number, client_id, title, service, amount, status, valid_until, description
 *
 * Excludes: id, created_at, clientName, company, formatted strings
 */
export const createProposal = async (payload) => {
  let proposalNumber = (payload.proposalNumber || payload.proposal_number || '').trim()
  if (!proposalNumber) {
    proposalNumber = await getNextProposalNumber()
  }

  const dbPayload = {
    proposal_number: proposalNumber,
    client_id: payload.clientId || payload.client_id,
    title: (payload.title || '').trim(),
    service: payload.service || null,
    amount: parseNumericAmount(payload.amount),
    status: payload.status || 'Draft',
    valid_until: payload.validUntil || payload.valid_until || null,
    description: payload.description ? payload.description.trim() : null,
  }

  const { data, error } = await supabase
    .from('proposals')
    .insert([dbPayload])
    .select()
    .single()

  if (error) {
    console.error('proposalsService.createProposal error:', error)
    if (error.code === '23505' || error.message?.includes('proposals_proposal_number_key')) {
      throw new Error(`Proposal number "${proposalNumber}" already exists. Please choose a different proposal number.`)
    }
    if (error.code === '23503' || error.message?.includes('proposals_client_id_fkey')) {
      throw new Error('Selected client does not exist or has been removed.')
    }
    throw error
  }

  const { clients } = await getProposalFormData()
  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c]))

  return mapProposalFromDB(data, clientMap)
}

/**
 * 4. Update an existing proposal in public.proposals
 * Updates ONLY approved columns:
 * client_id, title, service, amount, status, valid_until, description
 *
 * Must NOT modify: id, proposal_number, created_at
 */
export const updateProposal = async (id, payload) => {
  const dbPayload = {}

  if (payload.clientId !== undefined || payload.client_id !== undefined) {
    dbPayload.client_id = payload.clientId ?? payload.client_id
  }
  if (payload.title !== undefined) {
    dbPayload.title = payload.title.trim()
  }
  if (payload.service !== undefined) {
    dbPayload.service = payload.service
  }
  if (payload.amount !== undefined) {
    dbPayload.amount = parseNumericAmount(payload.amount)
  }
  if (payload.status !== undefined) {
    dbPayload.status = payload.status
  }
  if (payload.validUntil !== undefined || payload.valid_until !== undefined) {
    dbPayload.valid_until = payload.validUntil ?? payload.valid_until ?? null
  }
  if (payload.description !== undefined) {
    dbPayload.description = payload.description ? payload.description.trim() : null
  }

  const { data, error } = await supabase
    .from('proposals')
    .update(dbPayload)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error(`proposalsService.updateProposal(${id}) error:`, error)
    if (error.code === '23503' || error.message?.includes('proposals_client_id_fkey')) {
      throw new Error('Selected client does not exist or has been removed.')
    }
    throw error
  }

  const { clients } = await getProposalFormData()
  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c]))

  return mapProposalFromDB(data, clientMap)
}

/**
 * 5. Delete a proposal from public.proposals by UUID
 */
export const deleteProposal = async (id) => {
  const { error } = await supabase
    .from('proposals')
    .delete()
    .eq('id', id)

  if (error) {
    console.error(`proposalsService.deleteProposal(${id}) error:`, error)
    throw error
  }

  return true
}
