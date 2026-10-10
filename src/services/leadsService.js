import { supabase } from '../lib/supabase'

/**
 * Format ISO timestamp into UI display string ('Oct 5, 2026')
 */
const formatLeadDate = (isoString) => {
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
  if (!name) return 'LD'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }
  return name.trim().slice(0, 2).toUpperCase()
}

/**
 * Maps a public.leads database row to the Phase 1 UI-compatible object
 */
export const mapLeadFromDB = (row) => {
  if (!row) return null
  return {
    id: row.id,
    name: row.name || '',
    company: row.company || '',
    email: row.email || '',
    phone: row.phone || '',
    service: row.service || 'Business Website',
    source: row.source || 'Website',
    status: row.status || 'New',
    clientId: row.client_id || null,
    created: formatLeadDate(row.created_at),
    createdAt: row.created_at,
    initials: deriveInitials(row.name),
    message: null,
    notes: null,
  }
}

/**
 * 1. Fetch all leads ordered by newest first
 */
export const getLeads = async () => {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('leadsService.getLeads error:', error)
    throw error
  }

  return (data || []).map(mapLeadFromDB)
}

/**
 * 2. Fetch single lead by ID
 */
export const getLeadById = async (id) => {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error(`leadsService.getLeadById(${id}) error:`, error)
    throw error
  }

  return mapLeadFromDB(data)
}

/**
 * 3. Create a new lead in public.leads
 * Only sends approved database columns:
 * name, company, email, phone, service, source, status, client_id
 */
export const createLead = async (payload) => {
  const dbPayload = {
    name: payload.name.trim(),
    company: payload.company ? payload.company.trim() : null,
    email: payload.email ? payload.email.trim() : null,
    phone: payload.phone ? payload.phone.trim() : null,
    service: payload.service || 'Business Website',
    source: payload.source || 'Website',
    status: payload.status || 'New',
    client_id: payload.clientId || payload.client_id || null,
  }

  const { data, error } = await supabase
    .from('leads')
    .insert([dbPayload])
    .select()
    .single()

  if (error) {
    console.error('leadsService.createLead error:', error)
    throw error
  }

  return mapLeadFromDB(data)
}

/**
 * 4. Update an existing lead in public.leads
 */
export const updateLead = async (id, payload) => {
  const dbPayload = {}
  if (payload.name !== undefined) dbPayload.name = payload.name.trim()
  if (payload.company !== undefined) dbPayload.company = payload.company ? payload.company.trim() : null
  if (payload.email !== undefined) dbPayload.email = payload.email ? payload.email.trim() : null
  if (payload.phone !== undefined) dbPayload.phone = payload.phone ? payload.phone.trim() : null
  if (payload.service !== undefined) dbPayload.service = payload.service
  if (payload.source !== undefined) dbPayload.source = payload.source
  if (payload.status !== undefined) dbPayload.status = payload.status
  if (payload.clientId !== undefined || payload.client_id !== undefined) {
    dbPayload.client_id = payload.clientId ?? payload.client_id ?? null
  }

  const { data, error } = await supabase
    .from('leads')
    .update(dbPayload)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error(`leadsService.updateLead(${id}) error:`, error)
    throw error
  }

  return mapLeadFromDB(data)
}

/**
 * 5. Delete a lead from public.leads
 */
export const deleteLead = async (id) => {
  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id)

  if (error) {
    console.error(`leadsService.deleteLead(${id}) error:`, error)
    throw error
  }

  return true
}
