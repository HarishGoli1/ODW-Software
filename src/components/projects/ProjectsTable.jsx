import { useState } from 'react'
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Calendar,
  User,
  FolderKanban,
} from 'lucide-react'
import ProjectStatusBadge from './ProjectStatusBadge'
import ProjectPriorityBadge from './ProjectPriorityBadge'

function ProjectsTable({
  projects,
  totalLifetimeCount = 16,
  currentPage = 1,
  totalPages = 1,
  totalFilteredCount = 0,
  itemsPerPage = 8,
  onPageChange = () => {},
  onViewProject,
  onSelectProject,
  onEditProject = () => {},
  onDeleteProject = () => {},
  canEdit = true,
  canDelete = true,
}) {
  const [activeMenuId, setActiveMenuId] = useState(null)

  const handleView = onViewProject || onSelectProject || (() => {})

  const toggleMenu = (id) => {
    setActiveMenuId((prev) => (prev === id ? null : id))
  }

  const isProjectEditable = (proj) =>
    typeof canEdit === 'function' ? canEdit(proj) : Boolean(canEdit)
  const isProjectDeletable = (proj) =>
    typeof canDelete === 'function' ? canDelete(proj) : Boolean(canDelete)

  const handleAction = (action, project) => {
    setActiveMenuId(null)
    if (action === 'view') handleView(project)
    if (action === 'edit' && isProjectEditable(project)) onEditProject(project)
    if (action === 'delete' && isProjectDeletable(project)) onDeleteProject(project)
  }

  // Calculate dynamic start and end display indices
  const startIndex = totalFilteredCount > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0
  const endIndex = Math.min(currentPage * itemsPerPage, totalFilteredCount)

  // Generate dynamic page numbers with ellipsis
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    if (currentPage <= 3) {
      return [1, 2, 3, '...', totalPages]
    }

    if (currentPage >= totalPages - 2) {
      return [1, '...', totalPages - 2, totalPages - 1, totalPages]
    }

    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages]
  }

  const pageNumbers = getPageNumbers()

  return (
    <div>
      {/* =========================================
          1. DESKTOP / TABLET TABLE VIEW
          ========================================= */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-odw-border bg-slate-50/50 text-[11px] font-semibold uppercase tracking-wider text-odw-text-muted">
              <th className="py-3 px-4">Project</th>
              <th className="py-3 px-4">Client</th>
              <th className="py-3 px-4">Service</th>
              <th className="py-3 px-4">Progress</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Deadline</th>
              <th className="py-3 px-4">Assigned To</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-odw-border text-xs">
            {projects.length > 0 ? (
              projects.map((project) => (
                <tr
                  key={project.id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Project Name & Category */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-odw-primary font-bold text-xs shrink-0 border border-orange-200/60">
                        <FolderKanban className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 max-w-[200px]">
                        <p className="font-semibold text-odw-text truncate">
                          {project.projectName}
                        </p>
                        <p className="text-[11px] text-odw-text-muted truncate">
                          {project.company}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Client / Company */}
                  <td className="py-3 px-4">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-700 truncate">
                        {project.company}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {project.clientName}
                      </p>
                    </div>
                  </td>

                  {/* Service */}
                  <td className="py-3 px-4 text-slate-700">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200/60">
                      {project.service}
                    </span>
                  </td>

                  {/* Progress (Percentage + Mini Track Bar) */}
                  <td className="py-3 px-4">
                    <div className="w-28 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-odw-text">
                          {project.progress}%
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {project.completedTasks}/{project.tasksCount} tasks
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            project.progress === 100
                              ? 'bg-emerald-500'
                              : project.progress >= 70
                              ? 'bg-odw-primary'
                              : project.progress >= 30
                              ? 'bg-amber-500'
                              : 'bg-slate-400'
                          }`}
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Priority */}
                  <td className="py-3 px-4">
                    <ProjectPriorityBadge priority={project.priority} />
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    <ProjectStatusBadge status={project.projectStatus} />
                  </td>

                  {/* Deadline */}
                  <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      {project.deadline}
                    </span>
                  </td>

                  {/* Assigned To */}
                  <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium border border-slate-200">
                        {project.assignedTo.charAt(0)}
                      </div>
                      <span className="font-medium text-slate-700 text-xs">
                        {project.assignedTo}
                      </span>
                    </div>
                  </td>

                  {/* Actions Dropdown */}
                  <td className="py-3 px-4 text-right relative">
                    <button
                      type="button"
                      onClick={() => toggleMenu(project.id)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:text-odw-text hover:bg-slate-100 transition-colors cursor-pointer"
                      aria-label={`Actions for ${project.projectName}`}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>

                    {/* Action Dropdown Menu (Placeholders for Step 25 foundation) */}
                    {activeMenuId === project.id && (
                      <div className="absolute right-4 top-10 z-20 w-32 rounded-lg border border-odw-border bg-white py-1 shadow-md text-left">
                        <button
                          type="button"
                          onClick={() => handleAction('view', project)}
                          className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-odw-primary transition-colors cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5 text-slate-400" />
                          <span>View</span>
                        </button>
                        {isProjectEditable(project) && (
                          <button
                            type="button"
                            onClick={() => handleAction('edit', project)}
                            className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-odw-primary transition-colors cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5 text-slate-400" />
                            <span>Edit</span>
                          </button>
                        )}
                        {isProjectDeletable(project) && (
                          <>
                            <div className="my-1 border-t border-slate-100" />
                            <button
                              type="button"
                              onClick={() => handleAction('delete', project)}
                              className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                              <span>Delete</span>
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="py-12 text-center text-odw-text-muted text-xs">
                  <p className="font-semibold text-slate-700">No projects found</p>
                  <p className="mt-0.5 text-slate-400">Try adjusting your search or filters.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* =========================================
          2. MOBILE CARD VIEW (No horizontal overflow)
          ========================================= */}
      <div className="md:hidden divide-y divide-odw-border">
        {projects.length > 0 ? (
          projects.map((project) => (
            <div key={project.id} className="p-4 space-y-3">
              {/* Header: Project + Badges */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-odw-primary font-bold text-xs shrink-0 border border-orange-200/60">
                    <FolderKanban className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-xs text-odw-text truncate">
                      {project.projectName}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {project.company}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <ProjectStatusBadge status={project.projectStatus} />
                </div>
              </div>

              {/* Service & Priority */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50/70 rounded-lg p-2.5 border border-slate-100">
                <div>
                  <span className="text-odw-text-muted block text-[10px] uppercase">Service</span>
                  <span className="font-medium text-odw-text">{project.service}</span>
                </div>
                <div>
                  <span className="text-odw-text-muted block text-[10px] uppercase">Priority</span>
                  <div className="mt-0.5">
                    <ProjectPriorityBadge priority={project.priority} />
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1 bg-slate-50/40 rounded-lg p-2.5 border border-slate-100">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-odw-text-muted text-[10px] uppercase">Progress</span>
                  <span className="font-semibold text-odw-text">{project.progress}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      project.progress === 100
                        ? 'bg-emerald-500'
                        : project.progress >= 70
                        ? 'bg-odw-primary'
                        : project.progress >= 30
                        ? 'bg-amber-500'
                        : 'bg-slate-400'
                    }`}
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {/* Deadline, Assignee & Actions */}
              <div className="flex items-center justify-between text-[11px] text-odw-text-muted pt-0.5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-slate-400" />
                    {project.deadline}
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <User className="h-3 w-3 text-slate-400" />
                    {project.assignedTo}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleView(project)}
                    className="inline-flex items-center gap-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    <Eye className="h-3 w-3 text-slate-500" />
                    <span>View</span>
                  </button>
                  {isProjectEditable(project) && (
                    <button
                      type="button"
                      onClick={() => onEditProject(project)}
                      className="inline-flex items-center gap-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      <Pencil className="h-3 w-3 text-slate-500" />
                      <span>Edit</span>
                    </button>
                  )}
                  {isProjectDeletable(project) && (
                    <button
                      type="button"
                      onClick={() => onDeleteProject(project)}
                      className="inline-flex items-center gap-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 px-2 py-0.5 text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3 text-rose-500" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-odw-text-muted text-xs">
            <p className="font-semibold text-slate-700">No projects found</p>
            <p className="mt-0.5 text-slate-400">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      {/* =========================================
          3. TABLE FOOTER / DYNAMIC PAGINATION
          ========================================= */}
      {totalFilteredCount > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-odw-border p-3.5 sm:p-4 text-xs text-odw-text-muted">
          <div>
            Showing <span className="font-semibold text-odw-text">{startIndex}–{endIndex}</span> of{' '}
            <span className="font-semibold text-odw-text">{totalFilteredCount}</span> projects
          </div>

          {/* Pagination UI */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-2.5 py-1 rounded-md border border-odw-border bg-white text-xs hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Previous
              </button>

              {pageNumbers.map((page, index) => {
                if (page === '...') {
                  return (
                    <span key={`ellipsis-${index}`} className="px-1 text-slate-400 select-none">
                      ...
                    </span>
                  )
                }

                const isActive = page === currentPage

                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() => onPageChange(page)}
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
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="px-2.5 py-1 rounded-md border border-odw-border bg-white text-xs hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ProjectsTable
