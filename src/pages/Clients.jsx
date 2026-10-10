import { useState, useMemo, useEffect, useCallback } from 'react'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import ClientsHeader from '../components/clients/ClientsHeader'
import ClientSummary from '../components/clients/ClientSummary'
import ClientsToolbar from '../components/clients/ClientsToolbar'
import ClientsTable from '../components/clients/ClientsTable'
import AddClientDrawer from '../components/clients/AddClientDrawer'
import ClientDetailsDrawer from '../components/clients/ClientDetailsDrawer'
import EditClientDrawer from '../components/clients/EditClientDrawer'
import DeleteClientModal from '../components/clients/DeleteClientModal'
import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
} from '../services/clientsService'
import { useAuth } from '../context/AuthContext'

const ITEMS_PER_PAGE = 8

function Clients() {
  const { employee } = useAuth()
  const role = employee?.system_role?.toLowerCase() || 'member'
  const canModify = role === 'admin' || role === 'manager'

  const [clients, setClients] = useState([])
  const [summary, setSummary] = useState({
    total: 0,
    active: 0,
    activeProjects: 0,
    pendingPayments: '₹0',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [serviceFilter, setServiceFilter] = useState('All Services')
  const [currentPage, setCurrentPage] = useState(1)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [editingClient, setEditingClient] = useState(null)
  const [deletingClient, setDeletingClient] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)

  // Show auto-dismissing toast notifications
  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type })
    setTimeout(() => {
      setToastMessage(null)
    }, 3500)
  }

  // 1. Load clients and dynamic summary from Supabase
  const loadClients = useCallback(async () => {
    setIsLoading(true)
    setFetchError(null)
    try {
      const { clients: data, summary: liveSummary } = await getClients(employee)
      setClients(data)
      setSummary(liveSummary)
    } catch (err) {
      console.error('Failed to load clients from Supabase:', err)
      setFetchError('Failed to load clients from database. Please try again.')
      showToast('Failed to load clients from Supabase.', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [employee])

  useEffect(() => {
    loadClients()
  }, [loadClients])

  // Real-time multi-criteria filtering
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      // 1. Search Query: client name, company, email, service
      const matchesSearch =
        searchQuery.trim() === '' ||
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.service.toLowerCase().includes(searchQuery.toLowerCase())

      // 2. Status Match
      const matchesStatus =
        statusFilter === 'All Status' || client.status === statusFilter

      // 3. Service Match
      const matchesService =
        serviceFilter === 'All Services' || client.service === serviceFilter

      return matchesSearch && matchesStatus && matchesService
    })
  }, [clients, searchQuery, statusFilter, serviceFilter])

  // Total pages based on filtered results
  const totalPages = Math.max(1, Math.ceil(filteredClients.length / ITEMS_PER_PAGE))

  // Protect against invalid pages
  const activePage = Math.min(currentPage, totalPages)

  // Automatically keep currentPage in sync if items shrink
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  // Paginated slice for current page
  const paginatedClients = useMemo(() => {
    const startIndex = (activePage - 1) * ITEMS_PER_PAGE
    return filteredClients.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredClients, activePage])

  // Filter change handlers with automatic page reset to 1
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

  const handleOpenDrawer = () => {
    setIsDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false)
  }

  // 2. Real CREATE handler
  const handleSaveClient = async (formData) => {
    try {
      const created = await createClient(formData)

      // Prepend newly created client to state
      setClients((prev) => [created, ...prev])
      setSummary((prev) => ({
        ...prev,
        total: prev.total + 1,
        active: created.status === 'Active' ? prev.active + 1 : prev.active,
      }))
      setCurrentPage(1)
      setIsDrawerOpen(false)

      showToast('Client added successfully.', 'success')
    } catch (err) {
      console.error('Create client error:', err)
      showToast(err.message || 'Failed to add client. Please check your connection.', 'error')
      throw err
    }
  }

  const handleSelectClient = (client) => {
    setSelectedClient(client)
  }

  const handleCloseDetailsDrawer = () => {
    setSelectedClient(null)
  }

  const handleEditClient = (client) => {
    setSelectedClient(null) // Seamless transition: close details drawer if open
    setEditingClient(client)
  }

  const handleCloseEditDrawer = () => {
    setEditingClient(null)
  }

  // 3. Real UPDATE handler
  const handleUpdateClient = async (updatedData) => {
    try {
      const updated = await updateClient(updatedData.id, updatedData)

      // Replace updated client in state
      setClients((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      )

      // Recalculate summary metrics if status changed
      setSummary((prev) => {
        const oldClient = clients.find((c) => c.id === updated.id)
        let activeDiff = 0
        if (oldClient?.status === 'Active' && updated.status !== 'Active') activeDiff = -1
        if (oldClient?.status !== 'Active' && updated.status === 'Active') activeDiff = 1
        return {
          ...prev,
          active: prev.active + activeDiff,
        }
      })

      if (selectedClient?.id === updated.id) {
        setSelectedClient(updated)
      }
      setEditingClient(null)

      showToast('Client updated successfully.', 'success')
    } catch (err) {
      console.error('Update client error:', err)
      showToast(err.message || 'Failed to update client.', 'error')
      throw err
    }
  }

  const handlePromptDelete = (client) => {
    setDeletingClient(client)
  }

  const handleCloseDeleteModal = () => {
    setDeletingClient(null)
  }

  // 4. Real DELETE handler (with FK 23503 graceful feedback)
  const handleConfirmDelete = async (clientId) => {
    try {
      await deleteClient(clientId)

      const deletedClient = clients.find((c) => c.id === clientId)

      // Remove client safely from state
      setClients((prev) => prev.filter((client) => client.id !== clientId))
      setSummary((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
        active: deletedClient?.status === 'Active' ? Math.max(0, prev.active - 1) : prev.active,
      }))

      // Drawer safety: close view or edit drawers if this client was currently open
      if (selectedClient && selectedClient.id === clientId) {
        setSelectedClient(null)
      }
      if (editingClient && editingClient.id === clientId) {
        setEditingClient(null)
      }

      setDeletingClient(null)
      showToast('Client deleted successfully.', 'success')
    } catch (err) {
      console.error('Delete client error:', err)
      showToast(err.message || 'Failed to delete client from database.', 'error')
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

      {/* 1. Header with Breadcrumbs, Title & Add Client Button */}
      <ClientsHeader onAddClient={handleOpenDrawer} canAdd={canModify} />

      {/* 2. Compact Dynamic Metric Summary Row (Total, Active, Projects, Payments) */}
      <ClientSummary summary={summary} />

      {/* 3. Main Workspace Card (Toolbar + Table / Loading / Empty / Error) */}
      <div className="rounded-xl border border-odw-border bg-white shadow-2xs overflow-hidden">
        <ClientsToolbar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          statusFilter={statusFilter}
          onStatusChange={handleStatusChange}
          serviceFilter={serviceFilter}
          onServiceChange={handleServiceChange}
          totalCount={filteredClients.length}
        />

        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-odw-primary" />
            <p className="text-xs font-medium text-odw-text-muted">
              Loading clients from Supabase...
            </p>
          </div>
        ) : fetchError ? (
          <div className="p-10 flex flex-col items-center justify-center gap-2 text-center bg-rose-50/50">
            <AlertCircle className="h-6 w-6 text-rose-500" />
            <p className="text-xs font-semibold text-rose-800">{fetchError}</p>
            <button
              onClick={loadClients}
              className="mt-2 text-xs font-medium text-odw-primary hover:underline cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : (
          <ClientsTable
            clients={paginatedClients}
            totalLifetimeCount={summary.total}
            currentPage={activePage}
            totalPages={totalPages}
            totalFilteredCount={filteredClients.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={handlePageChange}
            onSelectClient={handleSelectClient}
            onEditClient={handleEditClient}
            onDeleteClient={handlePromptDelete}
            canEdit={canModify}
            canDelete={canModify}
          />
        )}
      </div>

      {/* 4. Slide-over Add Client Drawer */}
      <AddClientDrawer
        isOpen={isDrawerOpen && canModify}
        onClose={handleCloseDrawer}
        onSaveClient={handleSaveClient}
      />

      {/* 5. Slide-over Client Details Drawer */}
      <ClientDetailsDrawer
        client={selectedClient}
        isOpen={Boolean(selectedClient)}
        onClose={handleCloseDetailsDrawer}
        onEdit={handleEditClient}
        canEdit={canModify}
      />

      {/* 6. Slide-over Edit Client Drawer */}
      <EditClientDrawer
        client={editingClient}
        isOpen={Boolean(editingClient)}
        onClose={handleCloseEditDrawer}
        onSave={handleUpdateClient}
      />

      {/* 7. Delete Client Confirmation Modal */}
      <DeleteClientModal
        client={deletingClient}
        isOpen={Boolean(deletingClient)}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}

export default Clients
