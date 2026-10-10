import { useState } from 'react'
import { MoreHorizontal, Eye, Pencil, Trash2, Phone, FolderKanban } from 'lucide-react'
import ClientStatusBadge from './ClientStatusBadge'
import ClientPaymentBadge from './ClientPaymentBadge'

function ClientsTable({
  clients,
  totalLifetimeCount = 24,
  currentPage = 1,
  totalPages = 1,
  totalFilteredCount = 0,
  itemsPerPage = 8,
  onPageChange = () => {},
  onSelectClient = () => {},
  onEditClient = () => {},
  onDeleteClient = () => {},
  canEdit = true,
  canDelete = true,
}) {
  const [activeMenuId, setActiveMenuId] = useState(null)

  const toggleMenu = (id) => {
    setActiveMenuId((prev) => (prev === id ? null : id))
  }

  const handleAction = (action, client) => {
    setActiveMenuId(null)
    if (action === 'view') onSelectClient(client)
    if (action === 'edit' && canEdit) onEditClient(client)
    if (action === 'delete' && canDelete) onDeleteClient(client)
  }

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
              <th className="py-3 px-4">Client</th>
              <th className="py-3 px-4">Company</th>
              <th className="py-3 px-4">Contact</th>
              <th className="py-3 px-4">Service</th>
              <th className="py-3 px-4">Projects</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Payment</th>
              <th className="py-3 px-4">Created</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-odw-border text-xs">
            {clients.length > 0 ? (
              clients.map((client) => (
                <tr
                  key={client.id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Client: Avatar, Name, Email */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold text-xs shrink-0 border border-slate-200">
                        {client.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-odw-text truncate">
                          {client.name}
                        </p>
                        <p className="text-[11px] text-odw-text-muted truncate">
                          {client.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Company */}
                  <td className="py-3 px-4 text-slate-700 font-medium">
                    {client.company}
                  </td>

                  {/* Contact */}
                  <td className="py-3 px-4 text-slate-600">
                    <span className="font-mono text-[11px]">{client.phone}</span>
                  </td>

                  {/* Service */}
                  <td className="py-3 px-4 text-slate-700">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200/60">
                      {client.service}
                    </span>
                  </td>

                  {/* Projects */}
                  <td className="py-3 px-4 text-slate-700">
                    <span className="inline-flex items-center gap-1 font-semibold text-odw-text">
                      <FolderKanban className="h-3 w-3 text-slate-400" />
                      {client.projects}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    <ClientStatusBadge status={client.status} />
                  </td>

                  {/* Payment */}
                  <td className="py-3 px-4">
                    <ClientPaymentBadge payment={client.payment} />
                  </td>

                  {/* Created */}
                  <td className="py-3 px-4 text-odw-text-muted whitespace-nowrap">
                    {client.created}
                  </td>

                  {/* Actions Menu */}
                  <td className="py-3 px-4 text-right relative">
                    <button
                      type="button"
                      onClick={() => toggleMenu(client.id)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:text-odw-text hover:bg-slate-100 transition-colors cursor-pointer"
                      aria-label={`Actions for ${client.name}`}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>

                    {/* Action Dropdown Menu */}
                    {activeMenuId === client.id && (
                      <div className="absolute right-4 top-10 z-20 w-32 rounded-lg border border-odw-border bg-white py-1 shadow-md text-left">
                        <button
                          type="button"
                          onClick={() => handleAction('view', client)}
                          className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-odw-primary transition-colors cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5 text-slate-400" />
                          <span>View</span>
                        </button>
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => handleAction('edit', client)}
                            className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-odw-primary transition-colors cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5 text-slate-400" />
                            <span>Edit</span>
                          </button>
                        )}
                        {canDelete && (
                          <>
                            <div className="my-1 border-t border-slate-100" />
                            <button
                              type="button"
                              onClick={() => handleAction('delete', client)}
                              className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                              <span>Delete</span>
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="py-12 text-center text-odw-text-muted text-xs">
                  <p className="font-semibold text-slate-700">No clients found</p>
                  <p className="mt-0.5 text-slate-400">Try adjusting your search or filters.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* =========================================
          2. MOBILE CARD VIEW (No horizontal overflow)
          ========================================= */}
      <div className="md:hidden divide-y divide-odw-border">
        {clients.length > 0 ? (
          clients.map((client) => (
            <div key={client.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold text-xs shrink-0 border border-slate-200">
                    {client.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-xs text-odw-text truncate">
                      {client.name}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {client.company}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <ClientStatusBadge status={client.status} />
                  <ClientPaymentBadge payment={client.payment} />
                </div>
              </div>

              {/* Service & Projects */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50/70 rounded-lg p-2.5 border border-slate-100">
                <div>
                  <span className="text-odw-text-muted block text-[10px] uppercase">Service</span>
                  <span className="font-medium text-odw-text">{client.service}</span>
                </div>
                <div>
                  <span className="text-odw-text-muted block text-[10px] uppercase">Projects</span>
                  <span className="font-semibold text-odw-text">{client.projects} active</span>
                </div>
              </div>

              {/* Contact & Meta */}
              <div className="flex items-center justify-between text-[11px] text-odw-text-muted pt-0.5">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1">
                    <Phone className="h-3 w-3 text-slate-400" />
                    {client.phone}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px]">{client.created}</span>
                  <button
                    type="button"
                    onClick={() => onSelectClient(client)}
                    className="inline-flex items-center gap-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    <Eye className="h-3 w-3 text-slate-500" />
                    <span>View</span>
                  </button>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => onEditClient(client)}
                      className="inline-flex items-center gap-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      <Pencil className="h-3 w-3 text-slate-500" />
                      <span>Edit</span>
                    </button>
                  )}
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => onDeleteClient(client)}
                      className="inline-flex items-center gap-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 px-2 py-0.5 text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3 text-rose-500" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-odw-text-muted text-xs">
            <p className="font-semibold text-slate-700">No clients found</p>
            <p className="mt-0.5 text-slate-400">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      {/* =========================================
          3. TABLE FOOTER & PAGINATION
          ========================================= */}
      {totalFilteredCount > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-odw-border p-3.5 sm:p-4 text-xs text-odw-text-muted">
          <div>
            Showing <span className="font-semibold text-odw-text">{startIndex}–{endIndex}</span> of{' '}
            <span className="font-semibold text-odw-text">{totalFilteredCount}</span> clients
          </div>

          {/* Pagination UI */}
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

export default ClientsTable
