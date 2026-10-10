import { useState, useMemo, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  Calendar,
  Search,
  CheckSquare,
  CheckCircle2,
  AlertCircle,
  FolderKanban,
  User,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import ProjectStatusBadge from '../components/projects/ProjectStatusBadge'
import TaskStatusBadge from '../components/tasks/TaskStatusBadge'
import TaskPriorityBadge from '../components/tasks/TaskPriorityBadge'
import TaskDetailsDrawer from '../components/tasks/TaskDetailsDrawer'
import AddTaskDrawer from '../components/tasks/AddTaskDrawer'
import EditTaskDrawer from '../components/tasks/EditTaskDrawer'
import DeleteTaskModal from '../components/tasks/DeleteTaskModal'
import { getProjectById } from '../services/projectsService'
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from '../services/tasksService'
import { useAuth } from '../context/AuthContext'

const TASKS_PER_PAGE = 8

const STATUS_FILTER_OPTIONS = [
  'All',
  'To Do',
  'In Progress',
  'Review',
  'Completed',
  'Blocked',
]

function ProjectTasks() {
  const { employee } = useAuth()
  const role = employee?.system_role?.toLowerCase() || 'member'
  const isMember = role === 'member'
  const canAdd = !isMember
  const canDelete = !isMember
  const canEditTask = useCallback(
    (task) => !isMember || Boolean(employee?.id && task?.assignedToId === employee.id),
    [isMember, employee]
  )

  const { projectId } = useParams()
  const navigate = useNavigate()

  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [teamMembers, setTeamMembers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedTask, setSelectedTask] = useState(null)
  const [editingTask, setEditingTask] = useState(null)
  const [deletingTask, setDeletingTask] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)

  // Load live project and tasks from Supabase
  const loadProjectAndTasks = useCallback(async () => {
    if (!projectId) return
    try {
      setIsLoading(true)
      setFetchError(null)
      const [projectData, tasksResult] = await Promise.all([
        getProjectById(projectId),
        getTasks(projectId),
      ])
      setProject(projectData)
      setTasks(tasksResult.tasks || [])
      setTeamMembers(tasksResult.teamMembers || [])
    } catch (err) {
      console.error('Failed to load project and tasks:', err)
      setFetchError(err.message || 'Failed to load project data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    loadProjectAndTasks()
  }, [loadProjectAndTasks])

  // Project tasks list (tasks are already filtered by projectId via getTasks(projectId))
  const projectTasks = tasks

  // Calculate project-level task progress from ALL project tasks
  const totalTasks = projectTasks.length
  const completedTasks = projectTasks.filter((t) => t.status === 'Completed').length
  const progress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Filter tasks by search and single compact status filter
  const filteredTasks = useMemo(() => {
    return projectTasks.filter((task) => {
      const q = searchQuery.trim().toLowerCase()
      const matchesSearch =
        q === '' ||
        (task.taskName && task.taskName.toLowerCase().includes(q)) ||
        (task.description && task.description.toLowerCase().includes(q)) ||
        (task.assignedTo && task.assignedTo.toLowerCase().includes(q))

      const matchesStatus =
        statusFilter === 'All' || task.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [projectTasks, searchQuery, statusFilter])

  // Dynamic pagination calculations
  const totalFilteredTasks = filteredTasks.length
  const totalPages = Math.max(1, Math.ceil(totalFilteredTasks / TASKS_PER_PAGE))
  const activePage = Math.min(currentPage, totalPages)

  // Page clamping: guard against overflow if items shrink (e.g. deletion, filter)
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  // Reset page when project route changes
  useEffect(() => {
    setCurrentPage(1)
  }, [projectId])

  const startIndex = (activePage - 1) * TASKS_PER_PAGE
  const endIndex = Math.min(startIndex + TASKS_PER_PAGE, totalFilteredTasks)

  const paginatedTasks = useMemo(() => {
    return filteredTasks.slice(startIndex, startIndex + TASKS_PER_PAGE)
  }, [filteredTasks, startIndex])

  // Search & Filter change handlers with page reset
  const handleSearchChange = (query) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handleStatusChange = (status) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  // Save Task handler
  const handleSaveTask = async (newTaskPayload) => {
    try {
      const created = await createTask({
        ...newTaskPayload,
        projectId: project.id,
      })
      setTasks((prev) => [created, ...prev])
      setCurrentPage(1)
      setIsAddDrawerOpen(false)
      setToastMessage('Task added successfully.')
      setTimeout(() => {
        setToastMessage(null)
      }, 3500)
    } catch (err) {
      console.error('Failed to create task:', err)
      setToastMessage('Failed to create task.')
      setTimeout(() => {
        setToastMessage(null)
      }, 3500)
      throw err
    }
  }

  // Edit Task handlers
  const handleEditTask = (task) => {
    if (!canEditTask(task)) return
    setSelectedTask(null)
    setEditingTask(task)
  }

  const handleCloseEditDrawer = () => {
    setEditingTask(null)
  }

  const handleUpdateTask = async (taskOrId, maybePayload) => {
    try {
      const id = typeof taskOrId === 'string' ? taskOrId : taskOrId.id
      const payload = typeof taskOrId === 'string' ? maybePayload : taskOrId
      const updated = await updateTask(id, payload)
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
      setSelectedTask((prev) => (prev && prev.id === updated.id ? updated : prev))
      setEditingTask(null)
      setToastMessage('Task updated successfully.')
      setTimeout(() => {
        setToastMessage(null)
      }, 3500)
    } catch (err) {
      console.error('Failed to update task:', err)
      setToastMessage('Failed to update task.')
      setTimeout(() => {
        setToastMessage(null)
      }, 3500)
      throw err
    }
  }

  // Delete Task handlers
  const handleDeleteTask = (task) => {
    if (!canDelete) return
    setSelectedTask(null)
    setDeletingTask(task)
  }

  const handleCloseDeleteModal = () => {
    if (!isDeleting) {
      setDeletingTask(null)
    }
  }

  const handleConfirmDeleteTask = async (taskToDelete) => {
    const target = taskToDelete || deletingTask
    if (!target) return

    try {
      setIsDeleting(true)
      await deleteTask(target.id)
      setTasks((prev) => prev.filter((t) => t.id !== target.id))
      if (selectedTask && selectedTask.id === target.id) {
        setSelectedTask(null)
      }
      setDeletingTask(null)
      setToastMessage('Task deleted successfully.')
      setTimeout(() => {
        setToastMessage(null)
      }, 3500)
    } catch (err) {
      console.error('Failed to delete task:', err)
      setToastMessage('Failed to delete task.')
      setTimeout(() => {
        setToastMessage(null)
      }, 3500)
    } finally {
      setIsDeleting(false)
    }
  }

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    if (activePage <= 3) {
      return [1, 2, 3, '...', totalPages]
    }

    if (activePage >= totalPages - 2) {
      return [1, '...', totalPages - 2, totalPages - 1, totalPages]
    }

    return [1, '...', activePage - 1, activePage, activePage + 1, '...', totalPages]
  }

  const pageNumbers = getPageNumbers()

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-odw-primary" />
        <p className="text-xs text-odw-text-muted font-medium">Loading project tasks...</p>
      </div>
    )
  }

  // Fetch error state
  if (fetchError) {
    return (
      <div className="space-y-6">
        <Link
          to="/tasks"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-odw-primary hover:text-odw-primary-hover transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Projects</span>
        </Link>

        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-8 text-center shadow-2xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-600 mb-3">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-sm font-bold text-slate-900">Failed to load project</h2>
          <p className="mt-1 text-xs text-rose-700">{fetchError}</p>
          <button
            type="button"
            onClick={loadProjectAndTasks}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-odw-primary px-3.5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-odw-primary-hover transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-medium text-white shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Top Navigation: Back Link & Breadcrumbs */}
      <div className="space-y-2">
        <Link
          to="/tasks"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-odw-text-muted hover:text-odw-primary transition-colors cursor-pointer group"
        >
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Projects</span>
        </Link>

        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-odw-text-muted">
          <Link
            to="/dashboard"
            className="hover:text-odw-primary transition-colors font-medium"
          >
            Dashboard
          </Link>
          <span className="text-slate-300">/</span>
          <Link
            to="/tasks"
            className="hover:text-odw-primary transition-colors font-medium"
          >
            Tasks
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-odw-text font-semibold truncate max-w-[200px] sm:max-w-none">
            {project.projectName}
          </span>
        </nav>
      </div>

      {/* 2. Simple Project Header */}
      <div className="rounded-xl border border-odw-border bg-white p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-odw-primary font-bold text-sm shrink-0 border border-orange-200/60 mt-0.5">
              <FolderKanban className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-odw-text truncate">
                  {project.projectName}
                </h1>
                <ProjectStatusBadge status={project.projectStatus} />
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-odw-text-muted">
                <span>
                  <strong className="text-slate-700">{project.company}</strong> · {project.clientName}
                </span>
                <span className="hidden sm:inline text-slate-300">•</span>
                <span className="text-slate-500 font-medium">{project.service}</span>
              </div>
            </div>
          </div>

          {/* Add Task Button */}
          {canAdd && (
            <div className="shrink-0">
              <button
                type="button"
                onClick={() => setIsAddDrawerOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-odw-primary px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-2xs hover:bg-odw-primary-hover active:scale-[0.98] transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-odw-primary"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>Add Task</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Compact Project Progress Section */}
      <div className="rounded-xl border border-odw-border bg-white p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div>
            <h2 className="text-xs font-bold text-odw-text uppercase tracking-wider">
              Project Progress
            </h2>
            <p className="text-xs text-odw-text-muted mt-0.5">
              {totalTasks > 0 ? (
                <>
                  <span className="font-semibold text-odw-text">{completedTasks}</span> of{' '}
                  <span className="font-semibold text-odw-text">{totalTasks}</span> tasks completed
                </>
              ) : (
                'No tasks yet'
              )}
            </p>
          </div>

          <div className="text-right">
            <span className="text-lg sm:text-xl font-bold text-odw-text">
              {progress}%
            </span>
            <div className="flex items-center gap-1 text-[11px] text-odw-text-muted mt-0.5 justify-end">
              <Calendar className="h-3 w-3 text-slate-400" />
              <span>Deadline: {project.deadline}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200/60">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              progress === 100
                ? 'bg-emerald-500'
                : progress >= 60
                ? 'bg-odw-primary'
                : progress > 0
                ? 'bg-amber-500'
                : 'bg-slate-300'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 4. Task List: Header + Simple Search & Single Status Filter */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-odw-text">Tasks</h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
              {totalFilteredTasks}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search tasks... */}
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search tasks..."
                className="w-full rounded-lg border border-odw-border bg-white pl-8 pr-3 py-1.5 text-xs text-odw-text placeholder:text-slate-400 focus:border-odw-primary focus:outline-none focus:ring-1 focus:ring-odw-primary transition-colors"
              />
            </div>

            {/* Compact Single Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="rounded-lg border border-odw-border bg-white px-2.5 py-1.5 text-xs text-odw-text focus:border-odw-primary focus:outline-none focus:ring-1 focus:ring-odw-primary transition-colors cursor-pointer"
            >
              {STATUS_FILTER_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status === 'All' ? 'All Status' : status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 5. Stacked Simple Task Cards */}
        {totalTasks === 0 ? (
          <div className="rounded-xl border border-odw-border bg-white p-10 text-center shadow-2xs">
            <h3 className="text-sm font-semibold text-slate-700">No tasks yet.</h3>
            <p className="mt-1 text-xs text-odw-text-muted">
              Add tasks to start tracking this project&apos;s progress.
            </p>
          </div>
        ) : paginatedTasks.length > 0 ? (
          <div className="space-y-2.5">
            {paginatedTasks.map((task) => {
              const isCompleted = task.status === 'Completed'

              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`group rounded-xl border border-odw-border bg-white p-4 shadow-2xs hover:shadow-md hover:border-odw-primary/40 transition-all duration-200 cursor-pointer ${
                    isCompleted ? 'bg-slate-50/40 opacity-90' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Left: Icon + Title + Description */}
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div
                        className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg text-xs shrink-0 border transition-colors ${
                          isCompleted
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200/60'
                            : 'bg-orange-50 text-odw-primary border-orange-200/60 group-hover:bg-odw-primary group-hover:text-white'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <CheckSquare className="h-4 w-4" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3
                          className={`font-semibold text-xs sm:text-sm group-hover:text-odw-primary transition-colors truncate ${
                            isCompleted ? 'text-slate-600' : 'text-odw-text'
                          }`}
                        >
                          {task.taskName}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500 leading-relaxed line-clamp-2">
                          {task.description}
                        </p>
                      </div>
                    </div>

                    {/* Right: Badges */}
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 shrink-0">
                      <TaskStatusBadge status={task.status} />
                      <TaskPriorityBadge priority={task.priority} />
                    </div>
                  </div>

                  {/* Card Bottom Meta */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-odw-text-muted">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        {task.deadline}
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-200 text-slate-700 font-bold text-[9px]">
                          {task.assignedTo ? task.assignedTo.charAt(0).toUpperCase() : 'U'}
                        </div>
                        {task.assignedTo}
                      </span>
                    </div>

                    {/* Actions: Edit | Delete • View details → */}
                    <div className="flex items-center gap-1.5">
                      {canEditTask(task) && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditTask(task)
                          }}
                          className="text-[11px] font-semibold text-slate-600 hover:text-odw-primary transition-colors cursor-pointer px-1.5 py-0.5 rounded hover:bg-slate-100"
                        >
                          Edit
                        </button>
                      )}
                      {canEditTask(task) && canDelete && (
                        <span className="text-slate-300">|</span>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteTask(task)
                          }}
                          className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 transition-colors cursor-pointer px-1.5 py-0.5 rounded hover:bg-rose-50"
                        >
                          Delete
                        </button>
                      )}
                      {(canEditTask(task) || canDelete) && (
                        <span className="text-slate-300">•</span>
                      )}
                      <span className="text-odw-primary font-semibold text-[11px] group-hover:underline">
                        View details →
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-odw-border bg-white p-8 text-center shadow-2xs">
            <h3 className="text-xs font-semibold text-slate-700">No tasks found</h3>
            <p className="mt-0.5 text-xs text-odw-text-muted">
              Try adjusting your search or filters.
            </p>
          </div>
        )}

        {/* 6. Simple Pagination Controls (Rendered ONLY when totalPages > 1) */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 text-xs text-odw-text-muted border-t border-odw-border">
            <span className="text-[11px] font-medium">
              Showing <strong className="text-odw-text font-semibold">{startIndex + 1}–{endIndex}</strong> of{' '}
              <strong className="text-odw-text font-semibold">{totalFilteredTasks}</strong> tasks
            </span>

            {/* Desktop Page Numbers */}
            <div className="hidden sm:flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={activePage <= 1}
                className="px-2.5 py-1 rounded-md border border-odw-border bg-white text-xs hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                ← Previous
              </button>

              {pageNumbers.map((page, index) => {
                if (page === '...') {
                  return (
                    <span key={`ellipsis-${index}`} className="px-1 text-slate-400 select-none">
                      ...
                    </span>
                  )
                }

                const isActive = page === activePage

                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`h-7 w-7 rounded-md font-medium text-xs transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-odw-primary text-white shadow-2xs'
                        : 'border border-odw-border bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                )
              })}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={activePage >= totalPages}
                className="px-2.5 py-1 rounded-md border border-odw-border bg-white text-xs hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Next →
              </button>
            </div>

            {/* Mobile Touch-Friendly Pagination (No overflow) */}
            <div className="sm:hidden flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={activePage <= 1}
                className="px-2.5 py-1 rounded-md border border-odw-border bg-white text-xs hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Previous
              </button>
              <span className="text-[11px] font-medium text-slate-600">
                Page {activePage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={activePage >= totalPages}
                className="px-2.5 py-1 rounded-md border border-odw-border bg-white text-xs hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 7. Simple Task Details Drawer */}
      <TaskDetailsDrawer
        task={selectedTask}
        project={project}
        projectTasks={projectTasks}
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
        canEdit={selectedTask ? canEditTask(selectedTask) : false}
        canDelete={canDelete}
      />

      {/* 8. Slide-over Add Task Drawer */}
      <AddTaskDrawer
        project={project}
        teamMembers={teamMembers}
        isOpen={isAddDrawerOpen && canAdd}
        onClose={() => setIsAddDrawerOpen(false)}
        onSaveTask={handleSaveTask}
      />

      {/* 9. Slide-over Edit Task Drawer */}
      <EditTaskDrawer
        task={editingTask}
        project={project}
        teamMembers={teamMembers}
        isOpen={Boolean(editingTask) && canEditTask(editingTask)}
        onClose={handleCloseEditDrawer}
        onUpdateTask={handleUpdateTask}
      />

      {/* 10. Delete Task Confirmation Modal */}
      <DeleteTaskModal
        task={deletingTask}
        isOpen={Boolean(deletingTask) && canDelete}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDeleteTask}
        isDeleting={isDeleting}
      />
    </div>
  )
}

export default ProjectTasks
