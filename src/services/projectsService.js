import { supabase } from '../lib/supabase'

/**
 * Format ISO timestamp or date string into UI display format ('Oct 01, 2026')
 */
export const formatProjectDate = (dateVal) => {
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
 * Format number into Indian Rupee currency string ('₹45,000' or '₹0')
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
 * Parse currency or text string into a clean numeric value for PostgreSQL numeric(12,2)
 */
export const parseNumericBudget = (val) => {
  if (val === null || val === undefined || val === '') return null
  const clean = String(val).replace(/[^0-9.-]+/g, '')
  const num = parseFloat(clean)
  return isNaN(num) ? null : num
}

/**
 * Maps a public.projects database row to the Phase 1 UI-compatible object
 * @param {Object} row - public.projects row
 * @param {Object} clientMap - Map of client_id -> { id, name, company }
 * @param {Object} teamMap - Map of member_id -> { id, name }
 * @param {Object} taskStatsMap - Map of project_id -> { totalTasks, completedTasks }
 */
export const mapProjectFromDB = (row, clientMap = {}, teamMap = {}, taskStatsMap = {}) => {
  if (!row) return null

  const client = clientMap[row.client_id] || {}
  const member = teamMap[row.assigned_to] || {}
  const taskStats = taskStatsMap[row.id] || { totalTasks: 0, completedTasks: 0 }

  // Task-derived progress calculation:
  // Math.round((completedTasks / totalTasks) * 100), or 0 when totalTasks = 0
  const totalTasks = taskStats.totalTasks || 0
  const completedTasks = taskStats.completedTasks || 0
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return {
    id: row.id,
    projectName: row.project_name || '',
    clientId: row.client_id,
    clientName: client.name || 'Unknown Client',
    company: client.company || client.name || 'Unknown Company',
    service: row.service || 'Business Website',
    projectStatus: row.project_status || 'Planning',
    priority: row.priority || 'Medium',
    progress,
    startDate: formatProjectDate(row.start_date),
    deadline: formatProjectDate(row.deadline),
    rawStartDate: row.start_date || '',
    rawDeadline: row.deadline || '',
    budget: row.budget !== null && row.budget !== undefined ? formatINR(row.budget) : '₹0',
    rawBudget: row.budget !== null && row.budget !== undefined ? Number(row.budget) : '',
    assignedToId: row.assigned_to || null,
    assignedTo: member.name || 'Unassigned',
    description: row.description || '',
    tasksCount: totalTasks,
    completedTasks,
    createdAt: formatProjectDate(row.created_at),
    rawCreatedAt: row.created_at,
  }
}

/**
 * Fetch lookup options required by Add/Edit Project forms:
 * - Live clients from public.clients
 * - Live team members from public.team_members
 */
export const getProjectFormData = async () => {
  const [
    { data: clientsData, error: clientsError },
    { data: teamData, error: teamError },
  ] = await Promise.all([
    supabase
      .from('clients')
      .select('id, name, company')
      .order('name', { ascending: true }),
    supabase
      .from('team_members')
      .select('id, name, role')
      .order('name', { ascending: true }),
  ])

  if (clientsError) {
    console.warn('projectsService.getProjectFormData clients warning:', clientsError)
  }
  if (teamError) {
    console.warn('projectsService.getProjectFormData team warning:', teamError)
  }

  return {
    clients: clientsData || [],
    teamMembers: teamData || [],
  }
}

/**
 * 1. Fetch all projects with:
 * - Client associations (name, company)
 * - Team member assignments (name)
 * - Task-derived progress metrics (totalTasks, completedTasks, progress)
 * - Dynamic summary counts
 */
export const getProjects = async () => {
  // Fetch projects, clients, team_members, and tasks concurrently
  const [
    { data: projectsData, error: projectsError },
    { data: clientsData, error: clientsError },
    { data: teamData, error: teamError },
    { data: tasksData, error: tasksError },
  ] = await Promise.all([
    supabase.from('projects').select('*').order('created_at', { ascending: false }),
    supabase.from('clients').select('id, name, company'),
    supabase.from('team_members').select('id, name'),
    supabase.from('tasks').select('id, project_id, status'),
  ])

  if (projectsError) {
    console.error('projectsService.getProjects error:', projectsError)
    throw projectsError
  }
  if (clientsError) console.warn('projectsService clients fetch warning:', clientsError)
  if (teamError) console.warn('projectsService team fetch warning:', teamError)
  if (tasksError) console.warn('projectsService tasks fetch warning:', tasksError)

  const rawProjects = projectsData || []
  const clients = clientsData || []
  const teamMembers = teamData || []
  const tasks = tasksData || []

  // Build client lookup map
  const clientMap = {}
  clients.forEach((c) => {
    clientMap[c.id] = c
  })

  // Build team member lookup map
  const teamMap = {}
  teamMembers.forEach((m) => {
    teamMap[m.id] = m
  })

  // Build task statistics lookup map per project_id
  const taskStatsMap = {}
  tasks.forEach((t) => {
    if (t.project_id) {
      if (!taskStatsMap[t.project_id]) {
        taskStatsMap[t.project_id] = { totalTasks: 0, completedTasks: 0 }
      }
      taskStatsMap[t.project_id].totalTasks += 1
      if (t.status === 'Completed') {
        taskStatsMap[t.project_id].completedTasks += 1
      }
    }
  })

  const projects = rawProjects.map((row) =>
    mapProjectFromDB(row, clientMap, teamMap, taskStatsMap)
  )

  // Derive dynamic summary metrics from live records
  const summary = {
    total: projects.length,
    inProgress: projects.filter((p) => p.projectStatus === 'In Progress').length,
    inReview: projects.filter((p) => p.projectStatus === 'Review').length,
    completed: projects.filter((p) => p.projectStatus === 'Completed').length,
  }

  return {
    projects,
    summary,
    clients,
    teamMembers,
  }
}

/**
 * 2. Fetch single project by ID
 */
export const getProjectById = async (id) => {
  const [
    { data: projectData, error: projectError },
    { data: clientsData },
    { data: teamData },
    { data: tasksData },
  ] = await Promise.all([
    supabase.from('projects').select('*').eq('id', id).single(),
    supabase.from('clients').select('id, name, company'),
    supabase.from('team_members').select('id, name'),
    supabase.from('tasks').select('id, project_id, status').eq('project_id', id),
  ])

  if (projectError) {
    console.error(`projectsService.getProjectById(${id}) error:`, projectError)
    throw projectError
  }

  const clientMap = {}
  ;(clientsData || []).forEach((c) => {
    clientMap[c.id] = c
  })

  const teamMap = {}
  ;(teamData || []).forEach((m) => {
    teamMap[m.id] = m
  })

  const taskStatsMap = {
    [id]: {
      totalTasks: (tasksData || []).length,
      completedTasks: (tasksData || []).filter((t) => t.status === 'Completed').length,
    },
  }

  return mapProjectFromDB(projectData, clientMap, teamMap, taskStatsMap)
}

/**
 * 3. Create a new project in public.projects
 * Persists ONLY approved columns:
 * project_name, client_id, service, project_status, priority, start_date, deadline, budget, assigned_to, description
 *
 * Excludes: projectName, clientName, company, progress, tasksCount, completedTasks, createdAt, id, created_at
 */
export const createProject = async (payload) => {
  const dbPayload = {
    project_name: (payload.projectName || payload.project_name || '').trim(),
    client_id: payload.clientId || payload.client_id,
    service: payload.service || 'Business Website',
    project_status: payload.projectStatus || payload.project_status || 'Planning',
    priority: payload.priority || 'Medium',
    start_date: payload.startDate || payload.start_date || null,
    deadline: payload.deadline || null,
    budget: parseNumericBudget(payload.budget),
    assigned_to: payload.assignedToId || payload.assigned_to || null,
    description: payload.description ? payload.description.trim() : null,
  }

  const { data, error } = await supabase
    .from('projects')
    .insert([dbPayload])
    .select()
    .single()

  if (error) {
    console.error('projectsService.createProject error:', error)
    throw error
  }

  // Reload client and team member info for UI presentation
  const { clients, teamMembers } = await getProjectFormData()
  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c]))
  const teamMap = Object.fromEntries(teamMembers.map((m) => [m.id, m]))

  return mapProjectFromDB(data, clientMap, teamMap, {})
}

/**
 * 4. Update an existing project in public.projects
 * Updates ONLY approved columns:
 * project_name, client_id, service, project_status, priority, start_date, deadline, budget, assigned_to, description
 *
 * Excludes: id, created_at, progress, tasksCount, completedTasks
 */
export const updateProject = async (id, payload) => {
  const dbPayload = {}

  if (payload.projectName !== undefined || payload.project_name !== undefined) {
    dbPayload.project_name = (payload.projectName || payload.project_name).trim()
  }
  if (payload.clientId !== undefined || payload.client_id !== undefined) {
    dbPayload.client_id = payload.clientId ?? payload.client_id
  }
  if (payload.service !== undefined) {
    dbPayload.service = payload.service
  }
  if (payload.projectStatus !== undefined || payload.project_status !== undefined) {
    dbPayload.project_status = payload.projectStatus ?? payload.project_status
  }
  if (payload.priority !== undefined) {
    dbPayload.priority = payload.priority
  }
  if (payload.startDate !== undefined || payload.start_date !== undefined) {
    dbPayload.start_date = payload.startDate ?? payload.start_date ?? null
  }
  if (payload.deadline !== undefined) {
    dbPayload.deadline = payload.deadline || null
  }
  if (payload.budget !== undefined) {
    dbPayload.budget = parseNumericBudget(payload.budget)
  }
  if (payload.assignedToId !== undefined || payload.assigned_to !== undefined) {
    dbPayload.assigned_to = payload.assignedToId ?? payload.assigned_to ?? null
  }
  if (payload.description !== undefined) {
    dbPayload.description = payload.description ? payload.description.trim() : null
  }

  const { data, error } = await supabase
    .from('projects')
    .update(dbPayload)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error(`projectsService.updateProject(${id}) error:`, error)
    throw error
  }

  // Preserve existing task counts and lookup details
  const { clients, teamMembers } = await getProjectFormData()
  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c]))
  const teamMap = Object.fromEntries(teamMembers.map((m) => [m.id, m]))
  const taskStatsMap = {
    [id]: {
      totalTasks: payload.tasksCount || 0,
      completedTasks: payload.completedTasks || 0,
    },
  }

  return mapProjectFromDB(data, clientMap, teamMap, taskStatsMap)
}

/**
 * 5. Delete a project from public.projects by UUID
 * Related tasks cascade-delete automatically (tasks.project_id ON DELETE CASCADE)
 */
export const deleteProject = async (id) => {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)

  if (error) {
    console.error(`projectsService.deleteProject(${id}) error:`, error)
    throw error
  }

  return true
}
