import { useNavigate } from 'react-router-dom'
import { FolderKanban, Calendar, ArrowRight } from 'lucide-react'
import ProjectStatusBadge from '../projects/ProjectStatusBadge'

function ProjectTaskCard({ project, tasks = [] }) {
  const navigate = useNavigate()

  // Calculate project task progress directly from its tasks
  const projectTasks = tasks.filter((t) => t.projectId === project.id)
  const totalTasks = projectTasks.length
  const completedTasks = projectTasks.filter((t) => t.status === 'Completed').length
  const progress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const handleCardClick = () => {
    navigate(`/tasks/project/${project.id}`)
  }

  return (
    <div
      onClick={handleCardClick}
      className="group flex flex-col justify-between rounded-xl border border-odw-border bg-white p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-odw-primary/40 transition-all duration-200 cursor-pointer"
    >
      <div>
        {/* Top: Project Icon + Title + Client */}
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-odw-primary font-bold text-sm shrink-0 border border-orange-200/60 group-hover:bg-odw-primary group-hover:text-white transition-colors duration-200">
            <FolderKanban className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm text-odw-text group-hover:text-odw-primary transition-colors truncate">
              {project.projectName}
            </h3>
            <p className="text-xs text-odw-text-muted truncate">
              {project.company} · {project.clientName}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5 truncate">
              {project.service}
            </p>
          </div>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="h-2 flex-1 mr-3 rounded-full bg-slate-100 overflow-hidden border border-slate-200/60">
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
            <span className="font-bold text-odw-text text-xs shrink-0">
              {progress}%
            </span>
          </div>

          <p className="text-[11px] text-odw-text-muted font-medium">
            {totalTasks > 0 ? (
              `${completedTasks} / ${totalTasks} tasks completed`
            ) : (
              'No tasks yet'
            )}
          </p>
        </div>
      </div>

      {/* Card Footer: Status, Deadline, View Tasks CTA */}
      <div className="mt-4 pt-3.5 border-t border-odw-border flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <ProjectStatusBadge status={project.projectStatus} />
          <span className="inline-flex items-center gap-1 text-[11px] text-odw-text-muted">
            <Calendar className="h-3 w-3 text-slate-400" />
            {project.deadline}
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleCardClick()
          }}
          className="inline-flex items-center gap-1 text-xs font-semibold text-odw-primary group-hover:translate-x-0.5 transition-transform cursor-pointer"
        >
          <span>View Tasks</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

export default ProjectTaskCard
