import { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import {
  PROJECT_SERVICE_OPTIONS,
  FORM_PROJECT_STATUSES,
  FORM_PROJECT_PRIORITIES,
} from '../../data/projects'

function AddProjectDrawer({
  isOpen,
  onClose,
  onSaveProject,
  clients = [],
  teamMembers = [],
}) {
  const [formData, setFormData] = useState({
    projectName: '',
    clientId: '',
    service: 'Business Website',
    projectStatus: 'Planning',
    priority: 'Medium',
    startDate: new Date().toISOString().split('T')[0],
    deadline: '',
    budget: '',
    assignedToId: '',
    description: '',
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when drawer opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        projectName: '',
        clientId: '',
        service: 'Business Website',
        projectStatus: 'Planning',
        priority: 'Medium',
        startDate: new Date().toISOString().split('T')[0],
        deadline: '',
        budget: '',
        assignedToId: '',
        description: '',
      })
      setErrors({})
      setIsSubmitting(false)
    }
  }, [isOpen])

  // Escape key closes drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  const validate = () => {
    const newErrors = {}

    // 1. Project Name
    if (!formData.projectName.trim()) {
      newErrors.projectName = 'Project name is required.'
    }

    // 2. Client
    if (!formData.clientId) {
      newErrors.clientId = 'Client is required.'
    }

    // 3. Service
    if (!formData.service) {
      newErrors.service = 'Service is required.'
    }

    // 4. Project Status
    if (!formData.projectStatus) {
      newErrors.projectStatus = 'Project status is required.'
    }

    // 5. Priority
    if (!formData.priority) {
      newErrors.priority = 'Priority is required.'
    }

    // 6. Start Date
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required.'
    }

    // 7. Deadline
    if (!formData.deadline) {
      newErrors.deadline = 'Deadline is required.'
    } else if (formData.startDate && formData.deadline < formData.startDate) {
      newErrors.deadline = 'Deadline cannot be earlier than start date.'
    }

    setErrors(newErrors)

    // Focus first invalid field
    if (Object.keys(newErrors).length > 0) {
      const firstFieldKey = Object.keys(newErrors)[0]
      const element = document.getElementById(`proj-${firstFieldKey}`)
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
      const projectPayload = {
        projectName: formData.projectName.trim(),
        clientId: formData.clientId,
        service: formData.service,
        projectStatus: formData.projectStatus,
        priority: formData.priority,
        startDate: formData.startDate,
        deadline: formData.deadline,
        budget: formData.budget.trim(),
        assignedToId: formData.assignedToId || null,
        description: formData.description.trim(),
      }

      await onSaveProject(projectPayload)
      onClose()
    } catch (err) {
      console.error('Failed to create project:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-project-drawer-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <aside
          className="w-screen max-w-[440px] sm:max-w-[480px] bg-white shadow-2xl border-l border-odw-border flex flex-col justify-between"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 1. Drawer Header */}
          <div className="flex items-start justify-between border-b border-odw-border p-5 shrink-0 bg-white">
            <div>
              <h2
                id="add-project-drawer-title"
                className="text-base font-bold text-odw-text"
              >
                Add New Project
              </h2>
              <p className="mt-0.5 text-xs text-odw-text-muted">
                Create a new client project.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/70 text-slate-400 hover:text-odw-text hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close drawer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* 2. Scrollable Form Body */}
          <form
            id="add-project-form"
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto p-5 space-y-4 text-xs custom-scrollbar"
          >
            {/* Project Name * */}
            <div>
              <label
                htmlFor="proj-projectName"
                className="block font-medium text-slate-700 mb-1"
              >
                Project Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="proj-projectName"
                type="text"
                value={formData.projectName}
                onChange={(e) => handleChange('projectName', e.target.value)}
                placeholder="Enter project name"
                className={`w-full rounded-lg border px-3 py-2 text-xs text-odw-text placeholder:text-slate-400 focus:outline-none focus:ring-1 transition-colors ${
                  errors.projectName
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-odw-border focus:border-odw-primary focus:ring-odw-primary'
                }`}
              />
              {errors.projectName && (
                <p className="mt-1 text-[11px] text-rose-600 font-medium">
                  {errors.projectName}
                </p>
              )}
            </div>

            {/* Client * */}
            <div>
              <label
                htmlFor="proj-clientId"
                className="block font-medium text-slate-700 mb-1"
              >
                Client <span className="text-rose-500">*</span>
              </label>
              <select
                id="proj-clientId"
                value={formData.clientId}
                onChange={(e) => handleChange('clientId', e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-xs text-odw-text focus:outline-none focus:ring-1 transition-colors cursor-pointer ${
                  errors.clientId
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-odw-border focus:border-odw-primary focus:ring-odw-primary'
                }`}
              >
                <option value="">
                  {clients.length > 0 ? 'Select a client...' : 'No clients found — add a client first'}
                </option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.company ? `${client.company} (${client.name})` : client.name}
                  </option>
                ))}
              </select>
              {errors.clientId && (
                <p className="mt-1 text-[11px] text-rose-600 font-medium">
                  {errors.clientId}
                </p>
              )}
            </div>

            {/* Service * */}
            <div>
              <label
                htmlFor="proj-service"
                className="block font-medium text-slate-700 mb-1"
              >
                Service <span className="text-rose-500">*</span>
              </label>
              <select
                id="proj-service"
                value={formData.service}
                onChange={(e) => handleChange('service', e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-xs text-odw-text focus:outline-none focus:ring-1 transition-colors cursor-pointer ${
                  errors.service
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-odw-border focus:border-odw-primary focus:ring-odw-primary'
                }`}
              >
                {PROJECT_SERVICE_OPTIONS.map((srv) => (
                  <option key={srv} value={srv}>
                    {srv}
                  </option>
                ))}
              </select>
              {errors.service && (
                <p className="mt-1 text-[11px] text-rose-600 font-medium">
                  {errors.service}
                </p>
              )}
            </div>

            {/* Status & Priority Row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Project Status * */}
              <div>
                <label
                  htmlFor="proj-projectStatus"
                  className="block font-medium text-slate-700 mb-1"
                >
                  Project Status <span className="text-rose-500">*</span>
                </label>
                <select
                  id="proj-projectStatus"
                  value={formData.projectStatus}
                  onChange={(e) => handleChange('projectStatus', e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 text-xs text-odw-text focus:outline-none focus:ring-1 transition-colors cursor-pointer ${
                    errors.projectStatus
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
                      : 'border-odw-border focus:border-odw-primary focus:ring-odw-primary'
                  }`}
                >
                  {FORM_PROJECT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                {errors.projectStatus && (
                  <p className="mt-1 text-[11px] text-rose-600 font-medium">
                    {errors.projectStatus}
                  </p>
                )}
              </div>

              {/* Priority * */}
              <div>
                <label
                  htmlFor="proj-priority"
                  className="block font-medium text-slate-700 mb-1"
                >
                  Priority <span className="text-rose-500">*</span>
                </label>
                <select
                  id="proj-priority"
                  value={formData.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 text-xs text-odw-text focus:outline-none focus:ring-1 transition-colors cursor-pointer ${
                    errors.priority
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
                      : 'border-odw-border focus:border-odw-primary focus:ring-odw-primary'
                  }`}
                >
                  {FORM_PROJECT_PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
                {errors.priority && (
                  <p className="mt-1 text-[11px] text-rose-600 font-medium">
                    {errors.priority}
                  </p>
                )}
              </div>
            </div>

            {/* Start Date & Deadline Row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Start Date * */}
              <div>
                <label
                  htmlFor="proj-startDate"
                  className="block font-medium text-slate-700 mb-1"
                >
                  Start Date <span className="text-rose-500">*</span>
                </label>
                <input
                  id="proj-startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 text-xs text-odw-text focus:outline-none focus:ring-1 transition-colors ${
                    errors.startDate
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
                      : 'border-odw-border focus:border-odw-primary focus:ring-odw-primary'
                  }`}
                />
                {errors.startDate && (
                  <p className="mt-1 text-[11px] text-rose-600 font-medium">
                    {errors.startDate}
                  </p>
                )}
              </div>

              {/* Deadline * */}
              <div>
                <label
                  htmlFor="proj-deadline"
                  className="block font-medium text-slate-700 mb-1"
                >
                  Deadline <span className="text-rose-500">*</span>
                </label>
                <input
                  id="proj-deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => handleChange('deadline', e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 text-xs text-odw-text focus:outline-none focus:ring-1 transition-colors ${
                    errors.deadline
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
                      : 'border-odw-border focus:border-odw-primary focus:ring-odw-primary'
                  }`}
                />
                {errors.deadline && (
                  <p className="mt-1 text-[11px] text-rose-600 font-medium">
                    {errors.deadline}
                  </p>
                )}
              </div>
            </div>

            {/* Budget & Assigned To Row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Budget */}
              <div>
                <label
                  htmlFor="proj-budget"
                  className="block font-medium text-slate-700 mb-1"
                >
                  Budget (Optional)
                </label>
                <input
                  id="proj-budget"
                  type="text"
                  value={formData.budget}
                  onChange={(e) => handleChange('budget', e.target.value)}
                  placeholder="₹0"
                  className="w-full rounded-lg border border-odw-border px-3 py-2 text-xs text-odw-text placeholder:text-slate-400 focus:border-odw-primary focus:outline-none focus:ring-1 focus:ring-odw-primary transition-colors"
                />
              </div>

              {/* Assigned To */}
              <div>
                <label
                  htmlFor="proj-assignedTo"
                  className="block font-medium text-slate-700 mb-1"
                >
                  Assigned To
                </label>
                <select
                  id="proj-assignedTo"
                  value={formData.assignedToId}
                  onChange={(e) => handleChange('assignedToId', e.target.value)}
                  className="w-full rounded-lg border border-odw-border px-3 py-2 text-xs text-odw-text focus:outline-none focus:ring-1 focus:border-odw-primary focus:ring-odw-primary transition-colors cursor-pointer"
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

            {/* Description */}
            <div>
              <label
                htmlFor="proj-description"
                className="block font-medium text-slate-700 mb-1"
              >
                Description (Optional)
              </label>
              <textarea
                id="proj-description"
                rows={3}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe the project requirements..."
                className="w-full rounded-lg border border-odw-border px-3 py-2 text-xs text-odw-text placeholder:text-slate-400 focus:border-odw-primary focus:outline-none focus:ring-1 focus:ring-odw-primary transition-colors resize-none"
              />
            </div>
          </form>

          {/* 3. Sticky Drawer Footer */}
          <div className="flex items-center justify-end gap-2.5 border-t border-odw-border p-4 bg-slate-50/70 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-odw-border bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="add-project-form"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-odw-primary px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-odw-primary-hover active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Project</span>
              )}
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default AddProjectDrawer
