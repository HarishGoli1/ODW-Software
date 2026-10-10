import { useState, useEffect, useRef, useMemo } from 'react'
import { X, Loader2, CreditCard, AlertCircle } from 'lucide-react'
import {
  FORM_PAYMENT_STATUSES,
  FORM_PAYMENT_METHODS,
} from '../../data/payments'

function AddPaymentDrawer({
  isOpen,
  onClose,
  onSavePayment,
  clients = [],
  projects = [],
  proposals = [],
  existingPayments = [],
}) {
  const todayStr = new Date().toISOString().split('T')[0]

  const [formData, setFormData] = useState({
    clientId: '',
    projectId: '',
    proposalId: '',
    amount: '',
    paymentDate: todayStr,
    paymentMethod: FORM_PAYMENT_METHODS[0] || 'Bank Transfer',
    status: 'Received',
    reference: '',
    notes: '',
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const clientRef = useRef(null)
  const amountRef = useRef(null)
  const dateRef = useRef(null)
  const methodRef = useRef(null)
  const statusRef = useRef(null)

  // Reset form on open/close
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        clientId: '',
        projectId: '',
        proposalId: '',
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: FORM_PAYMENT_METHODS[0] || 'Bank Transfer',
        status: 'Received',
        reference: '',
        notes: '',
      })
      setErrors({})
      setIsSubmitting(false)
    }
  }, [isOpen])

  // ESC key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Compute available projects and proposals filtered by selected client
  const selectedClient = useMemo(() => {
    return clients.find((c) => c.id === formData.clientId)
  }, [clients, formData.clientId])

  const availableProjects = useMemo(() => {
    if (!formData.clientId) return projects
    return projects.filter(
      (p) => p.clientId === formData.clientId || p.client_id === formData.clientId
    )
  }, [projects, formData.clientId])

  const availableProposals = useMemo(() => {
    if (!formData.clientId) return proposals
    return proposals.filter(
      (p) => p.clientId === formData.clientId || p.client_id === formData.clientId
    )
  }, [proposals, formData.clientId])

  if (!isOpen) return null

  // Generate next payment number: PAY-XXX
  const generatePaymentNumber = () => {
    let maxNum = 0
    existingPayments.forEach((p) => {
      if (p.paymentNumber) {
        const match = p.paymentNumber.match(/\d+/)
        if (match) {
          const num = parseInt(match[0], 10)
          if (num > maxNum) maxNum = num
        }
      }
    })
    const nextNum = maxNum + 1
    return `PAY-${String(nextNum).padStart(3, '0')}`
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.clientId) {
      newErrors.clientId = 'Please select a client.'
    }

    const numAmount = Number(formData.amount)
    if (!formData.amount || String(formData.amount).trim() === '') {
      newErrors.amount = 'Amount is required.'
    } else if (isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Amount must be a numeric value greater than 0.'
    }

    if (!formData.paymentDate) {
      newErrors.paymentDate = 'Payment date is required.'
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required.'
    }

    if (!formData.status) {
      newErrors.status = 'Payment status is required.'
    }

    setErrors(newErrors)

    // Focus the first invalid field
    if (newErrors.clientId && clientRef.current) {
      clientRef.current.focus()
    } else if (newErrors.amount && amountRef.current) {
      amountRef.current.focus()
    } else if (newErrors.paymentDate && dateRef.current) {
      dateRef.current.focus()
    } else if (newErrors.paymentMethod && methodRef.current) {
      methodRef.current.focus()
    } else if (newErrors.status && statusRef.current) {
      statusRef.current.focus()
    }

    return Object.keys(newErrors).length === 0
  }

  const handleClientChange = (newClientId) => {
    setFormData((prev) => ({
      ...prev,
      clientId: newClientId,
      projectId: '', // Reset dependent project
      proposalId: '', // Reset dependent proposal
    }))
    if (errors.clientId) {
      setErrors((prev) => ({ ...prev, clientId: undefined }))
    }
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)

    try {
      const selectedProj = projects.find((p) => p.id === formData.projectId)
      const selectedProp = proposals.find((p) => p.id === formData.proposalId)
      const paymentNumber = generatePaymentNumber()

      const newPayment = {
        paymentNumber,
        clientId: formData.clientId,
        clientName: selectedClient ? selectedClient.name : 'Unknown Client',
        company: selectedClient ? (selectedClient.company || selectedClient.name) : 'Unknown Company',
        projectId: formData.projectId || null,
        projectName: selectedProj ? (selectedProj.projectName || selectedProj.project_name || selectedProj.name) : '',
        proposalId: formData.proposalId || null,
        proposalNumber: selectedProp ? (selectedProp.proposalNumber || selectedProp.proposal_number) : '',
        amount: Number(formData.amount),
        paymentDate: formData.paymentDate,
        paymentMethod: formData.paymentMethod,
        status: formData.status,
        reference: formData.reference.trim(),
        notes: formData.notes.trim(),
      }

      await onSavePayment(newPayment)
      onClose()
    } catch (err) {
      console.error('Failed to save payment:', err)
      setErrors((prev) => ({
        ...prev,
        submit: err.message || 'Failed to record payment.',
      }))
    } finally {
      setIsSubmitting(false)
    }
  }

  const paymentNumberPreview = generatePaymentNumber()

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-payment-drawer-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <aside
          className="w-screen max-w-full sm:max-w-[480px] bg-white shadow-2xl border-l border-odw-border flex flex-col justify-between"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-odw-border p-5 shrink-0 bg-white">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-odw-primary border border-orange-200/60 shrink-0 mt-0.5">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2
                    id="add-payment-drawer-title"
                    className="text-base sm:text-lg font-bold text-odw-text truncate"
                  >
                    Record Payment
                  </h2>
                  <p className="text-xs text-odw-text-muted mt-0.5">
                    Log an incoming or scheduled client transaction.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                aria-label="Close drawer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Form Body */}
          <form
            id="add-payment-form"
            onSubmit={handleSubmit}
            noValidate
            className="flex-1 overflow-y-auto p-5 space-y-4 text-xs"
          >
            {/* Submit Error Banner */}
            {errors.submit && (
              <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 flex items-start gap-2 text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="text-xs">{errors.submit}</p>
              </div>
            )}

            {/* Auto-generated Details Preview */}
            <div className="rounded-xl bg-slate-50 border border-slate-200/70 p-3 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-odw-text-muted block">
                  Payment Number
                </span>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  {paymentNumberPreview}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold tracking-wider text-odw-text-muted block">
                  Recorded Date
                </span>
                <span className="font-medium text-slate-700">
                  {todayStr}
                </span>
              </div>
            </div>

            {/* 1. Client Selector */}
            <div className="space-y-1">
              <label
                htmlFor="payment-client"
                className="block font-semibold text-slate-700"
              >
                Client <span className="text-rose-500">*</span>
              </label>
              <select
                ref={clientRef}
                id="payment-client"
                value={formData.clientId}
                onChange={(e) => handleClientChange(e.target.value)}
                className={`w-full rounded-lg border bg-white px-3 py-2 text-xs text-odw-text focus:outline-none focus:ring-1 transition-colors cursor-pointer ${
                  errors.clientId
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500 bg-rose-50/20'
                    : 'border-odw-border focus:border-odw-primary focus:ring-odw-primary'
                }`}
              >
                <option value="">Select a client...</option>
                {clients.length === 0 ? (
                  <option value="" disabled>
                    No clients found — add a client first
                  </option>
                ) : (
                  clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company ? `${c.company} — ${c.name}` : c.name}
                    </option>
                  ))
                )}
              </select>
              {errors.clientId && (
                <p className="text-[11px] text-rose-600 font-medium mt-1">
                  {errors.clientId}
                </p>
              )}
            </div>

            {/* 2. Project Selector (Optional) */}
            <div className="space-y-1">
              <label
                htmlFor="payment-project"
                className="block font-semibold text-slate-700"
              >
                Associated Project <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <select
                id="payment-project"
                value={formData.projectId}
                onChange={(e) => handleChange('projectId', e.target.value)}
                className="w-full rounded-lg border border-odw-border bg-white px-3 py-2 text-xs text-odw-text focus:border-odw-primary focus:outline-none focus:ring-1 focus:ring-odw-primary transition-colors cursor-pointer"
              >
                <option value="">No Project</option>
                {availableProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.projectName || p.project_name || p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Proposal Selector (Optional) */}
            <div className="space-y-1">
              <label
                htmlFor="payment-proposal"
                className="block font-semibold text-slate-700"
              >
                Associated Proposal <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <select
                id="payment-proposal"
                value={formData.proposalId}
                onChange={(e) => handleChange('proposalId', e.target.value)}
                className="w-full rounded-lg border border-odw-border bg-white px-3 py-2 text-xs text-odw-text focus:border-odw-primary focus:outline-none focus:ring-1 focus:ring-odw-primary transition-colors cursor-pointer"
              >
                <option value="">No Proposal</option>
                {availableProposals.map((pr) => (
                  <option key={pr.id} value={pr.id}>
                    {pr.proposalNumber || pr.proposal_number} — {pr.title}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Amount (INR) */}
            <div className="space-y-1">
              <label
                htmlFor="payment-amount"
                className="block font-semibold text-slate-700"
              >
                Amount (INR ₹) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-semibold pointer-events-none">
                  ₹
                </span>
                <input
                  ref={amountRef}
                  id="payment-amount"
                  type="number"
                  min="1"
                  step="1"
                  value={formData.amount}
                  onChange={(e) => handleChange('amount', e.target.value)}
                  placeholder="e.g. 25000"
                  className={`w-full rounded-lg border bg-white pl-7 pr-3 py-2 text-xs text-odw-text placeholder:text-slate-400 focus:outline-none focus:ring-1 transition-colors ${
                    errors.amount
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500 bg-rose-50/20'
                      : 'border-odw-border focus:border-odw-primary focus:ring-odw-primary'
                  }`}
                />
              </div>
              {errors.amount && (
                <p className="text-[11px] text-rose-600 font-medium mt-1">
                  {errors.amount}
                </p>
              )}
            </div>

            {/* 5. Payment Date & Method */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label
                  htmlFor="payment-date"
                  className="block font-semibold text-slate-700"
                >
                  Payment Date <span className="text-rose-500">*</span>
                </label>
                <input
                  ref={dateRef}
                  id="payment-date"
                  type="date"
                  value={formData.paymentDate}
                  onChange={(e) => handleChange('paymentDate', e.target.value)}
                  className={`w-full rounded-lg border bg-white px-3 py-2 text-xs text-odw-text focus:outline-none focus:ring-1 transition-colors ${
                    errors.paymentDate
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500 bg-rose-50/20'
                      : 'border-odw-border focus:border-odw-primary focus:ring-odw-primary'
                  }`}
                />
                {errors.paymentDate && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1">
                    {errors.paymentDate}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="payment-method"
                  className="block font-semibold text-slate-700"
                >
                  Method <span className="text-rose-500">*</span>
                </label>
                <select
                  ref={methodRef}
                  id="payment-method"
                  value={formData.paymentMethod}
                  onChange={(e) => handleChange('paymentMethod', e.target.value)}
                  className={`w-full rounded-lg border bg-white px-3 py-2 text-xs text-odw-text focus:outline-none focus:ring-1 transition-colors cursor-pointer ${
                    errors.paymentMethod
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500 bg-rose-50/20'
                      : 'border-odw-border focus:border-odw-primary focus:ring-odw-primary'
                  }`}
                >
                  {FORM_PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                {errors.paymentMethod && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1">
                    {errors.paymentMethod}
                  </p>
                )}
              </div>
            </div>

            {/* 6. Status & Reference */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label
                  htmlFor="payment-status"
                  className="block font-semibold text-slate-700"
                >
                  Status <span className="text-rose-500">*</span>
                </label>
                <select
                  ref={statusRef}
                  id="payment-status"
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className={`w-full rounded-lg border bg-white px-3 py-2 text-xs text-odw-text focus:outline-none focus:ring-1 transition-colors cursor-pointer ${
                    errors.status
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500 bg-rose-50/20'
                      : 'border-odw-border focus:border-odw-primary focus:ring-odw-primary'
                  }`}
                >
                  {FORM_PAYMENT_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
                {errors.status && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1">
                    {errors.status}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="payment-reference"
                  className="block font-semibold text-slate-700"
                >
                  Reference / UTR <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  id="payment-reference"
                  type="text"
                  value={formData.reference}
                  onChange={(e) => handleChange('reference', e.target.value)}
                  placeholder="e.g. UTR123456789"
                  className="w-full rounded-lg border border-odw-border bg-white px-3 py-2 text-xs text-odw-text placeholder:text-slate-400 focus:border-odw-primary focus:outline-none focus:ring-1 focus:ring-odw-primary transition-colors"
                />
              </div>
            </div>

            {/* 7. Notes */}
            <div className="space-y-1">
              <label
                htmlFor="payment-notes"
                className="block font-semibold text-slate-700"
              >
                Notes <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                id="payment-notes"
                rows="3"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Installment details, clearance comments, or scope notes..."
                className="w-full rounded-lg border border-odw-border bg-white px-3 py-2 text-xs text-odw-text placeholder:text-slate-400 focus:border-odw-primary focus:outline-none focus:ring-1 focus:ring-odw-primary transition-colors resize-none"
              />
            </div>
          </form>

          {/* Footer Actions */}
          <div className="border-t border-odw-border p-4 bg-slate-50/70 shrink-0 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-odw-border bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="add-payment-form"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-odw-primary px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-odw-primary-hover transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Save Payment</span>
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default AddPaymentDrawer
