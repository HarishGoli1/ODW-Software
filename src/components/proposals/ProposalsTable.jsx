import { useState } from 'react'
import {
  FileText,
  Eye,
  Pencil,
  Trash2,
  Calendar,
  Building2,
  User,
  Plus,
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

function ProposalsTable({
  proposals = [],
  totalLifetimeCount = 0,
  currentPage = 1,
  totalPages = 1,
  totalFilteredCount = 0,
  itemsPerPage = 8,
  onPageChange = () => {},
  onViewProposal = () => {},
  onEditProposal = () => {},
  onDeleteProposal = () => {},
  onAddProposal = () => {},
  canEdit = true,
  canDelete = true,
}) {
  // Calculate dynamic start and end display indices
  const startIndex = totalFilteredCount > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0
  const endIndex = Math.min(currentPage * itemsPerPage, totalFilteredCount)

  // Generate dynamic page numbers with ellipsis
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    if (currentPage <= 3) {
      return [1, 2, 3, '...', totalPages]
    }

    if (currentPage >= totalPages - 2) {
      return [1, '...', totalPages - 2, totalPages - 1, totalPages]
    }

    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages]
  }

  const pageNumbers = getPageNumbers()

  return (
    <div>
      {/* =========================================
          1. DESKTOP / TABLET TABLE VIEW
          ========================================= */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-odw-border bg-slate-50/50 text-[11px] font-semibold uppercase tracking-wider text-odw-text-muted">
              <th className="py-3 px-4">Proposal</th>
              <th className="py-3 px-4">Client</th>
              <th className="py-3 px-4">Service</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Valid Until</th>
              <th className="py-3 px-4">Created</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-odw-border text-xs">
            {proposals.length > 0 ? (
              proposals.map((proposal) => (
                <tr
                  key={proposal.id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Proposal Number & Title */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-odw-primary font-bold text-xs shrink-0 border border-orange-200/60">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 max-w-[220px]">
                        <span className="font-mono text-[11px] font-bold text-slate-500 block leading-tight">
                          {proposal.proposalNumber}
                        </span>
                        <p className="font-semibold text-odw-text truncate mt-0.5">
                          {proposal.title}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Client: Company & Name */}
                  <td className="py-3 px-4">
                    <div className="min-w-0 max-w-[170px]">
                      <p className="font-semibold text-odw-text truncate">
                        {proposal.company}
                      </p>
                      <p className="text-[11px] text-odw-text-muted truncate">
                        {proposal.clientName}
                      </p>
                    </div>
                  </td>

                  {/* Service */}
                  <td className="py-3 px-4">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200/60">
                      {proposal.service}
                    </span>
                  </td>

                  {/* Amount */}
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {formatINR(proposal.amount)}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    <ProposalStatusBadge status={proposal.status} />
                  </td>

                  {/* Valid Until */}
                  <td className="py-3 px-4 text-odw-text-muted">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                      <span>{formatDate(proposal.validUntil)}</span>
                    </div>
                  </td>

                  {/* Created */}
                  <td className="py-3 px-4 text-odw-text-muted text-[11px]">
                    {formatDate(proposal.createdAt)}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onViewProposal(proposal)}
                        className="inline-flex items-center gap-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 text-xs font-medium transition-colors cursor-pointer"
                        title="View Proposal Details"
                      >
                        <Eye className="h-3 w-3 text-slate-500" />
                        <span>View</span>
                      </button>
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => onEditProposal(proposal)}
                          className="inline-flex items-center gap-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 text-xs font-medium transition-colors cursor-pointer"
                          title="Edit Proposal"
                        >
                          <Pencil className="h-3 w-3 text-slate-500" />
                          <span>Edit</span>
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => onDeleteProposal(proposal)}
                          className="inline-flex items-center gap-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 px-2 py-1 text-xs font-medium transition-colors cursor-pointer"
                          title="Delete Proposal"
                        >
                          <Trash2 className="h-3 w-3 text-rose-500" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : totalLifetimeCount === 0 ? (
              <tr>
                <td colSpan="8" className="p-12 text-center text-xs">
                  <div className="space-y-3">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 border border-slate-200 text-slate-400">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">
                        No proposals yet.
                      </p>
                      <p className="text-slate-500 text-xs mt-0.5">
                        Add your first proposal to start tracking client proposals.
                      </p>
                    </div>
                    {canEdit && (
                      <button
                        type="button"
                        onClick={onAddProposal}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-odw-primary px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-odw-primary-hover transition-colors cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Proposal</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              <tr>
                <td colSpan="8" className="p-8 text-center text-xs text-odw-text-muted">
                  <p className="font-semibold text-slate-700">No proposals found.</p>
                  <p className="mt-0.5 text-slate-400">Try changing your search or filters.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* =========================================
          2. MOBILE VIEW (RESPONSIVE CARDS)
          ========================================= */}
      <div className="md:hidden divide-y divide-odw-border">
        {proposals.length > 0 ? (
          proposals.map((proposal) => (
            <div key={proposal.id} className="p-4 space-y-3 bg-white">
              {/* Header: Number, Status & Title */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="font-mono text-[10px] font-bold text-slate-500 block">
                    {proposal.proposalNumber}
                  </span>
                  <h3 className="font-bold text-odw-text text-xs sm:text-sm line-clamp-2 mt-0.5">
                    {proposal.title}
                  </h3>
                </div>
                <ProposalStatusBadge status={proposal.status} />
              </div>

              {/* Client & Service */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-odw-text-muted block">
                    Client
                  </span>
                  <p className="font-semibold text-slate-800 truncate">
                    {proposal.company}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {proposal.clientName}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-odw-text-muted block">
                    Service
                  </span>
                  <p className="font-medium text-slate-700 truncate">
                    {proposal.service}
                  </p>
                </div>
              </div>

              {/* Amount & Valid Until */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-odw-text-muted block">
                    Amount
                  </span>
                  <p className="font-bold text-sm text-slate-900">
                    {formatINR(proposal.amount)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-semibold text-odw-text-muted block">
                    Valid Until
                  </span>
                  <div className="flex items-center gap-1 text-slate-600 font-medium">
                    <Calendar className="h-3 w-3 text-slate-400" />
                    <span>{formatDate(proposal.validUntil)}</span>
                  </div>
                </div>
              </div>

              {/* Mobile Actions */}
              <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => onViewProposal(proposal)}
                  className="inline-flex items-center gap-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer"
                >
                  <Eye className="h-3 w-3 text-slate-500" />
                  <span>View</span>
                </button>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => onEditProposal(proposal)}
                    className="inline-flex items-center gap-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer"
                  >
                    <Pencil className="h-3 w-3 text-slate-500" />
                    <span>Edit</span>
                  </button>
                )}
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => onDeleteProposal(proposal)}
                    className="inline-flex items-center gap-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3 text-rose-500" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>
          ))
        ) : totalLifetimeCount === 0 ? (
          <div className="p-8 text-center text-xs space-y-3">
            <p className="font-semibold text-slate-800 text-sm">No proposals yet.</p>
            <p className="text-slate-500 text-xs">
              Add your first proposal to start tracking client proposals.
            </p>
            {canEdit && (
              <button
                type="button"
                onClick={onAddProposal}
                className="inline-flex items-center gap-1.5 rounded-lg bg-odw-primary px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-odw-primary-hover transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Proposal</span>
              </button>
            )}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-odw-text-muted">
            <p className="font-semibold text-slate-700">No proposals found.</p>
            <p className="mt-0.5 text-slate-400">Try changing your search or filters.</p>
          </div>
        )}
      </div>

      {/* =========================================
          3. TABLE FOOTER / DYNAMIC PAGINATION
          ========================================= */}
      {totalFilteredCount > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-odw-border p-3.5 sm:p-4 text-xs text-odw-text-muted">
          <div>
            Showing <span className="font-semibold text-odw-text">{startIndex}–{endIndex}</span> of{' '}
            <span className="font-semibold text-odw-text">{totalFilteredCount}</span> proposals
          </div>

          {/* Conditional Pagination: only show if totalFilteredCount > itemsPerPage */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              {/* Previous Button */}
              <button
                type="button"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-2.5 py-1 rounded-md border border-odw-border bg-white text-xs hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Previous
              </button>

              {/* Desktop Numeric Pages */}
              <div className="hidden sm:flex items-center gap-1">
                {pageNumbers.map((page, index) => {
                  if (page === '...') {
                    return (
                      <span key={`ellipsis-${index}`} className="px-1 text-slate-400 select-none">
                        ...
                      </span>
                    )
                  }

                  const isActive = page === currentPage

                  return (
                    <button
                      key={page}
                      type="button"
                      onClick={() => onPageChange(page)}
                      className={`h-7 w-7 rounded-md font-medium text-xs transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-odw-primary text-white shadow-2xs'
                          : 'border border-odw-border bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}
              </div>

              {/* Mobile Page Indicator */}
              <div className="sm:hidden px-2 text-xs font-medium text-slate-700">
                Page {currentPage} of {totalPages}
              </div>

              {/* Next Button */}
              <button
                type="button"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="px-2.5 py-1 rounded-md border border-odw-border bg-white text-xs hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ProposalsTable
