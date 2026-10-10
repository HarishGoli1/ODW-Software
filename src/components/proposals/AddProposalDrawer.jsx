import { useState, useEffect, useRef } from 'react'
import { X, Loader2, FileText, AlertCircle } from 'lucide-react'
import {
  FORM_PROPOSAL_STATUSES,
  FORM_PROPOSAL_SERVICES,
} from '../../data/proposals'

function AddProposalDrawer({ isOpen, onClose, onSaveProposal, clients = [], existingProposals = [] }) {
  const todayStr = new Date().toISOString().split('T')[0]

  // Default next 14 days for validity
  const defaultValidDate = () => {
    const d = new Date()
    d.setDate(d.getDate() + 14)
    return d.toISOString().split('T')[0]
  }

  const [formData, setFormData] = useState({
    title: '',
    clientId: '',
    service: FORM_PROPOSAL_SERVICES[0] || 'Business Website',
    amount: '',
    status: 'Draft',
    validUntil: defaultValidDate(),
    description: '',
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Field refs for auto-focusing on first invalid field
  const titleRef = useRef(null)
  const clientRef = useRef(null)
  const serviceRef = useRef(null)
  const amountRef = useRef(null)
  const statusRef = useRef(null)
  const validUntilRef = useRef(null)

  // Reset form on open/close
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: '',
        clientId: '',
        service: FORM_PROPOSAL_SERVICES[0] || 'Business Website',
        amount: '',
        status: 'Draft',
        validUntil: defaultValidDate(),
        description: '',
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

  if (!isOpen) return null

  // Generate next proposal number: PROP-XXX
  const generateProposalNumber = () => {
    let maxNum = 0
    existingProposals.forEach((p) => {
      if (p.proposalNumber) {
        const match = p.proposalNumber.match(/\d+/)
        if (match) {
          const num = parseInt(match[0], 10)
          if (num > maxNum) maxNum = num
        }
      }
    })
    const nextNum = maxNum + 1
    return `PROP-${String(nextNum).padStart(3, '0')}`
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Proposal title is required.'
    }

    if (!formData.clientId) {
      newErrors.clientId = 'Please select a client.'
    }

    if (!formData.service) {
      newErrors.service = 'Service is required.'
    }

    const numAmount = Number(formData.amount)
    if (!formData.amount || String(formData.amount).trim() === '') {
      newErrors.amount = 'Amount is required.'
    } else if (isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Amount must be a numeric value greater than 0.'
    }

    if (!formData.status) {
      newErrors.status = 'Status is required.'
    }

    if (!formData.validUntil) {
      newErrors.validUntil = 'Valid until date is required.'
    }

    setErrors(newErrors)

    // Focus the first invalid field
    if (newErrors.title && titleRef.current) {
      titleRef.current.focus()
    } else if (newErrors.clientId && clientRef.current) {
      clientRef.current.focus()
    } else if (newErrors.service && serviceRef.current) {
      serviceRef.current.focus()
    } else if (newErrors.amount && amountRef.current) {
      amountRef.current.focus()
    } else if (newErrors.status && statusRef.current) {
      statusRef.current.focus()
    } else if (newErrors.validUntil && validUntilRef.current) {
      validUntilRef.current.focus()
    }

    return Object.keys(newErrors).length === 0
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
      const selectedClient = clients.find((c) => c.id === formData.clientId)
      const proposalNumber = generateProposalNumber()

      const newProposal = {
        proposalNumber,
        clientId: formData.clientId,
        clientName: selectedClient ? selectedClient.name : 'Unknown Client',
        company: selectedClient ? (selectedClient.company || selectedClient.name) : 'Unknown Company',
        title: formData.title.trim(),
        service: formData.service,
        amount: Number(formData.amount),
        status: formData.status,
        validUntil: formData.validUntil,
        description: formData.description.trim(),
      }

      await onSaveProposal(newProposal)
      onClose()
    } catch (err) {
      console.error('Failed to create proposal:', err)
      setErrors((prev) => ({
        ...prev,
        submit: err.message || 'Failed to save proposal.',
      }))
    } finally {
      setIsSubmitting(false)
    }
  }

  const proposalNumberPreview = generateProposalNumber()

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-proposal-drawer-title"
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
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2
                    id="add-proposal-drawer-title"
                    className="text-base sm:text-lg font-bold text-odw-text truncate"
                  >
                    Add Proposal
                  </h2>
                  <p className="text-xs text-odw-text-muted mt-0.5">
                    Prepare a new commercial proposal scope.
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
            id="add-proposal-form"
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
                  Proposal Number
                </span>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  {proposalNumberPreview}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold tracking-wider text-odw-text-muted block">
                  Created Date
                </span>
                <span className="font-medium text-slate-700">
                  {todayStr}
                </span>
              </div>
            </div>

            {/* 1. Proposal Title */}
            <div className="space-y-1">
              <label
                htmlFor="proposal-title"
                className="block font-semibold text-slate-700"
              >
                Proposal Title <span className="text-rose-500">*</span>
              </label>
              <input
                ref={titleRef}
                id="proposal-title"
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g. Corporate Website Redesign & SEO"
                className={`w-full rounded-lg border bg-white px-3 py-2 text-xs text-odw-text placeholder:text-slate-400 focus:outline-none focus:ring-1 transition-colors ${
                  errors.title
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500 bg-rose-50/20'
                    : 'border-odw-border focus:border-odw-primary focus:ring-odw-primary'
                }`}
              />
              {errors.title && (
                <p className="text-[11px] text-rose-600 font-medium mt-1">
                  {errors.title}
                </p>
              )}
            </div>

            {/* 2. Client Selector */}
            <div className="space-y-1">
              <label
                htmlFor="proposal-client"
                className="block font-semibold text-slate-700"
              >
                Client <span className="text-rose-500">*</span>
              </label>
              <select
                ref={clientRef}
                id="proposal-client"
                value={formData.clientId}
                onChange={(e) => handleChange('clientId', e.target.value)}
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

            {/* 3. Service */}
            <div className="space-y-1">
              <label
                htmlFor="proposal-service"
                className="block font-semibold text-slate-700"
              >
                Service <span className="text-rose-500">*</span>
              </label>
              <select
                ref={serviceRef}
                id="proposal-service"
                value={formData.service}
                onChange={(e) => handleChange('service', e.target.value)}
                className={`w-full rounded-lg border bg-white px-3 py-2 text-xs text-odw-text focus:outline-none focus:ring-1 transition-colors cursor-pointer ${
                  errors.service
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500 bg-rose-50/20'
                    : 'border-odw-border focus:border-odw-primary focus:ring-odw-primary'
                }`}
              >
                {FORM_PROPOSAL_SERVICES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.service && (
                <p className="text-[11px] text-rose-600 font-medium mt-1">
                  {errors.service}
                </p>
              )}
            </div>

            {/* 4. Amount (INR) */}
            <div className="space-y-1">
              <label
                htmlFor="proposal-amount"
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
                  id="proposal-amount"
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

            {/* 5. Status & Valid Until in Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Status */}
              <div className="space-y-1">
                <label
                  htmlFor="proposal-status"
                  className="block font-semibold text-slate-700"
                >
                  Status <span className="text-rose-500">*</span>
                </label>
                <select
                  ref={statusRef}
                  id="proposal-status"
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className={`w-full rounded-lg border bg-white px-3 py-2 text-xs text-odw-text focus:outline-none focus:ring-1 transition-colors cursor-pointer ${
                    errors.status
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500 bg-rose-50/20'
                      : 'border-odw-border focus:border-odw-primary focus:ring-odw-primary'
                  }`}
                >
                  {FORM_PROPOSAL_STATUSES.map((st) => (
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

              {/* Valid Until */}
              <div className="space-y-1">
                <label
                  htmlFor="proposal-valid-until"
                  className="block font-semibold text-slate-700"
                >
                  Valid Until <span className="text-rose-500">*</span>
                </label>
                <input
                  ref={validUntilRef}
                  id="proposal-valid-until"
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => handleChange('validUntil', e.target.value)}
                  className={`w-full rounded-lg border bg-white px-3 py-2 text-xs text-odw-text focus:outline-none focus:ring-1 transition-colors ${
                    errors.validUntil
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500 bg-rose-50/20'
                      : 'border-odw-border focus:border-odw-primary focus:ring-odw-primary'
                  }`}
                />
                {errors.validUntil && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1">
                    {errors.validUntil}
                  </p>
                )}
              </div>
            </div>

            {/* 6. Description / Notes */}
            <div className="space-y-1">
              <label
                htmlFor="proposal-description"
                className="block font-semibold text-slate-700"
              >
                Description / Scope Notes
              </label>
              <textarea
                id="proposal-description"
                rows="4"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Key deliverables, scope inclusions, and terms..."
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
              form="add-proposal-form"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-odw-primary px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-odw-primary-hover transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Save Proposal</span>
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default AddProposalDrawer
