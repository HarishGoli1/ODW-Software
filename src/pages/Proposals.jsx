import { useState, useMemo, useEffect, useCallback } from 'react'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import ProposalsHeader from '../components/proposals/ProposalsHeader'
import ProposalSummary from '../components/proposals/ProposalSummary'
import ProposalsToolbar from '../components/proposals/ProposalsToolbar'
import ProposalsTable from '../components/proposals/ProposalsTable'
import AddProposalDrawer from '../components/proposals/AddProposalDrawer'
import ProposalDetailsDrawer from '../components/proposals/ProposalDetailsDrawer'
import EditProposalDrawer from '../components/proposals/EditProposalDrawer'
import DeleteProposalModal from '../components/proposals/DeleteProposalModal'
import {
  getProposals,
  createProposal,
  updateProposal,
  deleteProposal,
} from '../services/proposalsService'
import { useAuth } from '../context/AuthContext'

const PROPOSALS_PER_PAGE = 8

function Proposals() {
  const { employee } = useAuth()
  const role = employee?.system_role?.toLowerCase() || 'member'
  const canModify = role === 'admin' || role === 'manager'

  const [proposals, setProposals] = useState([])
  const [clients, setClients] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [serviceFilter, setServiceFilter] = useState('All Services')
  const [currentPage, setCurrentPage] = useState(1)

  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
  const [selectedProposal, setSelectedProposal] = useState(null)
  const [editingProposal, setEditingProposal] = useState(null)
  const [deletingProposal, setDeletingProposal] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)

  // Fetch live proposals and clients from Supabase
  const loadProposals = useCallback(async () => {
    setIsLoading(true)
    setFetchError(null)
    try {
      const data = await getProposals()
      setProposals(data.proposals || [])
      setClients(data.clients || [])
    } catch (err) {
      console.error('Failed to load proposals:', err)
      setFetchError(err.message || 'Failed to load proposals. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProposals()
  }, [loadProposals])

  // Compute unique services currently present in proposals
  const serviceOptions = useMemo(() => {
    const services = new Set()
    proposals.forEach((p) => {
      if (p.service) services.add(p.service)
    })
    return ['All Services', ...Array.from(services).sort()]
  }, [proposals])

  // Real-time client-side filtering: search + status + service
  const filteredProposals = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()

    return proposals.filter((proposal) => {
      // 1. Search matches: proposalNumber, clientName, company, title, service
      const matchesSearch =
        !q ||
        proposal.proposalNumber?.toLowerCase().includes(q) ||
        proposal.clientName?.toLowerCase().includes(q) ||
        proposal.company?.toLowerCase().includes(q) ||
        proposal.title?.toLowerCase().includes(q) ||
        proposal.service?.toLowerCase().includes(q)

      // 2. Status match
      const matchesStatus =
        statusFilter === 'All Status' || proposal.status === statusFilter

      // 3. Service match
      const matchesService =
        serviceFilter === 'All Services' || proposal.service === serviceFilter

      return matchesSearch && matchesStatus && matchesService
    })
  }, [proposals, searchQuery, statusFilter, serviceFilter])

  // Pagination calculation
  const totalFilteredCount = filteredProposals.length
  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / PROPOSALS_PER_PAGE))
  const activePage = Math.min(currentPage, totalPages)

  // Page clamping: if deleting or filtering items shrinks the list, move to last valid page
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  // Paginated slice for current page
  const paginatedProposals = useMemo(() => {
    const startIndex = (activePage - 1) * PROPOSALS_PER_PAGE
    return filteredProposals.slice(startIndex, startIndex + PROPOSALS_PER_PAGE)
  }, [filteredProposals, activePage])

  // Filter change handlers resetting to page 1
  const handleSearchChange = (query) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handleStatusChange = (status) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  const handleServiceChange = (service) => {
    setServiceFilter(service)
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // Toast helper
  const showToast = (message) => {
    setToastMessage(message)
    setTimeout(() => {
      setToastMessage(null)
    }, 3500)
  }

  // CRUD Handlers
  const handleOpenAddDrawer = () => {
    if (!canModify) return
    setIsAddDrawerOpen(true)
  }

  const handleCloseAddDrawer = () => {
    setIsAddDrawerOpen(false)
  }

  const handleSaveProposal = async (newProposalData) => {
    try {
      const created = await createProposal(newProposalData)
      setProposals((prev) => [created, ...prev])
      setCurrentPage(1)
      setIsAddDrawerOpen(false)
      showToast('Proposal created successfully.')
    } catch (err) {
      console.error('Create proposal error:', err)
      showToast(err.message || 'Failed to create proposal.')
      throw err
    }
  }

  const handleViewProposal = (proposal) => {
    setSelectedProposal(proposal)
  }

  const handleCloseDetails = () => {
    setSelectedProposal(null)
  }

  const handleEditProposal = (proposal) => {
    if (!canModify) return
    setSelectedProposal(null) // Seamless transition: close details drawer if open
    setEditingProposal(proposal)
  }

  const handleCloseEditDrawer = () => {
    setEditingProposal(null)
  }

  const handleUpdateProposal = async (updatedProposalData) => {
    try {
      const updated = await updateProposal(updatedProposalData.id, updatedProposalData)
      setProposals((prev) =>
        prev.map((proposal) =>
          proposal.id === updated.id ? updated : proposal
        )
      )
      if (selectedProposal?.id === updated.id) {
        setSelectedProposal(updated)
      }
      setEditingProposal(null)
      showToast('Proposal updated successfully.')
    } catch (err) {
      console.error('Update proposal error:', err)
      showToast(err.message || 'Failed to update proposal.')
      throw err
    }
  }

  const handlePromptDelete = (proposal) => {
    if (!canModify) return
    setDeletingProposal(proposal)
  }

  const handleCloseDeleteModal = () => {
    if (!isDeleting) {
      setDeletingProposal(null)
    }
  }

  const handleConfirmDelete = async (proposalId) => {
    setIsDeleting(true)
    try {
      await deleteProposal(proposalId)
      setProposals((prev) => prev.filter((p) => p.id !== proposalId))

      // Close drawers if this proposal was active
      if (selectedProposal?.id === proposalId) setSelectedProposal(null)
      if (editingProposal?.id === proposalId) setEditingProposal(null)

      setDeletingProposal(null)
      showToast('Proposal deleted successfully.')
    } catch (err) {
      console.error('Delete proposal error:', err)
      showToast(err.message || 'Failed to delete proposal.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-medium text-white shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header with Breadcrumbs, Title & Add Proposal Action */}
      <ProposalsHeader onAddProposal={handleOpenAddDrawer} canAdd={canModify} />

      {/* 2. Compact Dynamic Metric Summary Row (Total, Draft, Sent, Accepted) */}
      <ProposalSummary proposals={proposals} />

      {/* 3. Main Workspace Card (Toolbar + Table + Pagination) */}
      <div className="rounded-xl border border-odw-border bg-white shadow-2xs overflow-hidden">
        <ProposalsToolbar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          statusFilter={statusFilter}
          onStatusChange={handleStatusChange}
          serviceFilter={serviceFilter}
          onServiceChange={handleServiceChange}
          serviceOptions={serviceOptions}
          totalCount={totalFilteredCount}
        />

        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-odw-primary" />
            <p className="text-xs font-medium text-odw-text-muted">
              Loading proposals from Supabase...
            </p>
          </div>
        ) : fetchError ? (
          <div className="p-10 flex flex-col items-center justify-center gap-2 text-center bg-rose-50/50">
            <AlertCircle className="h-6 w-6 text-rose-500" />
            <p className="text-xs font-semibold text-rose-800">{fetchError}</p>
            <button
              onClick={loadProposals}
              className="mt-2 text-xs font-medium text-odw-primary hover:underline cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : (
          <ProposalsTable
            proposals={paginatedProposals}
            totalLifetimeCount={proposals.length}
            currentPage={activePage}
            totalPages={totalPages}
            totalFilteredCount={totalFilteredCount}
            itemsPerPage={PROPOSALS_PER_PAGE}
            onPageChange={handlePageChange}
            onViewProposal={handleViewProposal}
            onEditProposal={handleEditProposal}
            onDeleteProposal={handlePromptDelete}
            onAddProposal={handleOpenAddDrawer}
            canEdit={canModify}
            canDelete={canModify}
          />
        )}
      </div>

      {/* 4. Slide-over Add Proposal Drawer */}
      <AddProposalDrawer
        isOpen={isAddDrawerOpen && canModify}
        onClose={handleCloseAddDrawer}
        onSaveProposal={handleSaveProposal}
        clients={clients}
        existingProposals={proposals}
      />

      {/* 5. Slide-over Proposal Details Drawer */}
      <ProposalDetailsDrawer
        proposal={selectedProposal}
        isOpen={Boolean(selectedProposal)}
        onClose={handleCloseDetails}
        onEdit={handleEditProposal}
        canEdit={canModify}
      />

      {/* 6. Slide-over Edit Proposal Drawer */}
      <EditProposalDrawer
        proposal={editingProposal}
        isOpen={Boolean(editingProposal) && canModify}
        onClose={handleCloseEditDrawer}
        onSave={handleUpdateProposal}
        clients={clients}
      />

      {/* 7. Delete Proposal Confirmation Modal */}
      <DeleteProposalModal
        proposal={deletingProposal}
        isOpen={Boolean(deletingProposal) && canModify}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  )
}

export default Proposals
