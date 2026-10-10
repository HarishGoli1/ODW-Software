import { supabase } from '../lib/supabase'

/**
 * Format ISO timestamp or date string ('YYYY-MM-DD') into UI display format ('Oct 08, 2026')
 */
export const formatTaskDate = (dateVal) => {
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
 * Maps a public.tasks database row to the Phase 1 UI-compatible object
 * @param {Object} row - public.tasks row
 * @param {Object} projectMap - Map of project_id -> { id, projectName, company, clientName, service }
 * @param {Object} teamMap - Map of member_id -> { id, name }
 */
export const mapTaskFromDB = (row, projectMap = {}, teamMap = {}) => {
  if (!row) return null

  const project = projectMap[row.project_id] || {}
  const member = teamMap[row.assigned_to] || {}

  return {
    id: row.id,
    taskName: row.task_name || '',
    projectId: row.project_id,
    projectName: project.projectName || project.project_name || 'Project',
    clientName: project.clientName || 'Client',
    company: project.company || 'Company',
    service: project.service || 'Service',
    status: row.status || 'To Do',
    priority: row.priority || 'Medium',
    assignedToId: row.assigned_to || null,
    assignedTo: member.name || 'Unassigned',
    deadline: formatTaskDate(row.deadline),
    rawDeadline: row.deadline || '',
    description: row.description || '',
    createdAt: formatTaskDate(row.created_at),
    rawCreatedAt: row.created_at,
  }
}

/**
 * Fetch lookup options required by Add/Edit Task forms:
 * - Live projects from public.projects with joined client info
 * - Live team members from public.team_members
 */
export const getTaskFormData = async () => {
  const [
    { data: projectsData, error: projectsError },
    { data: clientsData, error: clientsError },
    { data: teamData, error: teamError },
  ] = await Promise.all([
    supabase
      .from('projects')
      .select('id, project_name, service, client_id')
      .order('project_name', { ascending: true }),
    supabase
      .from('clients')
      .select('id, name, company'),
    supabase
      .from('team_members')
      .select('id, name, role')
      .order('name', { ascending: true }),
  ])

  if (projectsError) console.warn('tasksService.getTaskFormData projects warning:', projectsError)
  if (clientsError) console.warn('tasksService.getTaskFormData clients warning:', clientsError)
  if (teamError) console.warn('tasksService.getTaskFormData team warning:', teamError)

  const clients = clientsData || []
  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c]))

  const rawProjects = projectsData || []
  const projects = rawProjects.map((p) => {
    const client = clientMap[p.client_id] || {}
    return {
      id: p.id,
      projectName: p.project_name,
      service: p.service || 'Business Website',
      clientId: p.client_id,
      clientName: client.name || 'Client',
      company: client.company || client.name || 'Company',
    }
  })

  return {
    projects,
    teamMembers: teamData || [],
  }
}

/**
 * 1. Fetch tasks from public.tasks (optionally filtered by projectId)
 * Includes:
 * - Project associations (projectName, company, clientName, service)
 * - Team member assignments (name)
 * - Dynamic summary metrics
 */
export const getTasks = async (projectId = null) => {
  let query = supabase.from('tasks').select('*').order('created_at', { ascending: false })
  if (projectId) {
    query = query.eq('project_id', projectId)
  }

  const [
    { data: tasksData, error: tasksError },
    { data: projectsData, error: projectsError },
    { data: clientsData, error: clientsError },
    { data: teamData, error: teamError },
  ] = await Promise.all([
    query,
    supabase.from('projects').select('id, project_name, service, client_id'),
    supabase.from('clients').select('id, name, company'),
    supabase.from('team_members').select('id, name'),
  ])

  if (tasksError) {
    console.error('tasksService.getTasks error:', tasksError)
    throw tasksError
  }
  if (projectsError) console.warn('tasksService projects fetch warning:', projectsError)
  if (clientsError) console.warn('tasksService clients fetch warning:', clientsError)
  if (teamError) console.warn('tasksService team fetch warning:', teamError)

  const rawTasks = tasksData || []
  const clients = clientsData || []
  const rawProjects = projectsData || []
  const teamMembers = teamData || []

  // Build client lookup map
  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c]))

  // Build project lookup map with client details
  const projectMap = {}
  rawProjects.forEach((p) => {
    const client = clientMap[p.client_id] || {}
    projectMap[p.id] = {
      id: p.id,
      projectName: p.project_name,
      service: p.service || 'Business Website',
      clientId: p.client_id,
      clientName: client.name || 'Client',
      company: client.company || client.name || 'Company',
    }
  })

  // Build team member lookup map
  const teamMap = Object.fromEntries(teamMembers.map((m) => [m.id, m]))

  // Map each task
  const tasks = rawTasks.map((row) => mapTaskFromDB(row, projectMap, teamMap))

  // Calculate live dynamic summary
  const summary = {
    total: tasks.length,
    toDo: tasks.filter((t) => t.status === 'To Do').length,
    inProgress: tasks.filter((t) => t.status === 'In Progress').length,
    review: tasks.filter((t) => t.status === 'Review').length,
    completed: tasks.filter((t) => t.status === 'Completed').length,
    blocked: tasks.filter((t) => t.status === 'Blocked').length,
  }

  return {
    tasks,
    summary,
    projects: Object.values(projectMap),
    teamMembers,
  }
}

/**
 * 2. Fetch single task by ID
 */
export const getTaskById = async (id) => {
  const [
    { data: taskData, error: taskError },
    { data: projectsData },
    { data: clientsData },
    { data: teamData },
  ] = await Promise.all([
    supabase.from('tasks').select('*').eq('id', id).single(),
    supabase.from('projects').select('id, project_name, service, client_id'),
    supabase.from('clients').select('id, name, company'),
    supabase.from('team_members').select('id, name'),
  ])

  if (taskError) {
    console.error(`tasksService.getTaskById(${id}) error:`, taskError)
    throw taskError
  }

  const clientMap = Object.fromEntries((clientsData || []).map((c) => [c.id, c]))
  const projectMap = {}
  ;(projectsData || []).forEach((p) => {
    const client = clientMap[p.client_id] || {}
    projectMap[p.id] = {
      id: p.id,
      projectName: p.project_name,
      service: p.service || 'Business Website',
      clientId: p.client_id,
      clientName: client.name || 'Client',
      company: client.company || client.name || 'Company',
    }
  })
  const teamMap = Object.fromEntries((teamData || []).map((m) => [m.id, m]))

  return mapTaskFromDB(taskData, projectMap, teamMap)
}

/**
 * 3. Create a new task in public.tasks
 * Persists ONLY approved columns:
 * task_name, project_id, status, priority, assigned_to, deadline, description
 *
 * Excludes: id, created_at, progress, projectName, clientName, company, service, assignedTo
 */
export const createTask = async (payload) => {
  const dbPayload = {
    task_name: (payload.taskName || payload.task_name || '').trim(),
    project_id: payload.projectId || payload.project_id,
    status: payload.status || 'To Do',
    priority: payload.priority || 'Medium',
    assigned_to: payload.assignedToId || payload.assigned_to || null,
    deadline: payload.deadline || null,
    description: payload.description ? payload.description.trim() : null,
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert([dbPayload])
    .select()
    .single()

  if (error) {
    console.error('tasksService.createTask error:', error)
    throw error
  }

  // Load project & team details for UI presentation
  const { projects, teamMembers } = await getTaskFormData()
  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p]))
  const teamMap = Object.fromEntries(teamMembers.map((m) => [m.id, m]))

  return mapTaskFromDB(data, projectMap, teamMap)
}

/**
 * 4. Update an existing task in public.tasks
 * Updates ONLY approved columns:
 * task_name, project_id, status, priority, assigned_to, deadline, description
 *
 * Excludes: id, created_at, progress
 */
export const updateTask = async (id, payload) => {
  const dbPayload = {}

  if (payload.taskName !== undefined || payload.task_name !== undefined) {
    dbPayload.task_name = (payload.taskName || payload.task_name).trim()
  }
  if (payload.projectId !== undefined || payload.project_id !== undefined) {
    dbPayload.project_id = payload.projectId ?? payload.project_id
  }
  if (payload.status !== undefined) {
    dbPayload.status = payload.status
  }
  if (payload.priority !== undefined) {
    dbPayload.priority = payload.priority
  }
  if (payload.assignedToId !== undefined || payload.assigned_to !== undefined) {
    dbPayload.assigned_to = payload.assignedToId ?? payload.assigned_to ?? null
  }
  if (payload.deadline !== undefined) {
    dbPayload.deadline = payload.deadline || null
  }
  if (payload.description !== undefined) {
    dbPayload.description = payload.description ? payload.description.trim() : null
  }

  const { data, error } = await supabase
    .from('tasks')
    .update(dbPayload)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error(`tasksService.updateTask(${id}) error:`, error)
    throw error
  }

  const { projects, teamMembers } = await getTaskFormData()
  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p]))
  const teamMap = Object.fromEntries(teamMembers.map((m) => [m.id, m]))

  return mapTaskFromDB(data, projectMap, teamMap)
}

/**
 * 5. Delete a task from public.tasks by UUID
 */
export const deleteTask = async (id) => {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)

  if (error) {
    console.error(`tasksService.deleteTask(${id}) error:`, error)
    throw error
  }

  return true
}
