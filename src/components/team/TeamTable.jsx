import { useState } from 'react'
import {
  Users,
  Eye,
  Pencil,
  Trash2,
  Calendar,
  FolderKanban,
  CheckSquare,
  Plus,
} from 'lucide-react'
import TeamStatusBadge from './TeamStatusBadge'

export function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
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

function TeamTable({
  teamMembers = [],
  totalLifetimeCount = 0,
  currentPage = 1,
  totalPages = 1,
  totalFilteredCount = 0,
  itemsPerPage = 8,
  onPageChange = () => {},
  onViewMember = () => {},
  onEditMember = () => {},
  onDeleteMember = () => {},
  onAddMember = () => {},
  canManage = true,
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
              <th className="py-3 px-4">Member</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-center">Active Projects</th>
              <th className="py-3 px-4 text-center">Assigned Tasks</th>
              <th className="py-3 px-4">Joined</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-odw-border text-xs">
            {teamMembers.length > 0 ? (
              teamMembers.map((member) => (
                <tr
                  key={member.id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Member Name, Avatar & Email */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold text-xs shrink-0 border border-slate-200">
                        {getInitials(member.name)}
                      </div>
                      <div className="min-w-0 max-w-[190px]">
                        <p className="font-semibold text-odw-text truncate">
                          {member.name}
                        </p>
                        <p className="text-[11px] text-odw-text-muted truncate">
                          {member.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="py-3 px-4">
                    <span className="font-medium text-slate-800">
                      {member.role}
                    </span>
                  </td>

                  {/* Department */}
                  <td className="py-3 px-4">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200/60">
                      {member.department}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    <TeamStatusBadge status={member.status} />
                  </td>

                  {/* Active Projects */}
                  <td className="py-3 px-4 text-center font-semibold text-slate-700">
                    {member.activeProjects}
                  </td>

                  {/* Assigned Tasks */}
                  <td className="py-3 px-4 text-center font-semibold text-slate-700">
                    {member.assignedTasks}
                  </td>

                  {/* Joined Date */}
                  <td className="py-3 px-4 text-odw-text-muted">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                      <span>{formatDate(member.joinedDate)}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onViewMember(member)}
                        className="inline-flex items-center gap-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 text-xs font-medium transition-colors cursor-pointer"
                        title="View Team Member Details"
                      >
                        <Eye className="h-3 w-3 text-slate-500" />
                        <span>View</span>
                      </button>
                      {canManage && (
                        <>
                          <button
                            type="button"
                            onClick={() => onEditMember(member)}
                            className="inline-flex items-center gap-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 text-xs font-medium transition-colors cursor-pointer"
                            title="Edit Team Member"
                          >
                            <Pencil className="h-3 w-3 text-slate-500" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteMember(member)}
                            className="inline-flex items-center gap-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 px-2 py-1 text-xs font-medium transition-colors cursor-pointer"
                            title="Delete Team Member"
                          >
                            <Trash2 className="h-3 w-3 text-rose-500" />
                            <span>Delete</span>
                          </button>
                        </>
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
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">
                        No team members yet.
                      </p>
                      <p className="text-slate-500 text-xs mt-0.5">
                        Add your first team member to start managing your team.
                      </p>
                    </div>
                    {canManage && (
                      <button
                        type="button"
                        onClick={onAddMember}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-odw-primary px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-odw-primary-hover transition-colors cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Team Member</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              <tr>
                <td colSpan="8" className="p-8 text-center text-xs text-odw-text-muted">
                  <p className="font-semibold text-slate-700">No team members found.</p>
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
        {teamMembers.length > 0 ? (
          teamMembers.map((member) => (
            <div key={member.id} className="p-4 space-y-3 bg-white">
              {/* Header: Avatar, Name, Email, Status */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold text-xs shrink-0 border border-slate-200">
                    {getInitials(member.name)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-odw-text text-xs sm:text-sm truncate">
                      {member.name}
                    </h3>
                    <p className="text-[11px] text-odw-text-muted truncate">
                      {member.email}
                    </p>
                  </div>
                </div>
                <TeamStatusBadge status={member.status} />
              </div>

              {/* Role & Department */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-odw-text-muted block">
                    Role
                  </span>
                  <p className="font-medium text-slate-800 truncate">
                    {member.role}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-odw-text-muted block">
                    Department
                  </span>
                  <p className="font-medium text-slate-700 truncate">
                    {member.department}
                  </p>
                </div>
              </div>

              {/* Projects & Tasks Counts */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <FolderKanban className="h-3.5 w-3.5 text-slate-400" />
                  <span>{member.activeProjects} Active Projects</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <CheckSquare className="h-3.5 w-3.5 text-slate-400" />
                  <span>{member.assignedTasks} Tasks</span>
                </div>
              </div>

              {/* Mobile Actions */}
              <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => onViewMember(member)}
                  className="inline-flex items-center gap-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer"
                >
                  <Eye className="h-3 w-3 text-slate-500" />
                  <span>View</span>
                </button>
                {canManage && (
                  <>
                    <button
                      type="button"
                      onClick={() => onEditMember(member)}
                      className="inline-flex items-center gap-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer"
                    >
                      <Pencil className="h-3 w-3 text-slate-500" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteMember(member)}
                      className="inline-flex items-center gap-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3 text-rose-500" />
                      <span>Delete</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        ) : totalLifetimeCount === 0 ? (
          <div className="p-8 text-center text-xs space-y-3">
            <p className="font-semibold text-slate-800 text-sm">No team members yet.</p>
            <p className="text-slate-500 text-xs">
              Add your first team member to start managing your team.
            </p>
            {canManage && (
              <button
                type="button"
                onClick={onAddMember}
                className="inline-flex items-center gap-1.5 rounded-lg bg-odw-primary px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-odw-primary-hover transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Team Member</span>
              </button>
            )}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-odw-text-muted">
            <p className="font-semibold text-slate-700">No team members found.</p>
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
            <span className="font-semibold text-odw-text">{totalFilteredCount}</span> members
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

export default TeamTable
