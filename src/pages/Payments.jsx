import { useState, useMemo, useEffect, useCallback } from 'react'
import { Navigate } from 'react-router-dom'
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import PaymentsHeader from '../components/payments/PaymentsHeader'
import PaymentSummary from '../components/payments/PaymentSummary'
import PaymentsToolbar from '../components/payments/PaymentsToolbar'
import PaymentsTable from '../components/payments/PaymentsTable'
import AddPaymentDrawer from '../components/payments/AddPaymentDrawer'
import PaymentDetailsDrawer from '../components/payments/PaymentDetailsDrawer'
import EditPaymentDrawer from '../components/payments/EditPaymentDrawer'
import DeletePaymentModal from '../components/payments/DeletePaymentModal'
import {
  getPayments,
  getPaymentFormData,
  createPayment,
  updatePayment,
  deletePayment,
} from '../services/paymentsService'
import { useAuth } from '../context/AuthContext'

const PAYMENTS_PER_PAGE = 8

function Payments() {
  const { employee } = useAuth()
  const role = employee?.system_role?.toLowerCase() || 'member'

  // If Member navigates directly, redirect to dashboard
  if (role === 'member') {
    return <Navigate to="/dashboard" replace />
  }

  const canDelete = role === 'admin'

  const [payments, setPayments] = useState([])
  const [clients, setClients] = useState([])
  const [projects, setProjects] = useState([])
  const [proposals, setProposals] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [methodFilter, setMethodFilter] = useState('All Methods')
  const [currentPage, setCurrentPage] = useState(1)

  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [editingPayment, setEditingPayment] = useState(null)
  const [deletingPayment, setDeletingPayment] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)

  // Fetch live payments and form lookups from Supabase
  const loadData = useCallback(async () => {
    setIsLoading(true)
    setFetchError(null)
    try {
      const [paymentsData, formData] = await Promise.all([
        getPayments(),
        getPaymentFormData(),
      ])
      setPayments(Array.isArray(paymentsData) ? paymentsData : (paymentsData?.payments || []))
      setClients(formData.clients || [])
      setProjects(formData.projects || [])
      setProposals(formData.proposals || [])
    } catch (err) {
      console.error('Failed to load payments data:', err)
      setFetchError(err?.message || 'Failed to load payments. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Real-time client-side filtering: search + status + payment method
  const filteredPayments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()

    return payments.filter((payment) => {
      // 1. Search matches: paymentNumber, clientName, company, proposalNumber, projectName, reference
      const matchesSearch =
        !q ||
        payment.paymentNumber.toLowerCase().includes(q) ||
        payment.clientName.toLowerCase().includes(q) ||
        payment.company.toLowerCase().includes(q) ||
        (payment.proposalNumber && payment.proposalNumber.toLowerCase().includes(q)) ||
        (payment.projectName && payment.projectName.toLowerCase().includes(q)) ||
        (payment.reference && payment.reference.toLowerCase().includes(q))

      // 2. Status match
      const matchesStatus =
        statusFilter === 'All Status' || payment.status === statusFilter

      // 3. Payment Method match
      const matchesMethod =
        methodFilter === 'All Methods' || payment.paymentMethod === methodFilter

      return matchesSearch && matchesStatus && matchesMethod
    })
  }, [payments, searchQuery, statusFilter, methodFilter])

  // Pagination calculation
  const totalFilteredCount = filteredPayments.length
  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / PAYMENTS_PER_PAGE))
  const activePage = Math.min(currentPage, totalPages)

  // Page clamping: if deleting or filtering items shrinks the list, move to last valid page
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  // Paginated slice for current page
  const paginatedPayments = useMemo(() => {
    const startIndex = (activePage - 1) * PAYMENTS_PER_PAGE
    return filteredPayments.slice(startIndex, startIndex + PAYMENTS_PER_PAGE)
  }, [filteredPayments, activePage])

  // Filter change handlers resetting page to 1
  const handleSearchChange = (query) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handleStatusChange = (status) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  const handleMethodChange = (method) => {
    setMethodFilter(method)
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // Toast notification helper
  const showToast = (message) => {
    setToastMessage(message)
    setTimeout(() => {
      setToastMessage(null)
    }, 3500)
  }

  // CRUD Handlers
  const handleOpenAddDrawer = () => {
    setIsAddDrawerOpen(true)
  }

  const handleCloseAddDrawer = () => {
    setIsAddDrawerOpen(false)
  }

  const handleSavePayment = async (newPaymentData) => {
    try {
      const created = await createPayment(newPaymentData)
      setPayments((prev) => [created, ...prev])
      setIsAddDrawerOpen(false)
      setCurrentPage(1)
      showToast('Payment recorded successfully.')
    } catch (err) {
      console.error('Create payment error:', err)
      showToast(err.message || 'Failed to record payment.')
      throw err
    }
  }

  const handleViewPayment = (payment) => {
    setSelectedPayment(payment)
  }

  const handleCloseDetails = () => {
    setSelectedPayment(null)
  }

  const handleEditPayment = (payment) => {
    setSelectedPayment(null) // Seamless transition: close details drawer if open
    setEditingPayment(payment)
  }

  const handleCloseEditDrawer = () => {
    setEditingPayment(null)
  }

  const handleUpdatePayment = async (updatedPaymentData) => {
    try {
      const updated = await updatePayment(updatedPaymentData.id, updatedPaymentData)
      setPayments((prev) =>
        prev.map((payment) =>
          payment.id === updated.id ? updated : payment
        )
      )
      if (selectedPayment?.id === updated.id) {
        setSelectedPayment(updated)
      }
      setEditingPayment(null)
      showToast('Payment updated successfully.')
    } catch (err) {
      console.error('Update payment error:', err)
      showToast(err.message || 'Failed to update payment.')
      throw err
    }
  }

  const handlePromptDelete = (payment) => {
    if (!canDelete) return
    setDeletingPayment(payment)
  }

  const handleCloseDeleteModal = () => {
    if (!isDeleting) {
      setDeletingPayment(null)
    }
  }

  const handleConfirmDelete = async (paymentId) => {
    setIsDeleting(true)
    try {
      await deletePayment(paymentId)
      setPayments((prev) => prev.filter((p) => p.id !== paymentId))

      // Close drawers if this payment was active
      if (selectedPayment?.id === paymentId) setSelectedPayment(null)
      if (editingPayment?.id === paymentId) setEditingPayment(null)

      setDeletingPayment(null)
      showToast('Payment deleted successfully.')
    } catch (err) {
      console.error('Delete payment error:', err)
      showToast(err.message || 'Failed to delete payment.')
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

      {/* 1. Header with Breadcrumbs, Title & Record Payment Action */}
      <PaymentsHeader onAddPayment={handleOpenAddDrawer} />

      {/* 2. Compact Dynamic Metric Summary Row (Total Received, Pending, Partial, Refunded) */}
      <PaymentSummary payments={payments} />

      {/* 3. Main Workspace Card (Toolbar + Table + Pagination) */}
      <div className="rounded-xl border border-odw-border bg-white shadow-2xs overflow-hidden">
        <PaymentsToolbar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          statusFilter={statusFilter}
          onStatusChange={handleStatusChange}
          methodFilter={methodFilter}
          onMethodChange={handleMethodChange}
          totalCount={totalFilteredCount}
        />

        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-odw-primary" />
            <p className="text-xs font-medium text-odw-text-muted">
              Loading payments from Supabase...
            </p>
          </div>
        ) : fetchError ? (
          <div className="p-10 flex flex-col items-center justify-center gap-2 text-center bg-rose-50/50">
            <AlertCircle className="h-6 w-6 text-rose-500" />
            <p className="text-xs font-semibold text-rose-800">{fetchError}</p>
            <button
              onClick={loadData}
              className="mt-2 text-xs font-medium text-odw-primary hover:underline cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : (
          <PaymentsTable
            payments={paginatedPayments}
            totalLifetimeCount={payments.length}
            currentPage={activePage}
            totalPages={totalPages}
            totalFilteredCount={totalFilteredCount}
            itemsPerPage={PAYMENTS_PER_PAGE}
            onPageChange={handlePageChange}
            onViewPayment={handleViewPayment}
            onEditPayment={handleEditPayment}
            onDeletePayment={handlePromptDelete}
            onAddPayment={handleOpenAddDrawer}
            canDelete={canDelete}
          />
        )}
      </div>

      {/* 4. Slide-over Add Payment Drawer */}
      <AddPaymentDrawer
        isOpen={isAddDrawerOpen}
        onClose={handleCloseAddDrawer}
        onSavePayment={handleSavePayment}
        existingPayments={payments}
        clients={clients}
        projects={projects}
        proposals={proposals}
      />

      {/* 5. Slide-over Payment Details Drawer */}
      <PaymentDetailsDrawer
        payment={selectedPayment}
        isOpen={Boolean(selectedPayment)}
        onClose={handleCloseDetails}
        onEdit={handleEditPayment}
      />

      {/* 6. Slide-over Edit Payment Drawer */}
      <EditPaymentDrawer
        payment={editingPayment}
        isOpen={Boolean(editingPayment)}
        onClose={handleCloseEditDrawer}
        onSave={handleUpdatePayment}
        clients={clients}
        projects={projects}
        proposals={proposals}
      />

      {/* 7. Delete Payment Confirmation Modal */}
      <DeletePaymentModal
        payment={deletingPayment}
        isOpen={Boolean(deletingPayment)}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  )
}

export default Payments
