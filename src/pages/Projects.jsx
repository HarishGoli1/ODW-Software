import { useState, useMemo, useEffect, useCallback } from 'react'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import ProjectsHeader from '../components/projects/ProjectsHeader'
import ProjectSummary from '../components/projects/ProjectSummary'
import ProjectsToolbar from '../components/projects/ProjectsToolbar'
import ProjectsTable from '../components/projects/ProjectsTable'
import AddProjectDrawer from '../components/projects/AddProjectDrawer'
import ProjectDetailsDrawer from '../components/projects/ProjectDetailsDrawer'
import EditProjectDrawer from '../components/projects/EditProjectDrawer'
import DeleteProjectModal from '../components/projects/DeleteProjectModal'
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from '../services/projectsService'
import { useAuth } from '../context/AuthContext'

const ITEMS_PER_PAGE = 8

function Projects() {
  const { employee } = useAuth()
  const role = employee?.system_role?.toLowerCase() || 'member'
  const isMember = role === 'member'
  const canAdd = !isMember
  const canDelete = !isMember
  const canEditProject = useCallback(
    (proj) => !isMember || Boolean(employee?.id && proj?.assignedToId === employee.id),
    [isMember, employee]
  )

  const [projects, setProjects] = useState([])
  const [clients, setClients] = useState([])
  const [teamMembers, setTeamMembers] = useState([])
  const [summary, setSummary] = useState({
    total: 0,
    inProgress: 0,
    inReview: 0,
    completed: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [priorityFilter, setPriorityFilter] = useState('All Priorities')
  const [clientFilter, setClientFilter] = useState('All Clients')
  const [currentPage, setCurrentPage] = useState(1)
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [editingProject, setEditingProject] = useState(null)
  const [deletingProject, setDeletingProject] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)

  // Show auto-dismissing toast notifications
  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type })
    setTimeout(() => {
      setToastMessage(null)
    }, 3500)
  }

  // 1. Fetch live projects, clients, team members, and summary from Supabase
  const loadProjects = useCallback(async () => {
    setIsLoading(true)
    setFetchError(null)
    try {
      const {
        projects: data,
        summary: liveSummary,
        clients: liveClients,
        teamMembers: liveTeam,
      } = await getProjects()
      setProjects(data)
      setSummary(liveSummary)
      setClients(liveClients)
      setTeamMembers(liveTeam)
    } catch (err) {
      console.error('Failed to load projects from Supabase:', err)
      setFetchError('Failed to load projects from database. Please try again.')
      showToast('Failed to load projects from Supabase.', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  // Derive dynamic client options for toolbar filter
  const clientOptions = useMemo(() => {
    const names = []
    clients.forEach((c) => {
      if (c.company) names.push(c.company)
      else if (c.name) names.push(c.name)
    })
    projects.forEach((p) => {
      if (p.company) names.push(p.company)
    })
    const unique = Array.from(new Set(names.filter(Boolean))).sort()
    return ['All Clients', ...unique]
  }, [clients, projects])

  // Real-time multi-criteria filtering
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // 1. Search Query: projectName, clientName, company, service, assignedTo
      const matchesSearch =
        searchQuery.trim() === '' ||
        project.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.assignedTo.toLowerCase().includes(searchQuery.toLowerCase())

      // 2. Status Match
      const matchesStatus =
        statusFilter === 'All Status' || project.projectStatus === statusFilter

      // 3. Priority Match
      const matchesPriority =
        priorityFilter === 'All Priorities' || project.priority === priorityFilter

      // 4. Client Match
      const matchesClient =
        clientFilter === 'All Clients' ||
        project.company === clientFilter ||
        project.clientName === clientFilter

      return matchesSearch && matchesStatus && matchesPriority && matchesClient
    })
  }, [projects, searchQuery, statusFilter, priorityFilter, clientFilter])

  // Pagination calculation
  const totalFilteredCount = filteredProjects.length
  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / ITEMS_PER_PAGE))
  const activePage = Math.min(currentPage, totalPages)

  // Page clamping: prevent invalid pages if items shrink
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  // Paginated slice for current page
  const paginatedProjects = useMemo(() => {
    const startIndex = (activePage - 1) * ITEMS_PER_PAGE
    return filteredProjects.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredProjects, activePage])

  // Filter change handlers with automatic page reset to 1
  const handleSearchChange = (query) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handleStatusChange = (status) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  const handlePriorityChange = (priority) => {
    setPriorityFilter(priority)
    setCurrentPage(1)
  }

  const handleClientChange = (client) => {
    setClientFilter(client)
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleOpenAddDrawer = () => {
    if (!canAdd) return
    setIsAddDrawerOpen(true)
  }

  const handleCloseAddDrawer = () => {
    setIsAddDrawerOpen(false)
  }

  // 2. Real CREATE handler
  const handleSaveProject = async (formData) => {
    try {
      const created = await createProject(formData)

      // Prepend newly created project to state and update summary
      const updatedList = [created, ...projects]
      setProjects(updatedList)
      setSummary({
        total: updatedList.length,
        inProgress: updatedList.filter((p) => p.projectStatus === 'In Progress').length,
        inReview: updatedList.filter((p) => p.projectStatus === 'Review').length,
        completed: updatedList.filter((p) => p.projectStatus === 'Completed').length,
      })
      setCurrentPage(1)
      setIsAddDrawerOpen(false)

      showToast('Project added successfully.', 'success')
    } catch (err) {
      console.error('Create project error:', err)
      showToast(err.message || 'Failed to add project. Please check your connection.', 'error')
      throw err
    }
  }

  const handleViewProject = (project) => {
    setSelectedProject(project)
  }

  const handleCloseProjectDetails = () => {
    setSelectedProject(null)
  }

  const handleEditProject = (project) => {
    if (!canEditProject(project)) return
    setSelectedProject(null) // Seamless transition: close details drawer if open
    setEditingProject(project)
  }

  const handleCloseEditDrawer = () => {
    setEditingProject(null)
  }

  // 3. Real UPDATE handler
  const handleUpdateProject = async (formData) => {
    try {
      const updated = await updateProject(formData.id, formData)

      // Replace updated project in state and update summary
      const updatedList = projects.map((p) => (p.id === updated.id ? updated : p))
      setProjects(updatedList)
      setSummary({
        total: updatedList.length,
        inProgress: updatedList.filter((p) => p.projectStatus === 'In Progress').length,
        inReview: updatedList.filter((p) => p.projectStatus === 'Review').length,
        completed: updatedList.filter((p) => p.projectStatus === 'Completed').length,
      })

      if (selectedProject?.id === updated.id) {
        setSelectedProject(updated)
      }
      setEditingProject(null)

      showToast('Project updated successfully.', 'success')
    } catch (err) {
      console.error('Update project error:', err)
      showToast(err.message || 'Failed to update project.', 'error')
      throw err
    }
  }

  const handlePromptDelete = (project) => {
    if (!canDelete) return
    setDeletingProject(project)
  }

  const handleCloseDeleteModal = () => {
    setDeletingProject(null)
  }

  // 4. Real DELETE handler
  const handleConfirmDelete = async (projectId) => {
    try {
      await deleteProject(projectId)

      const updatedList = projects.filter((project) => project.id !== projectId)
      setProjects(updatedList)
      setSummary({
        total: updatedList.length,
        inProgress: updatedList.filter((p) => p.projectStatus === 'In Progress').length,
        inReview: updatedList.filter((p) => p.projectStatus === 'Review').length,
        completed: updatedList.filter((p) => p.projectStatus === 'Completed').length,
      })

      // Drawer safety: close if currently open in View or Edit drawer
      if (selectedProject?.id === projectId) setSelectedProject(null)
      if (editingProject?.id === projectId) setEditingProject(null)

      setDeletingProject(null)
      showToast('Project deleted successfully.', 'success')
    } catch (err) {
      console.error('Delete project error:', err)
      showToast(err.message || 'Failed to delete project from database.', 'error')
    }
  }

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-medium text-white shadow-lg animate-in fade-in slide-in-from-top-2 duration-200 ${
            toastMessage.type === 'error'
              ? 'bg-rose-900 border border-rose-700'
              : 'bg-slate-900'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* 1. Header with Breadcrumbs, Title & Add Project Action */}
      <ProjectsHeader onAddProject={handleOpenAddDrawer} canAdd={canAdd} />

      {/* 2. Compact Dynamic Metric Summary Row (Total, In Progress, In Review, Completed) */}
      <ProjectSummary summary={summary} />

      {/* 3. Main Workspace Card (Toolbar + Table / Loading / Error) */}
      <div className="rounded-xl border border-odw-border bg-white shadow-2xs overflow-hidden">
        <ProjectsToolbar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          statusFilter={statusFilter}
          onStatusChange={handleStatusChange}
          priorityFilter={priorityFilter}
          onPriorityChange={handlePriorityChange}
          clientFilter={clientFilter}
          onClientChange={handleClientChange}
          clientOptions={clientOptions}
          totalCount={totalFilteredCount}
        />

        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-odw-primary" />
            <p className="text-xs font-medium text-odw-text-muted">
              Loading projects from Supabase...
            </p>
          </div>
        ) : fetchError ? (
          <div className="p-10 flex flex-col items-center justify-center gap-2 text-center bg-rose-50/50">
            <AlertCircle className="h-6 w-6 text-rose-500" />
            <p className="text-xs font-semibold text-rose-800">{fetchError}</p>
            <button
              onClick={loadProjects}
              className="mt-2 text-xs font-medium text-odw-primary hover:underline cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : (
          <ProjectsTable
            projects={paginatedProjects}
            totalLifetimeCount={summary.total}
            currentPage={activePage}
            totalPages={totalPages}
            totalFilteredCount={totalFilteredCount}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={handlePageChange}
            onViewProject={handleViewProject}
            onSelectProject={handleViewProject}
            onEditProject={handleEditProject}
            onDeleteProject={handlePromptDelete}
            canEdit={canEditProject}
            canDelete={canDelete}
          />
        )}
      </div>

      {/* 4. Slide-over Add Project Drawer */}
      <AddProjectDrawer
        isOpen={isAddDrawerOpen && canAdd}
        onClose={handleCloseAddDrawer}
        onSaveProject={handleSaveProject}
        clients={clients}
        teamMembers={teamMembers}
      />

      {/* 5. Slide-over Project Details Drawer */}
      <ProjectDetailsDrawer
        project={selectedProject}
        open={Boolean(selectedProject)}
        onClose={handleCloseProjectDetails}
        onEdit={handleEditProject}
        canEdit={selectedProject ? canEditProject(selectedProject) : false}
      />

      {/* 6. Slide-over Edit Project Drawer */}
      <EditProjectDrawer
        project={editingProject}
        isOpen={Boolean(editingProject) && canEditProject(editingProject)}
        onClose={handleCloseEditDrawer}
        onSave={handleUpdateProject}
        clients={clients}
        teamMembers={teamMembers}
      />

      {/* 7. Delete Project Confirmation Modal */}
      <DeleteProjectModal
        project={deletingProject}
        isOpen={Boolean(deletingProject) && canDelete}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}

export default Projects
