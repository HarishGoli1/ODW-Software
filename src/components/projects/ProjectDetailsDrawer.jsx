import { useEffect } from 'react'
import {
  X,
  Calendar,
  FolderKanban,
  IndianRupee,
  Sparkles,
  Building2,
  User,
  Briefcase,
} from 'lucide-react'
import ProjectStatusBadge from './ProjectStatusBadge'
import ProjectPriorityBadge from './ProjectPriorityBadge'

function ProjectDetailsDrawer({
  project,
  open,
  isOpen,
  onClose,
  onEdit,
  canEdit = true,
}) {
  const isDrawerOpen = open !== undefined ? open : isOpen

  // Escape key closes drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isDrawerOpen, onClose])

  if (!isDrawerOpen || !project) return null

  const handleEditClick = () => {
    if (onEdit) {
      onEdit(project)
    }
  }

  const hasTasks = project.tasksCount > 0
  const hasBudget = Boolean(project.budget && project.budget !== '₹0')

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-details-title"
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
          <div className="border-b border-odw-border p-5 shrink-0 bg-white">
            <div className="flex items-start justify-between gap-3">
              {/* Project Icon + Title + Company */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-orange-50 text-odw-primary font-bold text-sm shrink-0 border border-orange-200/60">
                  <FolderKanban className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2
                    id="project-details-title"
                    className="text-base font-bold text-odw-text truncate"
                  >
                    {project.projectName}
                  </h2>
                  <p className="text-xs text-odw-text-muted truncate">
                    {project.company}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/70 text-slate-400 hover:text-odw-text hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                aria-label="Close drawer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Sub-header meta bar */}
            <div className="mt-3.5 flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-odw-text-muted">
                Project Details
              </span>
              <ProjectStatusBadge status={project.projectStatus} />
            </div>
          </div>

          {/* 2. Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar text-xs">
            {/* Project Overview */}
            <div className="space-y-2.5">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-odw-text-muted">
                Project Overview
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="col-span-2 rounded-xl border border-odw-border bg-slate-50/50 p-3">
                  <span className="text-slate-500 text-[10px] uppercase font-semibold block">
                    Project Name
                  </span>
                  <p className="mt-1 font-semibold text-odw-text leading-snug">
                    {project.projectName}
                  </p>
                </div>

                <div className="rounded-xl border border-odw-border bg-slate-50/50 p-3">
                  <span className="text-slate-500 text-[10px] uppercase font-semibold block">
                    Client Contact
                  </span>
                  <p className="mt-1 font-semibold text-odw-text leading-snug flex items-center gap-1 truncate">
                    <User className="h-3 w-3 text-slate-400 shrink-0" />
                    {project.clientName}
                  </p>
                </div>

                <div className="rounded-xl border border-odw-border bg-slate-50/50 p-3">
                  <span className="text-slate-500 text-[10px] uppercase font-semibold block">
                    Company
                  </span>
                  <p className="mt-1 font-semibold text-odw-text leading-snug flex items-center gap-1 truncate">
                    <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
                    {project.company}
                  </p>
                </div>

                <div className="col-span-2 rounded-xl border border-odw-border bg-slate-50/50 p-3">
                  <span className="text-slate-500 text-[10px] uppercase font-semibold block">
                    Service Required
                  </span>
                  <p className="mt-1 font-semibold text-odw-text leading-snug flex items-center gap-1">
                    <Briefcase className="h-3 w-3 text-slate-400 shrink-0" />
                    {project.service}
                  </p>
                </div>

                <div className="rounded-xl border border-odw-border bg-slate-50/50 p-3">
                  <span className="text-slate-500 text-[10px] uppercase font-semibold block">
                    Status
                  </span>
                  <div className="mt-1">
                    <ProjectStatusBadge status={project.projectStatus} />
                  </div>
                </div>

                <div className="rounded-xl border border-odw-border bg-slate-50/50 p-3">
                  <span className="text-slate-500 text-[10px] uppercase font-semibold block">
                    Priority
                  </span>
                  <div className="mt-1">
                    <ProjectPriorityBadge priority={project.priority} />
                  </div>
                </div>

                <div className="col-span-2 rounded-xl border border-odw-border bg-slate-50/50 p-3">
                  <span className="text-slate-500 text-[10px] uppercase font-semibold block">
                    Assigned To
                  </span>
                  <div className="mt-1 flex items-center gap-1.5">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                      {project.assignedTo?.charAt(0) || 'P'}
                    </div>
                    <span className="font-semibold text-odw-text">
                      {project.assignedTo}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Progress */}
            <div className="space-y-2.5">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-odw-text-muted">
                Project Progress
              </h3>
              <div className="rounded-xl border border-odw-border bg-slate-50/50 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-odw-text text-sm">
                    {project.progress}%
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    {hasTasks
                      ? `${project.completedTasks} / ${project.tasksCount} tasks completed`
                      : 'No tasks added yet.'}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200/80 overflow-hidden">
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
            </div>

            {/* Project Timeline */}
            <div className="space-y-2.5">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-odw-text-muted">
                Project Timeline
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-xl border border-odw-border bg-slate-50/50 p-3">
                  <span className="text-slate-500 text-[10px] uppercase font-semibold block">
                    Start Date
                  </span>
                  <p className="mt-1 font-semibold text-odw-text leading-snug flex items-center gap-1 font-mono text-[11px]">
                    <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    {project.startDate}
                  </p>
                </div>

                <div className="rounded-xl border border-odw-border bg-slate-50/50 p-3">
                  <span className="text-slate-500 text-[10px] uppercase font-semibold block">
                    Deadline
                  </span>
                  <p className="mt-1 font-semibold text-odw-text leading-snug flex items-center gap-1 font-mono text-[11px]">
                    <Calendar className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                    {project.deadline}
                  </p>
                </div>

                <div className="col-span-2 rounded-xl border border-odw-border bg-slate-50/50 p-3">
                  <span className="text-slate-500 text-[10px] uppercase font-semibold block">
                    Created Date
                  </span>
                  <p className="mt-1 font-semibold text-odw-text leading-snug flex items-center gap-1 font-mono text-[11px]">
                    <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    {project.createdAt}
                  </p>
                </div>
              </div>
            </div>

            {/* Project Budget */}
            <div className="space-y-2.5">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-odw-text-muted">
                Project Budget
              </h3>
              <div className="rounded-xl border border-odw-border bg-slate-50/50 p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/70">
                    <IndianRupee className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 font-semibold block">
                      Allocated Budget
                    </span>
                    <p className="font-bold text-sm text-odw-text">
                      {hasBudget ? project.budget : 'No budget specified.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Description */}
            <div className="space-y-2">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-odw-text-muted">
                Project Description
              </h3>
              <div className="rounded-xl border border-odw-border bg-white p-3.5 text-xs text-slate-700 leading-relaxed shadow-2xs">
                {project.description ? (
                  <p className="whitespace-pre-wrap">{project.description}</p>
                ) : (
                  <p className="text-slate-400 italic">No project description added.</p>
                )}
              </div>
            </div>

            {/* Activity */}
            <div className="space-y-2.5">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-odw-text-muted">
                Activity
              </h3>
              <div className="rounded-xl border border-odw-border bg-slate-50/50 p-3.5 space-y-3">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 text-odw-primary shrink-0 border border-orange-200/70">
                    <Sparkles className="h-2.5 w-2.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-odw-text">Project created</p>
                      <span className="text-[10px] text-slate-400">· {project.createdAt}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Status: {project.projectStatus} · Initial project created in CRM.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Sticky Footer */}
          <div className="flex items-center justify-end gap-2.5 border-t border-odw-border p-4 bg-slate-50/70 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-odw-border bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer"
            >
              Close
            </button>
            {canEdit && (
              <button
                type="button"
                onClick={handleEditClick}
                disabled={!onEdit}
                className="inline-flex items-center gap-1.5 rounded-lg bg-odw-primary px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-odw-primary-hover active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Edit Project
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

export default ProjectDetailsDrawer
