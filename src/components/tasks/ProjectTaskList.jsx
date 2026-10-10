import { useState, useMemo } from 'react'
import {
  Search,
  CheckSquare,
  CheckCircle2,
  Calendar,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  ListTodo,
} from 'lucide-react'
import TaskStatusBadge from './TaskStatusBadge'
import TaskPriorityBadge from './TaskPriorityBadge'
import { TASK_STATUS_OPTIONS, TASK_PRIORITY_OPTIONS } from '../../data/tasks'

function ProjectTaskList({ tasks = [] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [priorityFilter, setPriorityFilter] = useState('All Priorities')
  const [assigneeFilter, setAssigneeFilter] = useState('All Assignees')
  const [activeMenuId, setActiveMenuId] = useState(null)

  // Dynamically derive assignee options for this project's tasks
  const assigneeOptions = useMemo(() => {
    const assignees = Array.from(new Set(tasks.map((t) => t.assignedTo).filter(Boolean)))
    return ['All Assignees', ...assignees]
  }, [tasks])

  // Filter project-specific tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const q = searchQuery.trim().toLowerCase()
      const matchesSearch =
        q === '' ||
        (task.taskName && task.taskName.toLowerCase().includes(q)) ||
        (task.description && task.description.toLowerCase().includes(q)) ||
        (task.assignedTo && task.assignedTo.toLowerCase().includes(q))

      const matchesStatus =
        statusFilter === 'All Status' || task.status === statusFilter

      const matchesPriority =
        priorityFilter === 'All Priorities' || task.priority === priorityFilter

      const matchesAssignee =
        assigneeFilter === 'All Assignees' || task.assignedTo === assigneeFilter

      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee
    })
  }, [tasks, searchQuery, statusFilter, priorityFilter, assigneeFilter])

  // Group tasks by status order
  const STATUS_GROUPS = ['To Do', 'In Progress', 'Review', 'Completed', 'Blocked']

  const groupedTasks = useMemo(() => {
    const groups = {}
    STATUS_GROUPS.forEach((status) => {
      groups[status] = []
    })

    filteredTasks.forEach((task) => {
      if (groups[task.status]) {
        groups[task.status].push(task)
      } else {
        if (!groups['Other']) groups['Other'] = []
        groups['Other'].push(task)
      }
    })

    return groups
  }, [filteredTasks])

  const toggleMenu = (id) => {
    setActiveMenuId((prev) => (prev === id ? null : id))
  }

  const handleAction = (_action, _task) => {
    setActiveMenuId(null)
  }

  // If no tasks exist in the project at all
  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-odw-border bg-white p-12 text-center shadow-2xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-odw-primary border border-orange-200/60 mb-3">
          <ListTodo className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-bold text-odw-text">No tasks added yet.</h3>
        <p className="mt-1 text-xs text-odw-text-muted">
          Add tasks to start tracking this project&apos;s progress.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-odw-border bg-white shadow-2xs overflow-hidden">
      {/* Toolbar: Search & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 p-4 border-b border-odw-border">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-odw-text">Project Tasks</h3>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
            {filteredTasks.length}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5">
          {/* Search Input */}
          <div className="relative min-w-[200px] sm:min-w-[220px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full rounded-lg border border-odw-border bg-white pl-8 pr-3 py-1.5 text-xs text-odw-text placeholder:text-slate-400 focus:border-odw-primary focus:outline-none focus:ring-1 focus:ring-odw-primary transition-colors"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-odw-border bg-white px-2.5 py-1.5 text-xs text-odw-text focus:border-odw-primary focus:outline-none focus:ring-1 focus:ring-odw-primary transition-colors cursor-pointer"
          >
            {TASK_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-lg border border-odw-border bg-white px-2.5 py-1.5 text-xs text-odw-text focus:border-odw-primary focus:outline-none focus:ring-1 focus:ring-odw-primary transition-colors cursor-pointer"
          >
            {TASK_PRIORITY_OPTIONS.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>

          {/* Assignee Filter */}
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="rounded-lg border border-odw-border bg-white px-2.5 py-1.5 text-xs text-odw-text focus:border-odw-primary focus:outline-none focus:ring-1 focus:ring-odw-primary transition-colors cursor-pointer"
          >
            {assigneeOptions.map((assignee) => (
              <option key={assignee} value={assignee}>
                {assignee}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Empty State for Filter/Search Mismatch */}
      {filteredTasks.length === 0 ? (
        <div className="py-12 text-center text-odw-text-muted text-xs">
          <p className="font-semibold text-slate-700">No tasks found</p>
          <p className="mt-0.5 text-slate-400">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          {/* =========================================
              1. DESKTOP / TABLET GROUPED TABLE
              ========================================= */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-odw-border bg-slate-50/50 text-[11px] font-semibold uppercase tracking-wider text-odw-text-muted">
                  <th className="py-3 px-4">Task</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4">Assigned To</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-odw-border text-xs">
                {STATUS_GROUPS.map((statusGroup) => {
                  const tasksInGroup = groupedTasks[statusGroup] || []
                  if (tasksInGroup.length === 0) return null

                  return (
                    <tbody key={statusGroup} className="divide-y divide-odw-border">
                      {/* Status Group Header Row */}
                      <tr className="bg-slate-50/80 border-y border-slate-200/80">
                        <td colSpan={7} className="py-2 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                              {statusGroup}
                            </span>
                            <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-white border border-slate-200 text-slate-600">
                              {tasksInGroup.length}
                            </span>
                          </div>
                        </td>
                      </tr>

                      {/* Group Tasks */}
                      {tasksInGroup.map((task) => {
                        const isCompleted = task.status === 'Completed'

                        return (
                          <tr
                            key={task.id}
                            className={`hover:bg-slate-50/70 transition-colors ${
                              isCompleted ? 'bg-slate-50/30 text-slate-500' : ''
                            }`}
                          >
                            {/* Task Name */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs shrink-0 border ${
                                    isCompleted
                                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200/60'
                                      : 'bg-orange-50 text-odw-primary border-orange-200/60'
                                  }`}
                                >
                                  {isCompleted ? (
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                  ) : (
                                    <CheckSquare className="h-3.5 w-3.5" />
                                  )}
                                </div>
                                <span
                                  className={`font-semibold truncate max-w-[200px] ${
                                    isCompleted ? 'text-slate-600' : 'text-odw-text'
                                  }`}
                                >
                                  {task.taskName}
                                </span>
                              </div>
                            </td>

                            {/* Description */}
                            <td className="py-3 px-4 max-w-[240px]">
                              <p className="text-[11px] text-odw-text-muted truncate">
                                {task.description}
                              </p>
                            </td>

                            {/* Priority */}
                            <td className="py-3 px-4">
                              <TaskPriorityBadge priority={task.priority} />
                            </td>

                            {/* Status */}
                            <td className="py-3 px-4">
                              <TaskStatusBadge status={task.status} />
                            </td>

                            {/* Deadline */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5 text-slate-600">
                                <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                <span className="truncate">{task.deadline}</span>
                              </div>
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

                            {/* Actions Dropdown Placeholder */}
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
                                  className="absolute right-4 mt-1 w-32 rounded-lg bg-white shadow-lg border border-odw-border py-1 z-20 text-left"
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
                        )
                      })}
                    </tbody>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* =========================================
              2. MOBILE STACKED CARDS
              ========================================= */}
          <div className="md:hidden divide-y divide-odw-border">
            {STATUS_GROUPS.map((statusGroup) => {
              const tasksInGroup = groupedTasks[statusGroup] || []
              if (tasksInGroup.length === 0) return null

              return (
                <div key={statusGroup} className="p-3 bg-slate-50/40">
                  <div className="flex items-center gap-2 px-1 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                      {statusGroup}
                    </span>
                    <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-white border border-slate-200 text-slate-600">
                      {tasksInGroup.length}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {tasksInGroup.map((task) => {
                      const isCompleted = task.status === 'Completed'

                      return (
                        <div
                          key={task.id}
                          className={`rounded-lg border border-odw-border bg-white p-3.5 shadow-2xs space-y-2.5 ${
                            isCompleted ? 'opacity-90' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className={`flex h-6 w-6 items-center justify-center rounded-md text-xs shrink-0 border ${
                                  isCompleted
                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200/60'
                                    : 'bg-orange-50 text-odw-primary border-orange-200/60'
                                }`}
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                ) : (
                                  <CheckSquare className="h-3.5 w-3.5" />
                                )}
                              </div>
                              <span className="font-semibold text-xs text-odw-text truncate">
                                {task.taskName}
                              </span>
                            </div>
                            <div className="shrink-0">
                              <TaskStatusBadge status={task.status} />
                            </div>
                          </div>

                          {task.description && (
                            <p className="text-[11px] text-slate-600 bg-slate-50/70 rounded-md p-2 border border-slate-100">
                              {task.description}
                            </p>
                          )}

                          <div className="flex items-center justify-between text-[11px] pt-1">
                            <TaskPriorityBadge priority={task.priority} />
                            <div className="flex items-center gap-2 text-odw-text-muted">
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-slate-400" />
                                {task.deadline}
                              </span>
                              <span>•</span>
                              <span>{task.assignedTo}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => handleAction('view', task)}
                              className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                            >
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAction('edit', task)}
                              className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAction('delete', task)}
                              className="px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default ProjectTaskList
