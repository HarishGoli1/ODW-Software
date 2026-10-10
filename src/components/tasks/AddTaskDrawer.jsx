import { useState, useEffect } from 'react'
import { X, FolderKanban, Loader2 } from 'lucide-react'

const STATUS_OPTIONS = ['To Do', 'In Progress', 'Review', 'Completed', 'Blocked']
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Urgent']

function AddTaskDrawer({ project, teamMembers = [], isOpen, onClose, onSaveTask }) {
  const [formData, setFormData] = useState({
    taskName: '',
    description: '',
    status: 'To Do',
    priority: 'Medium',
    deadline: '',
    assignedToId: '',
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize or reset form when drawer opens or project changes
  useEffect(() => {
    if (isOpen && project) {
      setFormData({
        taskName: '',
        description: '',
        status: 'To Do',
        priority: 'Medium',
        deadline: '',
        assignedToId: project.assignedToId || '',
      })
      setErrors({})
      setIsSubmitting(false)
    }
  }, [isOpen, project])

  // ESC key closes drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, isSubmitting])

  if (!isOpen || !project) return null

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  const validate = () => {
    const newErrors = {}

    // 1. Task Name
    if (!formData.taskName.trim()) {
      newErrors.taskName = 'Task name is required.'
    }

    // 2. Status
    if (!formData.status) {
      newErrors.status = 'Status is required.'
    }

    // 3. Priority
    if (!formData.priority) {
      newErrors.priority = 'Priority is required.'
    }

    // 4. Deadline
    if (!formData.deadline) {
      newErrors.deadline = 'Deadline is required.'
    }

    setErrors(newErrors)

    // Focus first invalid field
    if (Object.keys(newErrors).length > 0) {
      const firstFieldKey = Object.keys(newErrors)[0]
      const element = document.getElementById(`task-${firstFieldKey}`)
      if (element) {
        element.focus()
      }
    }

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const taskPayload = {
        projectId: project.id,
        taskName: formData.taskName.trim(),
        description: formData.description.trim(),
        status: formData.status,
        priority: formData.priority,
        deadline: formData.deadline || null,
        assignedToId: formData.assignedToId || null,
      }

      await onSaveTask(taskPayload)
    } catch (err) {
      console.error('Failed to create task:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-task-drawer-title"
    >
      {/* Dimmed & Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <aside
          className="w-screen max-w-[480px] bg-white shadow-2xl border-l border-odw-border flex flex-col justify-between"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 1. Drawer Header */}
          <div className="border-b border-odw-border p-5 shrink-0 bg-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2
                  id="add-task-drawer-title"
                  className="text-lg font-bold text-odw-text"
                >
                  Add New Task
                </h2>
                <p className="mt-0.5 text-xs text-odw-text-muted">
                  Create a task for this project.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close drawer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Current Project Context Card */}
            <div className="mt-3.5 flex items-center gap-2.5 rounded-lg bg-slate-50 p-2.5 border border-slate-200/70">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-odw-primary shrink-0 border border-orange-200/60">
                <FolderKanban className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-odw-text truncate">
                  {project.projectName}
                </p>
                <p className="text-[11px] text-odw-text-muted truncate">
                  {project.company} · {project.clientName}
                </p>
              </div>
            </div>
          </div>

          {/* 2. Scrollable Form Body */}
          <form
            id="add-task-form"
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto p-5 space-y-4"
          >
            {/* Task Name * */}
            <div>
              <label
                htmlFor="task-taskName"
                className="block text-xs font-semibold text-odw-text mb-1"
              >
                Task Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="task-taskName"
                type="text"
                value={formData.taskName}
                onChange={(e) => handleChange('taskName', e.target.value)}
                placeholder="Enter task name"
                className={`w-full rounded-lg border bg-white px-3 py-2 text-xs text-odw-text placeholder:text-slate-400 focus:outline-none focus:ring-1 transition-colors ${
                  errors.taskName
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-odw-border focus:border-odw-primary focus:ring-odw-primary'
                }`}
              />
              {errors.taskName && (
                <p className="mt-1 text-[11px] text-rose-500 font-medium">
                  {errors.taskName}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="task-description"
                className="block text-xs font-semibold text-odw-text mb-1"
              >
                Description
              </label>
              <textarea
                id="task-description"
                rows={3}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe what needs to be done..."
                className="w-full rounded-lg border border-odw-border bg-white px-3 py-2 text-xs text-odw-text placeholder:text-slate-400 focus:border-odw-primary focus:outline-none focus:ring-1 focus:ring-odw-primary transition-colors resize-none"
              />
            </div>

            {/* Status & Priority Row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Status * */}
              <div>
                <label
                  htmlFor="task-status"
                  className="block text-xs font-semibold text-odw-text mb-1"
                >
                  Status <span className="text-rose-500">*</span>
                </label>
                <select
                  id="task-status"
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className={`w-full rounded-lg border bg-white px-2.5 py-2 text-xs text-odw-text focus:outline-none focus:ring-1 transition-colors cursor-pointer ${
                    errors.status
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                      : 'border-odw-border focus:border-odw-primary focus:ring-odw-primary'
                  }`}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                {errors.status && (
                  <p className="mt-1 text-[11px] text-rose-500 font-medium">
                    {errors.status}
                  </p>
                )}
              </div>

              {/* Priority * */}
              <div>
                <label
                  htmlFor="task-priority"
                  className="block text-xs font-semibold text-odw-text mb-1"
                >
                  Priority <span className="text-rose-500">*</span>
                </label>
                <select
                  id="task-priority"
                  value={formData.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                  className={`w-full rounded-lg border bg-white px-2.5 py-2 text-xs text-odw-text focus:outline-none focus:ring-1 transition-colors cursor-pointer ${
                    errors.priority
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                      : 'border-odw-border focus:border-odw-primary focus:ring-odw-primary'
                  }`}
                >
                  {PRIORITY_OPTIONS.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
                {errors.priority && (
                  <p className="mt-1 text-[11px] text-rose-500 font-medium">
                    {errors.priority}
                  </p>
                )}
              </div>
            </div>

            {/* Deadline & Assigned To Row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Deadline * */}
              <div>
                <label
                  htmlFor="task-deadline"
                  className="block text-xs font-semibold text-odw-text mb-1"
                >
                  Deadline <span className="text-rose-500">*</span>
                </label>
                <input
                  id="task-deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => handleChange('deadline', e.target.value)}
                  className={`w-full rounded-lg border bg-white px-2.5 py-2 text-xs text-odw-text focus:outline-none focus:ring-1 transition-colors ${
                    errors.deadline
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                      : 'border-odw-border focus:border-odw-primary focus:ring-odw-primary'
                  }`}
                />
                {errors.deadline && (
                  <p className="mt-1 text-[11px] text-rose-500 font-medium">
                    {errors.deadline}
                  </p>
                )}
              </div>

              {/* Assigned To */}
              <div>
                <label
                  htmlFor="task-assignedTo"
                  className="block text-xs font-semibold text-odw-text mb-1"
                >
                  Assigned To
                </label>
                <select
                  id="task-assignedTo"
                  value={formData.assignedToId}
                  onChange={(e) => handleChange('assignedToId', e.target.value)}
                  className="w-full rounded-lg border border-odw-border bg-white px-2.5 py-2 text-xs text-odw-text focus:border-odw-primary focus:outline-none focus:ring-1 focus:ring-odw-primary transition-colors cursor-pointer"
                >
                  <option value="">Unassigned</option>
                  {teamMembers.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </form>

          {/* 3. Sticky Drawer Footer */}
          <div className="border-t border-odw-border p-4 bg-slate-50/70 shrink-0 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-odw-border bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="add-task-form"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-odw-primary px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-odw-primary-hover active:scale-[0.98] transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Task</span>
              )}
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default AddTaskDrawer
