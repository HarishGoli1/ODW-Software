import { useState } from 'react'
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Calendar,
  CheckSquare,
  Briefcase,
  User,
} from 'lucide-react'
import TaskStatusBadge from './TaskStatusBadge'
import TaskPriorityBadge from './TaskPriorityBadge'

function TasksTable({
  tasks,
  currentPage = 1,
  totalPages = 1,
  totalFilteredCount = 0,
  itemsPerPage = 8,
  onPageChange = () => {},
  onViewTask = () => {},
  onEditTask = () => {},
  onDeleteTask = () => {},
}) {
  const [activeMenuId, setActiveMenuId] = useState(null)

  const toggleMenu = (id) => {
    setActiveMenuId((prev) => (prev === id ? null : id))
  }

  const handleAction = (action, task) => {
    setActiveMenuId(null)
    if (action === 'view') onViewTask(task)
    if (action === 'edit') onEditTask(task)
    if (action === 'delete') onDeleteTask(task)
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
              <th className="py-3 px-4">Task</th>
              <th className="py-3 px-4">Project</th>
              <th className="py-3 px-4">Client</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Assigned To</th>
              <th className="py-3 px-4">Deadline</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-odw-border text-xs">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <tr
                  key={task.id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Task Name & Description */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-odw-primary font-bold text-xs shrink-0 border border-orange-200/60">
                        <CheckSquare className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 max-w-[220px]">
                        <p className="font-semibold text-odw-text truncate">
                          {task.taskName}
                        </p>
                        <p className="text-[11px] text-odw-text-muted truncate">
                          {task.description}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Project */}
                  <td className="py-3 px-4">
                    <div className="min-w-0 max-w-[180px]">
                      <p className="font-medium text-odw-text truncate">
                        {task.projectName}
                      </p>
                      <p className="text-[11px] text-odw-text-muted truncate">
                        {task.service}
                      </p>
                    </div>
                  </td>

                  {/* Client */}
                  <td className="py-3 px-4">
                    <div className="min-w-0 max-w-[160px]">
                      <p className="font-medium text-slate-700 truncate">
                        {task.company}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {task.clientName}
                      </p>
                    </div>
                  </td>

                  {/* Priority */}
                  <td className="py-3 px-4">
                    <TaskPriorityBadge priority={task.priority} />
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    <TaskStatusBadge status={task.status} />
                  </td>

                  {/* Assigned To */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-[11px] shrink-0">
                        {task.assignedTo ? task.assignedTo.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <span className="font-medium text-slate-700 truncate">
                        {task.assignedTo}
                      </span>
                    </div>
                  </td>

                  {/* Deadline */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{task.deadline}</span>
                    </div>
                  </td>

                  {/* Actions Dropdown */}
                  <td className="py-3 px-4 text-right relative">
                    <button
                      type="button"
                      onClick={() => toggleMenu(task.id)}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                      aria-label="Actions"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>

                    {activeMenuId === task.id && (
                      <div
                        className="absolute right-4 mt-1 w-32 rounded-lg bg-white shadow-lg border border-odw-border py-1 z-20"
                        onMouseLeave={() => setActiveMenuId(null)}
                      >
                        <button
                          type="button"
                          onClick={() => handleAction('view', task)}
                          className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-odw-primary transition-colors cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5 text-slate-400" />
                          <span>View</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAction('edit', task)}
                          className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-odw-primary transition-colors cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5 text-slate-400" />
                          <span>Edit</span>
                        </button>
                        <div className="my-1 border-t border-slate-100" />
                        <button
                          type="button"
                          onClick={() => handleAction('delete', task)}
                          className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-12 text-center text-odw-text-muted text-xs">
                  <p className="font-semibold text-slate-700">No tasks found</p>
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
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <div key={task.id} className="p-4 space-y-3">
              {/* Header: Task + Status */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-odw-primary font-bold text-xs shrink-0 border border-orange-200/60">
                    <CheckSquare className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-xs text-odw-text truncate">
                      {task.taskName}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {task.projectName}
                    </p>
                  </div>
                </div>
                <div className="shrink-0">
                  <TaskStatusBadge status={task.status} />
                </div>
              </div>

              {/* Description */}
              {task.description && (
                <p className="text-xs text-slate-600 bg-slate-50/50 rounded-md p-2 border border-slate-100">
                  {task.description}
                </p>
              )}

              {/* Client & Priority */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50/70 rounded-lg p-2.5 border border-slate-100">
                <div>
                  <span className="text-odw-text-muted block text-[10px] uppercase">Client</span>
                  <span className="font-medium text-odw-text truncate block">{task.company}</span>
                  <span className="text-slate-500 text-[10px] truncate block">{task.clientName}</span>
                </div>
                <div>
                  <span className="text-odw-text-muted block text-[10px] uppercase">Priority</span>
                  <div className="mt-0.5">
                    <TaskPriorityBadge priority={task.priority} />
                  </div>
                </div>
              </div>

              {/* Deadline, Assignee & Actions */}
              <div className="flex items-center justify-between text-[11px] text-odw-text-muted pt-0.5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-slate-400" />
                    {task.deadline}
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-200 text-slate-700 text-[9px] font-bold">
                      {task.assignedTo ? task.assignedTo.charAt(0).toUpperCase() : 'U'}
                    </span>
                    {task.assignedTo}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAction('view', task)}
                    className="inline-flex items-center gap-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    <Eye className="h-3 w-3 text-slate-500" />
                    <span>View</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAction('edit', task)}
                    className="inline-flex items-center gap-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    <Pencil className="h-3 w-3 text-slate-500" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAction('delete', task)}
                    className="inline-flex items-center gap-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 px-2 py-0.5 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3 text-rose-500" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-odw-text-muted text-xs">
            <p className="font-semibold text-slate-700">No tasks found</p>
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
            <span className="font-semibold text-odw-text">{totalFilteredCount}</span> tasks
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

export default TasksTable
