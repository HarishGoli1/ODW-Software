import { useState, useMemo, useEffect, useCallback } from 'react'
import { CheckCircle2, AlertTriangle, Loader2, RefreshCw } from 'lucide-react'
import TeamHeader from '../components/team/TeamHeader'
import TeamSummary from '../components/team/TeamSummary'
import TeamToolbar from '../components/team/TeamToolbar'
import TeamTable from '../components/team/TeamTable'
import AddTeamMemberDrawer from '../components/team/AddTeamMemberDrawer'
import TeamMemberDetailsDrawer from '../components/team/TeamMemberDetailsDrawer'
import EditTeamMemberDrawer from '../components/team/EditTeamMemberDrawer'
import DeleteTeamMemberModal from '../components/team/DeleteTeamMemberModal'
import {
  getTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} from '../services/teamService'
import { useAuth } from '../context/AuthContext'

const TEAM_PER_PAGE = 8

function Team() {
  const { user, employee } = useAuth()
  const role = employee?.system_role?.toLowerCase() || 'member'
  const isAdmin = role === 'admin'

  const [teamMembers, setTeamMembers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [roleFilter, setRoleFilter] = useState('All Roles')
  const [currentPage, setCurrentPage] = useState(1)

  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [editingMember, setEditingMember] = useState(null)
  const [deletingMember, setDeletingMember] = useState(null)
  const [toast, setToast] = useState(null)

  // Fetch live team members from Supabase
  const loadData = useCallback(async () => {
    setIsLoading(true)
    setFetchError(null)
    try {
      const data = await getTeamMembers()
      setTeamMembers(data)
    } catch (err) {
      console.error('Failed to load team members:', err)
      setFetchError(err.message || 'Unable to connect to database. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Compute unique roles currently present in team members
  const roleOptions = useMemo(() => {
    const roles = new Set()
    teamMembers.forEach((m) => {
      if (m.role) roles.add(m.role)
    })
    return ['All Roles', ...Array.from(roles).sort()]
  }, [teamMembers])

  // Real-time client-side filtering: search + status + role
  const filteredMembers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()

    return teamMembers.filter((member) => {
      // 1. Search matches: name, email, phone, role, department
      const matchesSearch =
        !q ||
        member.name.toLowerCase().includes(q) ||
        member.email.toLowerCase().includes(q) ||
        (member.phone && member.phone.toLowerCase().includes(q)) ||
        member.role.toLowerCase().includes(q) ||
        member.department.toLowerCase().includes(q)

      // 2. Status match
      const matchesStatus =
        statusFilter === 'All Status' || member.status === statusFilter

      // 3. Role match
      const matchesRole =
        roleFilter === 'All Roles' || member.role === roleFilter

      return matchesSearch && matchesStatus && matchesRole
    })
  }, [teamMembers, searchQuery, statusFilter, roleFilter])

  // Pagination calculation
  const totalFilteredCount = filteredMembers.length
  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / TEAM_PER_PAGE))
  const activePage = Math.min(currentPage, totalPages)

  // Page clamping: if deleting or filtering items shrinks the list, move to last valid page
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  // Paginated slice for current page
  const paginatedMembers = useMemo(() => {
    const startIndex = (activePage - 1) * TEAM_PER_PAGE
    return filteredMembers.slice(startIndex, startIndex + TEAM_PER_PAGE)
  }, [filteredMembers, activePage])

  // Filter change handlers resetting page to 1
  const handleSearchChange = (query) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handleStatusChange = (status) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  const handleRoleChange = (role) => {
    setRoleFilter(role)
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // Toast notification helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast(null)
    }, 4000)
  }

  // CRUD Handlers
  const handleOpenAddDrawer = () => {
    if (!isAdmin) return
    setIsAddDrawerOpen(true)
  }

  const handleCloseAddDrawer = () => {
    setIsAddDrawerOpen(false)
  }

  const handleSaveMember = async (newMember) => {
    try {
      const created = await createTeamMember(newMember)
      setTeamMembers((prev) => [created, ...prev])
      setCurrentPage(1)
      showToast('Team member added successfully.')
      return created
    } catch (err) {
      console.error('Error adding team member:', err)
      showToast(err.message || 'Failed to add team member.', 'error')
      throw err
    }
  }

  const handleViewMember = (member) => {
    setSelectedMember(member)
  }

  const handleCloseDetails = () => {
    setSelectedMember(null)
  }

  const handleEditMember = (member) => {
    if (!isAdmin) return
    setSelectedMember(null) // Seamless transition: close details drawer if open
    setEditingMember(member)
  }

  const handleCloseEditDrawer = () => {
    setEditingMember(null)
  }

  const handleUpdateMember = async (updatedMember) => {
    try {
      const saved = await updateTeamMember(updatedMember.id, updatedMember)
      setTeamMembers((prev) =>
        prev.map((member) => (member.id === saved.id ? saved : member))
      )
      if (selectedMember?.id === saved.id) setSelectedMember(saved)
      showToast('Team member updated successfully.')
      return saved
    } catch (err) {
      console.error('Error updating team member:', err)
      showToast(err.message || 'Failed to update team member.', 'error')
      throw err
    }
  }

  const handlePromptDelete = (member) => {
    if (!isAdmin) return
    // Critical safety: prevent deleting the currently signed-in user
    if (member.authUserId && user?.id && member.authUserId === user.id) {
      showToast('You cannot delete the currently signed-in account.', 'error')
      return
    }
    setDeletingMember(member)
  }

  const handleCloseDeleteModal = () => {
    if (!isDeleting) {
      setDeletingMember(null)
    }
  }

  const handleConfirmDelete = async (memberId) => {
    const targetMember = teamMembers.find((m) => m.id === memberId) || deletingMember
    if (targetMember?.authUserId && user?.id && targetMember.authUserId === user.id) {
      showToast('You cannot delete the currently signed-in account.', 'error')
      setDeletingMember(null)
      return
    }

    setIsDeleting(true)
    try {
      await deleteTeamMember(memberId, user?.id)
      setTeamMembers((prev) => prev.filter((m) => m.id !== memberId))

      if (selectedMember?.id === memberId) setSelectedMember(null)
      if (editingMember?.id === memberId) setEditingMember(null)

      setDeletingMember(null)
      showToast('Team member deleted successfully.')
    } catch (err) {
      console.error('Error deleting team member:', err)
      showToast(err.message || 'Failed to delete team member.', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-medium text-white shadow-lg animate-in fade-in slide-in-from-top-2 duration-200 ${
            toast.type === 'error' ? 'bg-rose-900 border border-rose-700' : 'bg-slate-900'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* 1. Header with Breadcrumbs, Title & Add Team Member Action */}
      <TeamHeader onAddMember={handleOpenAddDrawer} canAdd={isAdmin} />

      {/* 2. Compact Dynamic Metric Summary Row (Total, Active, On Leave, Inactive) */}
      <TeamSummary teamMembers={teamMembers} />

      {/* 3. Main Workspace Card (Toolbar + Table + Pagination) */}
      <div className="rounded-xl border border-odw-border bg-white shadow-2xs overflow-hidden">
        <TeamToolbar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          statusFilter={statusFilter}
          onStatusChange={handleStatusChange}
          roleFilter={roleFilter}
          onRoleChange={handleRoleChange}
          roleOptions={roleOptions}
          totalCount={totalFilteredCount}
        />

        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-odw-primary" />
            <p className="text-xs font-medium text-odw-text-muted">
              Loading team members from Supabase...
            </p>
          </div>
        ) : fetchError ? (
          <div className="p-10 flex flex-col items-center justify-center gap-2 text-center bg-rose-50/50">
            <AlertTriangle className="h-6 w-6 text-rose-500" />
            <p className="text-xs font-semibold text-rose-800">{fetchError}</p>
            <button
              type="button"
              onClick={loadData}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-odw-primary hover:underline cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry</span>
            </button>
          </div>
        ) : (
          <TeamTable
            teamMembers={paginatedMembers}
            totalLifetimeCount={teamMembers.length}
            currentPage={activePage}
            totalPages={totalPages}
            totalFilteredCount={totalFilteredCount}
            itemsPerPage={TEAM_PER_PAGE}
            onPageChange={handlePageChange}
            onViewMember={handleViewMember}
            onEditMember={handleEditMember}
            onDeleteMember={handlePromptDelete}
            onAddMember={handleOpenAddDrawer}
            canManage={isAdmin}
          />
        )}
      </div>

      {/* 4. Slide-over Add Team Member Drawer */}
      <AddTeamMemberDrawer
        isOpen={isAddDrawerOpen && isAdmin}
        onClose={handleCloseAddDrawer}
        onSaveMember={handleSaveMember}
      />

      {/* 5. Slide-over Team Member Details Drawer */}
      <TeamMemberDetailsDrawer
        member={selectedMember}
        isOpen={Boolean(selectedMember)}
        onClose={handleCloseDetails}
        onEdit={handleEditMember}
        canEdit={isAdmin}
      />

      {/* 6. Slide-over Edit Team Member Drawer */}
      <EditTeamMemberDrawer
        member={editingMember}
        isOpen={Boolean(editingMember) && isAdmin}
        onClose={handleCloseEditDrawer}
        onSave={handleUpdateMember}
      />

      {/* 7. Delete Team Member Confirmation Modal */}
      <DeleteTeamMemberModal
        member={deletingMember}
        isOpen={Boolean(deletingMember) && isAdmin}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  )
}

export default Team
