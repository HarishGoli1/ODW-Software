import { useEffect } from 'react'
import {
  X,
  FileText,
  Calendar,
  Building2,
  User,
  Clock,
  Pencil,
  Tag,
  CheckCircle2,
} from 'lucide-react'
import ProposalStatusBadge from './ProposalStatusBadge'

const formatINR = (val) => {
  if (typeof val !== 'number') return val
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val)
}

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

function ProposalDetailsDrawer({
  proposal,
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

  if (!isOpen || !proposal) return null

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="proposal-details-title"
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
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-odw-primary border border-orange-200/60 shrink-0 mt-0.5">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <span className="font-mono text-[11px] font-bold text-slate-500 block">
                    {proposal.proposalNumber}
                  </span>
                  <h2
                    id="proposal-details-title"
                    className="text-base sm:text-lg font-bold text-odw-text truncate"
                  >
                    {proposal.title}
                  </h2>
                  <p className="text-xs text-odw-text-muted mt-0.5 truncate">
                    {proposal.company} · {proposal.clientName}
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
            {/* Quick Proposal Summary Card */}
            <div className="rounded-xl border border-odw-border bg-slate-50/70 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-odw-text-muted">
                  Proposal Amount
                </span>
                <span className="text-lg font-bold text-slate-900">
                  {formatINR(proposal.amount)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-odw-text-muted block">
                    Current Status
                  </span>
                  <div className="mt-1">
                    <ProposalStatusBadge status={proposal.status} />
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-odw-text-muted block">
                    Validity
                  </span>
                  <span className="font-semibold text-slate-800 mt-1 block">
                    {formatDate(proposal.validUntil)}
                  </span>
                </div>
              </div>
            </div>

            {/* Client Record Details */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-odw-text-muted block">
                Client Information
              </span>
              <div className="rounded-lg border border-odw-border bg-white p-3 space-y-2">
                <div className="flex items-center gap-2 text-slate-800">
                  <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="font-bold">{proposal.company}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <User className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>{proposal.clientName}</span>
                </div>
              </div>
            </div>

            {/* Service & Commercial Terms */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-odw-border bg-white p-3 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-odw-text-muted block">
                  Service Scope
                </span>
                <p className="font-semibold text-slate-800 truncate">
                  {proposal.service}
                </p>
              </div>

              <div className="rounded-lg border border-odw-border bg-white p-3 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-odw-text-muted block">
                  Created Date
                </span>
                <p className="font-semibold text-slate-800 truncate">
                  {formatDate(proposal.createdAt)}
                </p>
              </div>
            </div>

            {/* Scope / Description */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-odw-text-muted block">
                Scope Description
              </span>
              <p className="rounded-lg border border-odw-border bg-white p-3.5 text-slate-700 leading-relaxed">
                {proposal.description || 'No detailed scope description provided.'}
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
                onClick={() => onEdit(proposal)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-odw-primary px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-odw-primary-hover transition-colors cursor-pointer"
              >
                <Pencil className="h-3.5 w-3.5" />
                <span>Edit Proposal</span>
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

export default ProposalDetailsDrawer
