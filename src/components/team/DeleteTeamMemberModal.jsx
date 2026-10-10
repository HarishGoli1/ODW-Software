import { useEffect } from 'react'
import { AlertTriangle, X, Loader2 } from 'lucide-react'

function DeleteTeamMemberModal({
  member,
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
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
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-team-title"
      aria-describedby="delete-team-description"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Centered Modal Card */}
      <div
        className="relative w-full max-w-md rounded-xl border border-odw-border bg-white p-5 sm:p-6 shadow-xl transition-all z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Icon & Close */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-600 border border-rose-200/60 shrink-0">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/70 text-slate-400 hover:text-odw-text hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-3.5">
          <h2
            id="delete-team-title"
            className="text-base font-bold text-odw-text"
          >
            Delete Team Member
          </h2>

          <p
            id="delete-team-description"
            className="mt-1.5 text-xs text-odw-text-muted leading-relaxed"
          >
            Are you sure you want to delete this team member? This action cannot be undone.
          </p>

          {/* Member Preview Box */}
          <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs space-y-1">
            <p className="font-bold text-slate-900">
              {member.name}
            </p>
            <p className="text-[11px] text-odw-text-muted">
              Role: <span className="font-medium text-slate-700">{member.role}</span> ({member.department})
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="w-full sm:w-auto rounded-lg border border-odw-border bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(member.id)}
            disabled={isDeleting}
            className="w-full sm:w-auto rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-rose-700 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-rose-600 disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
          >
            {isDeleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>Delete Team Member</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteTeamMemberModal
