import { useState, useMemo, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Search, FolderKanban, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import ProjectTaskCard from '../components/tasks/ProjectTaskCard'
import { getProjects } from '../services/projectsService'
import { getTasks } from '../services/tasksService'

function Tasks() {
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Load live projects and tasks
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      setFetchError(null)
      const [projectsResult, tasksResult] = await Promise.all([
        getProjects(),
        getTasks(),
      ])
      setProjects(projectsResult.projects || [])
      setTasks(tasksResult.tasks || [])
    } catch (err) {
      console.error('Failed to load projects and tasks:', err)
      setFetchError(err.message || 'Failed to load projects. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Filter projects by simple search query
  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return projects

    return projects.filter((project) => {
      return (
        (project.projectName && project.projectName.toLowerCase().includes(q)) ||
        (project.company && project.company.toLowerCase().includes(q)) ||
        (project.clientName && project.clientName.toLowerCase().includes(q)) ||
        (project.service && project.service.toLowerCase().includes(q)) ||
        (project.assignedTo && project.assignedTo.toLowerCase().includes(q))
      )
    })
  }, [projects, searchQuery])

  return (
    <div className="space-y-6">
      {/* 1. Header: Breadcrumbs & Title */}
      <div>
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-odw-text-muted">
          <Link
            to="/dashboard"
            className="hover:text-odw-primary transition-colors font-medium"
          >
            Dashboard
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-odw-text font-semibold">Tasks</span>
        </nav>
        <h1 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-odw-text">
          Tasks Management
        </h1>
        <p className="mt-0.5 text-xs sm:text-sm text-odw-text-muted">
          Manage tasks across your client projects.
        </p>
      </div>

      {/* 2. Simple Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-sm font-bold text-odw-text">Projects</h2>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full rounded-lg border border-odw-border bg-white pl-9 pr-3 py-2 text-xs text-odw-text placeholder:text-slate-400 focus:border-odw-primary focus:outline-none focus:ring-1 focus:ring-odw-primary transition-colors shadow-2xs"
          />
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-odw-primary" />
          <p className="text-xs text-odw-text-muted font-medium">Loading projects...</p>
        </div>
      ) : fetchError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-8 text-center shadow-2xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-600 mb-3">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-sm font-bold text-slate-900">Failed to load projects</h2>
          <p className="mt-1 text-xs text-rose-700">{fetchError}</p>
          <button
            type="button"
            onClick={loadData}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-odw-primary px-3.5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-odw-primary-hover transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Retry</span>
          </button>
        </div>
      ) : filteredProjects.length > 0 ? (
        /* 3. Responsive Project Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredProjects.map((project) => (
            <ProjectTaskCard
              key={project.id}
              project={project}
              tasks={tasks}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-odw-border bg-white p-12 text-center shadow-2xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500 mb-3">
            <FolderKanban className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-700">No projects found.</h3>
          <p className="mt-0.5 text-xs text-odw-text-muted">
            Try adjusting your search query.
          </p>
        </div>
      )}
    </div>
  )
}

export default Tasks
