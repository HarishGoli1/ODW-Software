import { useState } from 'react'
import {
  CreditCard,
  Eye,
  Pencil,
  Trash2,
  Calendar,
  Building2,
  User,
  Plus,
  FolderKanban,
  FileText,
} from 'lucide-react'
import PaymentStatusBadge from './PaymentStatusBadge'

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

function PaymentsTable({
  payments = [],
  totalLifetimeCount = 0,
  currentPage = 1,
  totalPages = 1,
  totalFilteredCount = 0,
  itemsPerPage = 8,
  onPageChange = () => {},
  onViewPayment = () => {},
  onEditPayment = () => {},
  onDeletePayment = () => {},
  onAddPayment = () => {},
  canDelete = true,
}) {
  const startIndex = totalFilteredCount > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0
  const endIndex = Math.min(currentPage * itemsPerPage, totalFilteredCount)

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
              <th className="py-3 px-4">Payment</th>
              <th className="py-3 px-4">Client</th>
              <th className="py-3 px-4">Project / Proposal</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Payment Date</th>
              <th className="py-3 px-4">Method</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-odw-border text-xs">
            {payments.length > 0 ? (
              payments.map((payment) => (
                <tr
                  key={payment.id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Payment Number & Reference / Note */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-odw-primary font-bold text-xs shrink-0 border border-orange-200/60">
                        <CreditCard className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 max-w-[170px]">
                        <span className="font-mono text-[11px] font-bold text-slate-500 block leading-tight">
                          {payment.paymentNumber}
                        </span>
                        <p className="font-semibold text-odw-text truncate mt-0.5">
                          {payment.reference || payment.notes || 'Payment Record'}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Client: Company & Name */}
                  <td className="py-3 px-4">
                    <div className="min-w-0 max-w-[170px]">
                      <p className="font-semibold text-odw-text truncate">
                        {payment.company}
                      </p>
                      <p className="text-[11px] text-odw-text-muted truncate">
                        {payment.clientName}
                      </p>
                    </div>
                  </td>

                  {/* Project / Proposal */}
                  <td className="py-3 px-4">
                    <div className="min-w-0 max-w-[180px]">
                      {payment.projectName ? (
                        <p className="font-medium text-slate-800 truncate flex items-center gap-1">
                          <FolderKanban className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className="truncate">{payment.projectName}</span>
                        </p>
                      ) : null}
                      {payment.proposalNumber ? (
                        <p className="text-[11px] text-odw-text-muted truncate flex items-center gap-1 mt-0.5">
                          <FileText className="h-3 w-3 text-slate-400 shrink-0" />
                          <span>{payment.proposalNumber}</span>
                        </p>
                      ) : null}
                      {!payment.projectName && !payment.proposalNumber && (
                        <span className="text-slate-400">—</span>
                      )}
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {formatINR(payment.amount)}
                  </td>

                  {/* Payment Date */}
                  <td className="py-3 px-4 text-odw-text-muted">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                      <span>{formatDate(payment.paymentDate)}</span>
                    </div>
                  </td>

                  {/* Method */}
                  <td className="py-3 px-4">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200/60">
                      {payment.paymentMethod}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    <PaymentStatusBadge status={payment.status} />
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onViewPayment(payment)}
                        className="inline-flex items-center gap-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 text-xs font-medium transition-colors cursor-pointer"
                        title="View Payment Details"
                      >
                        <Eye className="h-3 w-3 text-slate-500" />
                        <span>View</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onEditPayment(payment)}
                        className="inline-flex items-center gap-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 text-xs font-medium transition-colors cursor-pointer"
                        title="Edit Payment"
                      >
                        <Pencil className="h-3 w-3 text-slate-500" />
                        <span>Edit</span>
                      </button>
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => onDeletePayment(payment)}
                          className="inline-flex items-center gap-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 px-2 py-1 text-xs font-medium transition-colors cursor-pointer"
                          title="Delete Payment"
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
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">
                        No payments yet.
                      </p>
                      <p className="text-slate-500 text-xs mt-0.5">
                        Record your first payment to start tracking client payments.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={onAddPayment}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-odw-primary px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-odw-primary-hover transition-colors cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Record Payment</span>
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              <tr>
                <td colSpan="8" className="p-8 text-center text-xs text-odw-text-muted">
                  <p className="font-semibold text-slate-700">No payments found.</p>
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
        {payments.length > 0 ? (
          payments.map((payment) => (
            <div key={payment.id} className="p-4 space-y-3 bg-white">
              {/* Header: Number, Status & Amount */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="font-mono text-[10px] font-bold text-slate-500 block">
                    {payment.paymentNumber}
                  </span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">
                    {formatINR(payment.amount)}
                  </p>
                </div>
                <PaymentStatusBadge status={payment.status} />
              </div>

              {/* Client & Method */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-odw-text-muted block">
                    Client
                  </span>
                  <p className="font-semibold text-slate-800 truncate">
                    {payment.company}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {payment.clientName}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-odw-text-muted block">
                    Method & Date
                  </span>
                  <p className="font-medium text-slate-700 truncate">
                    {payment.paymentMethod}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {formatDate(payment.paymentDate)}
                  </p>
                </div>
              </div>

              {/* Project / Proposal & Reference */}
              {(payment.projectName || payment.proposalNumber || payment.reference) && (
                <div className="text-xs pt-1 border-t border-slate-100 space-y-0.5">
                  {payment.projectName && (
                    <p className="font-medium text-slate-700 truncate">
                      Project: {payment.projectName}
                    </p>
                  )}
                  {payment.proposalNumber && (
                    <p className="text-[11px] text-slate-500 truncate">
                      Proposal: {payment.proposalNumber}
                    </p>
                  )}
                  {payment.reference && (
                    <p className="text-[11px] text-slate-500 font-mono truncate">
                      Ref: {payment.reference}
                    </p>
                  )}
                </div>
              )}

              {/* Mobile Actions */}
              <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => onViewPayment(payment)}
                  className="inline-flex items-center gap-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer"
                >
                  <Eye className="h-3 w-3 text-slate-500" />
                  <span>View</span>
                </button>
                <button
                  type="button"
                  onClick={() => onEditPayment(payment)}
                  className="inline-flex items-center gap-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer"
                >
                  <Pencil className="h-3 w-3 text-slate-500" />
                  <span>Edit</span>
                </button>
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => onDeletePayment(payment)}
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
            <p className="font-semibold text-slate-800 text-sm">No payments yet.</p>
            <p className="text-slate-500 text-xs">
              Record your first payment to start tracking client payments.
            </p>
            <button
              type="button"
              onClick={onAddPayment}
              className="inline-flex items-center gap-1.5 rounded-lg bg-odw-primary px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-odw-primary-hover transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Record Payment</span>
            </button>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-odw-text-muted">
            <p className="font-semibold text-slate-700">No payments found.</p>
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
            <span className="font-semibold text-odw-text">{totalFilteredCount}</span> payments
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-2.5 py-1 rounded-md border border-odw-border bg-white text-xs hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Previous
              </button>

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

              <div className="sm:hidden px-2 text-xs font-medium text-slate-700">
                Page {currentPage} of {totalPages}
              </div>

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

export default PaymentsTable
