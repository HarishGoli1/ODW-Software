import { useEffect } from 'react'
import { X, Mail, Phone, Building2, Calendar, Sparkles, FolderKanban } from 'lucide-react'
import ClientStatusBadge from './ClientStatusBadge'
import ClientPaymentBadge from './ClientPaymentBadge'

function ClientDetailsDrawer({ client, isOpen, onClose, onEdit, canEdit = true }) {
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

  if (!isOpen || !client) return null

  const handleEditClick = () => {
    if (onEdit) {
      onEdit(client)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="client-details-title"
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
              {/* Avatar + Name + Company */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold text-sm shrink-0 border border-slate-200">
                  {client.initials || 'CL'}
                </div>
                <div className="min-w-0">
                  <h2
                    id="client-details-title"
                    className="text-base font-bold text-odw-text truncate"
                  >
                    {client.name}
                  </h2>
                  <p className="text-xs text-odw-text-muted truncate">
                    {client.company}
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
                Client Details
              </span>
              <ClientStatusBadge status={client.status} />
            </div>
          </div>

          {/* 2. Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar text-xs">
            {/* Contact Information */}
            <div className="space-y-2.5">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-odw-text-muted">
                Contact Information
              </h3>
              <div className="rounded-xl border border-odw-border bg-slate-50/50 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500 text-[11px]">Email</span>
                  <a
                    href={`mailto:${client.email}`}
                    className="font-medium text-odw-text hover:text-odw-primary transition-colors truncate max-w-[240px] inline-flex items-center gap-1"
                  >
                    <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                    {client.email}
                  </a>
                </div>
                <div className="border-t border-slate-200/50" />
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500 text-[11px]">Phone</span>
                  <a
                    href={`tel:${client.phone}`}
                    className="font-medium font-mono text-odw-text hover:text-odw-primary transition-colors inline-flex items-center gap-1"
                  >
                    <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                    {client.phone}
                  </a>
                </div>
                <div className="border-t border-slate-200/50" />
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500 text-[11px]">Company</span>
                  <span className="font-medium text-odw-text inline-flex items-center gap-1">
                    <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
                    {client.company}
                  </span>
                </div>
              </div>
            </div>

            {/* Client Information (2-column layout) */}
            <div className="space-y-2.5">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-odw-text-muted">
                Client Information
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-xl border border-odw-border bg-slate-50/50 p-3">
                  <span className="text-slate-500 text-[10px] uppercase font-semibold block">
                    Service Required
                  </span>
                  <p className="mt-1 font-semibold text-odw-text leading-snug">
                    {client.service}
                  </p>
                </div>

                <div className="rounded-xl border border-odw-border bg-slate-50/50 p-3">
                  <span className="text-slate-500 text-[10px] uppercase font-semibold block">
                    Projects
                  </span>
                  <p className="mt-1 font-semibold text-odw-text leading-snug inline-flex items-center gap-1">
                    <FolderKanban className="h-3.5 w-3.5 text-slate-400" />
                    {client.projects ?? 0}
                  </p>
                </div>

                <div className="rounded-xl border border-odw-border bg-slate-50/50 p-3">
                  <span className="text-slate-500 text-[10px] uppercase font-semibold block">
                    Client Status
                  </span>
                  <div className="mt-1">
                    <ClientStatusBadge status={client.status} />
                  </div>
                </div>

                <div className="rounded-xl border border-odw-border bg-slate-50/50 p-3">
                  <span className="text-slate-500 text-[10px] uppercase font-semibold block">
                    Payment Status
                  </span>
                  <div className="mt-1">
                    <ClientPaymentBadge payment={client.payment} />
                  </div>
                </div>

                <div className="col-span-2 rounded-xl border border-odw-border bg-slate-50/50 p-3">
                  <span className="text-slate-500 text-[10px] uppercase font-semibold block">
                    Created
                  </span>
                  <p className="mt-1 font-semibold text-odw-text leading-snug">
                    {client.created}
                  </p>
                </div>
              </div>
            </div>

            {/* Internal Notes */}
            <div className="space-y-2">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-odw-text-muted">
                Internal Notes
              </h3>
              <div className="rounded-xl border border-odw-border bg-white p-3.5 text-xs text-slate-700 leading-relaxed shadow-2xs">
                {client.notes ? (
                  <p className="whitespace-pre-wrap">{client.notes}</p>
                ) : (
                  <p className="text-slate-400 italic">No internal notes added.</p>
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
                      <p className="font-semibold text-odw-text">Client created</p>
                      <span className="text-[10px] text-slate-400">· {client.created}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Status: {client.status} · Initial client relationship added to CRM.
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
                className="inline-flex items-center gap-1.5 rounded-lg bg-odw-primary px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-odw-primary-hover active:scale-[0.98] transition-all cursor-pointer"
              >
                Edit Client
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

export default ClientDetailsDrawer
