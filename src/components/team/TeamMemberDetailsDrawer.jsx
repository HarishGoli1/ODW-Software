import { useEffect } from 'react'
import {
  X,
  Mail,
  Phone,
  Briefcase,
  Building2,
  Calendar,
  FolderKanban,
  CheckSquare,
  Pencil,
  Tag,
} from 'lucide-react'
import TeamStatusBadge from './TeamStatusBadge'
import { getInitials } from './TeamTable'

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  try {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [y, m, d] = dateStr.split('-').map(Number)
      const date = new Date(y, m - 1, d)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      })
    }
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function TeamMemberDetailsDrawer({
  member,
  isOpen,
  onClose,
  onEdit = () => {},
  canEdit = true,
}) {
  // ESC key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !member) return null

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="team-details-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <aside
          className="w-screen max-w-full sm:max-w-[480px] bg-white shadow-2xl border-l border-odw-border flex flex-col justify-between"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-odw-border p-5 shrink-0 bg-white">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold text-sm shrink-0 border border-slate-200 mt-0.5">
                  {getInitials(member.name)}
                </div>
                <div className="min-w-0">
                  <h2
                    id="team-details-title"
                    className="text-base sm:text-lg font-bold text-odw-text truncate"
                  >
                    {member.name}
                  </h2>
                  <p className="text-xs text-odw-text-muted mt-0.5 truncate">
                    {member.role} · {member.department}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                aria-label="Close drawer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
            {/* Quick Assignment Summary Box */}
            <div className="rounded-xl border border-odw-border bg-slate-50/70 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-odw-text-muted">
                  Membership Status
                </span>
                <TeamStatusBadge status={member.status} />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60">
                <div className="flex items-center gap-2">
                  <FolderKanban className="h-4 w-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-odw-text-muted block">
                      Active Projects
                    </span>
                    <span className="font-bold text-slate-800 text-sm">
                      {member.activeProjects}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-odw-text-muted block">
                      Assigned Tasks
                    </span>
                    <span className="font-bold text-slate-800 text-sm">
                      {member.assignedTasks}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-odw-text-muted block">
                Contact Details
              </span>
              <div className="rounded-lg border border-odw-border bg-white p-3 space-y-2">
                <div className="flex items-center gap-2.5 text-slate-700">
                  <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="font-medium truncate">{member.email}</span>
                </div>
                {member.phone && (
                  <div className="flex items-center gap-2.5 text-slate-700">
                    <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="font-medium">{member.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Role & Department Details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-odw-border bg-white p-3 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-odw-text-muted block">
                  Department
                </span>
                <p className="font-semibold text-slate-800 truncate">
                  {member.department}
                </p>
              </div>

              <div className="rounded-lg border border-odw-border bg-white p-3 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-odw-text-muted block">
                  Joined Date
                </span>
                <p className="font-semibold text-slate-800 truncate">
                  {formatDate(member.joinedDate)}
                </p>
              </div>
            </div>

            {/* Skills Tags */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-odw-text-muted block">
                Skills & Specializations
              </span>
              <div className="rounded-lg border border-odw-border bg-white p-3">
                {Array.isArray(member.skills) && member.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {member.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200/60"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic">No skills specified.</p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-odw-text-muted block">
                Bio / Notes
              </span>
              <p className="rounded-lg border border-odw-border bg-white p-3.5 text-slate-700 leading-relaxed">
                {member.notes || 'No notes recorded for this team member.'}
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-odw-border p-4 bg-slate-50/70 shrink-0 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-odw-border bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Close
            </button>
            {canEdit && (
              <button
                type="button"
                onClick={() => onEdit(member)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-odw-primary px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-odw-primary-hover transition-colors cursor-pointer"
              >
                <Pencil className="h-3.5 w-3.5" />
                <span>Edit Member</span>
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

export default TeamMemberDetailsDrawer
