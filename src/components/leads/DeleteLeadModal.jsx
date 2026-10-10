import { useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'

function DeleteLeadModal({ lead, isOpen, onClose, onConfirm }) {
  // Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !lead) return null

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-lead-title"
      aria-describedby="delete-lead-description"
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
            id="delete-lead-title"
            className="text-base font-bold text-odw-text"
          >
            Delete Lead?
          </h2>
          <p
            id="delete-lead-description"
            className="mt-1.5 text-xs text-slate-600 leading-relaxed"
          >
            Are you sure you want to delete <span className="font-semibold text-odw-text">{lead.name}</span>? This action cannot be undone.
          </p>
        </div>

        {/* Lead Context Pill */}
        <div className="mt-3 rounded-lg bg-slate-50 border border-slate-200/60 p-2.5 text-xs text-slate-600 flex items-center justify-between">
          <div className="truncate min-w-0">
            <p className="font-medium text-odw-text truncate">{lead.name}</p>
            <p className="text-[11px] text-odw-text-muted truncate">{lead.company}</p>
          </div>
          <span className="shrink-0 text-[11px] font-mono text-slate-400 pl-2">
            {lead.phone}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-odw-border bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-slate-400"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(lead.id)}
            className="inline-flex items-center justify-center rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-rose-700 active:scale-[0.98] transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-rose-500"
          >
            Delete Lead
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteLeadModal
