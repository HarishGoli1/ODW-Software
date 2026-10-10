import { useState, useMemo, useEffect } from 'react'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import LeadsHeader from '../components/leads/LeadsHeader'
import LeadSummary from '../components/leads/LeadSummary'
import LeadsToolbar from '../components/leads/LeadsToolbar'
import LeadsTable from '../components/leads/LeadsTable'
import AddLeadDrawer from '../components/leads/AddLeadDrawer'
import LeadDetailsDrawer from '../components/leads/LeadDetailsDrawer'
import EditLeadDrawer from '../components/leads/EditLeadDrawer'
import DeleteLeadModal from '../components/leads/DeleteLeadModal'
import { getLeads, createLead, updateLead, deleteLead } from '../services/leadsService'
import { useAuth } from '../context/AuthContext'

const ITEMS_PER_PAGE = 8

function Leads() {
  const { employee } = useAuth()
  const role = employee?.system_role?.toLowerCase() || 'member'
  const canModify = role === 'admin' || role === 'manager'

  const [leads, setLeads] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [sourceFilter, setSourceFilter] = useState('All Sources')
  const [currentPage, setCurrentPage] = useState(1)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState(null)
  const [editingLead, setEditingLead] = useState(null)
  const [deletingLead, setDeletingLead] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)

  // Show auto-dismissing toast notifications
  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type })
    setTimeout(() => {
      setToastMessage(null)
    }, 3500)
  }

  // 1. Real READ on component mount
  useEffect(() => {
    let isMounted = true

    const loadLeads = async () => {
      setIsLoading(true)
      setFetchError(null)
      try {
        const data = await getLeads()
        if (isMounted) {
          setLeads(data)
        }
      } catch (err) {
        console.error('Failed to load leads from Supabase:', err)
        if (isMounted) {
          setFetchError('Failed to load leads from database. Please try again.')
          showToast('Failed to load leads from Supabase.', 'error')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadLeads()

    return () => {
      isMounted = false
    }
  }, [])

  // 2. Dynamic Metric Summary derived from actual database records
  const dynamicSummary = useMemo(() => {
    return {
      total: leads.length,
      newLeads: leads.filter((l) => l.status === 'New').length,
      qualified: leads.filter((l) => l.status === 'Qualified').length,
      converted: leads.filter((l) => l.status === 'Converted').length,
    }
  }, [leads])

  // Filter leads based on active search, status, and source criteria
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Search Query Match (Name, Company, Email, Service)
      const matchesSearch =
        searchQuery.trim() === '' ||
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.service.toLowerCase().includes(searchQuery.toLowerCase())

      // Status Match
      const matchesStatus =
        statusFilter === 'All Status' || lead.status === statusFilter

      // Source Match
      const matchesSource =
        sourceFilter === 'All Sources' || lead.source === sourceFilter

      return matchesSearch && matchesStatus && matchesSource
    })
  }, [leads, searchQuery, statusFilter, sourceFilter])

  // Total pages based on filtered results
  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / ITEMS_PER_PAGE))

  // Ensure currentPage remains valid if items change
  const activePage = Math.min(currentPage, totalPages)

  // Paginated slice for current page
  const paginatedLeads = useMemo(() => {
    const startIndex = (activePage - 1) * ITEMS_PER_PAGE
    return filteredLeads.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredLeads, activePage])

  // Handlers for search/filter changes with automatic page reset to 1
  const handleSearchChange = (query) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handleStatusChange = (status) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  const handleSourceChange = (source) => {
    setSourceFilter(source)
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleOpenDrawer = () => {
    if (!canModify) return
    setIsDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false)
  }

  const handleViewLead = (lead) => {
    setSelectedLead(lead)
  }

  const handleCloseDetailsDrawer = () => {
    setSelectedLead(null)
  }

  const handleEditLead = (lead) => {
    if (!canModify) return
    setSelectedLead(null) // Close details drawer if open
    setEditingLead(lead)
  }

  const handleCloseEditDrawer = () => {
    setEditingLead(null)
  }

  const handlePromptDelete = (lead) => {
    if (!canModify) return
    setDeletingLead(lead)
  }

  const handleCloseDeleteModal = () => {
    setDeletingLead(null)
  }

  // 3. Real DELETE handler
  const handleConfirmDelete = async (leadId) => {
    try {
      await deleteLead(leadId)

      // Remove deleted lead from local state
      setLeads((prev) => prev.filter((lead) => lead.id !== leadId))

      if (selectedLead?.id === leadId) setSelectedLead(null)
      if (editingLead?.id === leadId) setEditingLead(null)
      setDeletingLead(null)

      showToast('Lead deleted successfully.', 'success')
    } catch (err) {
      console.error('Delete lead error:', err)
      showToast(err.message || 'Failed to delete lead from database.', 'error')
    }
  }

  // 4. Real CREATE handler
  const handleSaveLead = async (formData) => {
    try {
      const created = await createLead(formData)

      // Prepend newly persisted row to state
      setLeads((prev) => [created, ...prev])
      setCurrentPage(1)
      setIsDrawerOpen(false)

      showToast('Lead added successfully.', 'success')
    } catch (err) {
      console.error('Create lead error:', err)
      showToast(err.message || 'Failed to add lead. Please check your connection.', 'error')
      throw err // Allow drawer to keep form data intact
    }
  }

  // 5. Real UPDATE handler
  const handleUpdateLead = async (updatedData) => {
    try {
      const updated = await updateLead(updatedData.id, updatedData)

      // Replace updated record in state
      setLeads((prev) =>
        prev.map((lead) => (lead.id === updated.id ? updated : lead))
      )

      if (selectedLead?.id === updated.id) {
        setSelectedLead(updated)
      }
      setEditingLead(null)

      showToast('Lead updated successfully.', 'success')
    } catch (err) {
      console.error('Update lead error:', err)
      showToast(err.message || 'Failed to update lead.', 'error')
      throw err
    }
  }

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-medium text-white shadow-lg animate-in fade-in slide-in-from-top-2 duration-200 ${
            toastMessage.type === 'error'
              ? 'bg-rose-900 border border-rose-700'
              : 'bg-slate-900'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* 1. Header with Breadcrumbs, Title & Add Lead Button */}
      <LeadsHeader onAddLead={handleOpenDrawer} canAdd={canModify} />

      {/* 2. Compact Dynamic Metric Summary Row */}
      <LeadSummary summary={dynamicSummary} />

      {/* 3. Main Workspace Card (Toolbar + Table / Loading / Empty / Error) */}
      <div className="rounded-xl border border-odw-border bg-white shadow-2xs overflow-hidden">
        <LeadsToolbar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          statusFilter={statusFilter}
          onStatusChange={handleStatusChange}
          sourceFilter={sourceFilter}
          onSourceChange={handleSourceChange}
          totalCount={filteredLeads.length}
        />

        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-odw-primary" />
            <p className="text-xs font-medium text-odw-text-muted">
              Loading leads from Supabase...
            </p>
          </div>
        ) : fetchError ? (
          <div className="p-10 flex flex-col items-center justify-center gap-2 text-center bg-rose-50/50">
            <AlertCircle className="h-6 w-6 text-rose-500" />
            <p className="text-xs font-semibold text-rose-800">{fetchError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-xs font-medium text-odw-primary hover:underline cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : (
          <LeadsTable
            leads={paginatedLeads}
            totalLifetimeCount={dynamicSummary.total}
            currentPage={activePage}
            totalPages={totalPages}
            totalFilteredCount={filteredLeads.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={handlePageChange}
            onSelectLead={handleViewLead}
            onEditLead={handleEditLead}
            onDeleteLead={handlePromptDelete}
            canEdit={canModify}
            canDelete={canModify}
          />
        )}
      </div>

      {/* 4. Slide-over Add Lead Drawer */}
      <AddLeadDrawer
        isOpen={isDrawerOpen && canModify}
        onClose={handleCloseDrawer}
        onSaveLead={handleSaveLead}
      />

      {/* 5. Slide-over Lead Details Drawer */}
      <LeadDetailsDrawer
        lead={selectedLead}
        isOpen={Boolean(selectedLead)}
        onClose={handleCloseDetailsDrawer}
        onEdit={handleEditLead}
        canEdit={canModify}
      />

      {/* 6. Slide-over Edit Lead Drawer */}
      <EditLeadDrawer
        lead={editingLead}
        isOpen={Boolean(editingLead) && canModify}
        onClose={handleCloseEditDrawer}
        onSave={handleUpdateLead}
      />

      {/* 7. Centered Delete Confirmation Modal */}
      <DeleteLeadModal
        lead={deletingLead}
        isOpen={Boolean(deletingLead) && canModify}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}

export default Leads
