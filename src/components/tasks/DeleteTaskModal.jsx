import { useEffect } from 'react'
import { AlertTriangle, X, Loader2 } from 'lucide-react'

function DeleteTaskModal({ task, isOpen, onClose, onConfirm, isDeleting = false }) {
  // ESC key closes modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isDeleting) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, isDeleting])

  if (!isOpen || !task) return null

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-task-title"
      aria-describedby="delete-task-description"
    >
      {/* Dark Translucent Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={() => {
          if (!isDeleting) onClose()
        }}
        aria-hidden="true"
      />

      {/* Centered Modal Card */}
      <div
        className="relative w-full max-w-md rounded-xl border border-odw-border bg-white p-5 sm:p-6 shadow-xl transition-all z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Icon & Close Button */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-600 border border-rose-200/60 shrink-0">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/70 text-slate-400 hover:text-odw-text hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-3.5">
          <h2
            id="delete-task-title"
            className="text-base font-bold text-odw-text"
          >
            Delete Task
          </h2>
          <p
            id="delete-task-description"
            className="mt-1.5 text-xs text-slate-600 leading-relaxed"
          >
            Are you sure you want to delete this task?
          </p>
        </div>

        {/* Task Preview */}
        <div className="mt-3 rounded-lg bg-slate-50 border border-slate-200/60 p-3 text-xs text-slate-700">
          <p className="font-semibold text-odw-text truncate">
            &ldquo;{task.taskName}&rdquo;
          </p>
          <p className="mt-1 text-[11px] text-rose-500 font-medium">
            This action cannot be undone.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-lg border border-odw-border bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(task)}
            disabled={isDeleting}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-rose-700 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete Task</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteTaskModal
