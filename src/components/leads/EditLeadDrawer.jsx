import { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import { SERVICE_OPTIONS, SOURCE_OPTIONS, LEAD_STATUS_OPTIONS } from '../../data/leads'

const AVAILABLE_SOURCES = SOURCE_OPTIONS.filter((s) => s !== 'All Sources')

function EditLeadDrawer({ lead, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    service: 'Business Website',
    source: 'Website',
    status: 'New',
    message: '',
    notes: '',
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Prefill form values whenever lead changes or drawer opens
  useEffect(() => {
    if (lead && isOpen) {
      setFormData({
        name: lead.name || '',
        company: lead.company || '',
        email: lead.email || '',
        phone: lead.phone || '',
        service: lead.service || 'Business Website',
        source: lead.source || 'Website',
        status: lead.status || 'New',
        message: lead.message || '',
        notes: lead.notes || '',
      })
      setErrors({})
      setIsSubmitting(false)
    }
  }, [lead, isOpen])

  // Escape key closes drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !lead) return null

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  const validate = () => {
    const newErrors = {}

    // Name
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required.'
    }

    // Company
    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required.'
    }

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.'
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email format (e.g. name@company.com).'
    }

    // Phone (Accept Indian numbers, common +91, 10 digits, etc.)
    const phoneTrimmed = formData.phone.trim()
    const phoneRegex = /^(\+91[\s-]?)?[6-9]\d{9}$|^(\+91\s?)?\d{5}[\s-]?\d{5}$/
    if (!phoneTrimmed) {
      newErrors.phone = 'Phone number is required.'
    } else if (!phoneRegex.test(phoneTrimmed) && phoneTrimmed.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Please enter a valid phone number (e.g. +91 98765 43210).'
    }

    // Service
    if (!formData.service) {
      newErrors.service = 'Please select a service.'
    }

    // Source
    if (!formData.source) {
      newErrors.source = 'Please select a lead source.'
    }

    // Status
    if (!formData.status) {
      newErrors.status = 'Please select a status.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)

    try {
      const updatedLead = {
        id: lead.id,
        name: formData.name.trim(),
        company: formData.company.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        service: formData.service,
        source: formData.source,
        status: formData.status,
      }

      await onSave(updatedLead)
      onClose()
    } catch (err) {
      console.error('Failed to update lead:', err)
      // Drawer remains open on error so user does not lose input
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="edit-drawer-title">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <aside
          className="w-screen max-w-[440px] sm:max-w-[480px] bg-white shadow-2xl border-l border-odw-border flex flex-col justify-between"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 1. Drawer Header */}
          <div className="border-b border-odw-border p-5 shrink-0 bg-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="edit-drawer-title" className="text-base font-bold text-odw-text">
                  Edit Lead
                </h2>
                <p className="mt-0.5 text-xs text-odw-text-muted">
                  Update lead information.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/70 text-slate-400 hover:text-odw-text hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                aria-label="Close drawer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Selected Lead Identity Card */}
            <div className="mt-3.5 flex items-center gap-2.5 rounded-lg bg-slate-50 border border-slate-200/70 p-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100/70 text-odw-primary font-bold text-xs shrink-0 border border-orange-200/50">
                {lead.initials || 'LD'}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-xs text-odw-text truncate leading-snug">
                  {lead.name}
                </p>
                <p className="text-[11px] text-odw-text-muted truncate">
                  {lead.company}
                </p>
              </div>
            </div>
          </div>

          {/* 2. Scrollable Form Body */}
          <form
            id="edit-lead-form"
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar"
          >
            {/* Full Name */}
            <div>
              <label htmlFor="edit-lead-name" className="block text-xs font-semibold text-odw-text mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="edit-lead-name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter full name"
                className={`w-full rounded-lg border px-3 py-2 text-xs text-odw-text placeholder:text-slate-400 focus:outline-none focus:ring-1 transition-colors ${
                  errors.name
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-400'
                    : 'border-odw-border focus:border-odw-primary focus:ring-odw-primary'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-[11px] text-rose-500">{errors.name}</p>
              )}
            </div>

            {/* Company Name */}
            <div>
              <label htmlFor="edit-lead-company" className="block text-xs font-semibold text-odw-text mb-1">
                Company Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="edit-lead-company"
                type="text"
                value={formData.company}
                onChange={(e) => handleChange('company', e.target.value)}
                placeholder="Enter company name"
                className={`w-full rounded-lg border px-3 py-2 text-xs text-odw-text placeholder:text-slate-400 focus:outline-none focus:ring-1 transition-colors ${
                  errors.company
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-400'
                    : 'border-odw-border focus:border-odw-primary focus:ring-odw-primary'
                }`}
              />
              {errors.company && (
                <p className="mt-1 text-[11px] text-rose-500">{errors.company}</p>
              )}
            </div>

            {/* Email & Phone (2-col layout on desktop) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Email */}
              <div>
                <label htmlFor="edit-lead-email" className="block text-xs font-semibold text-odw-text mb-1">
                  Email <span className="text-rose-500">*</span>
                </label>
                <input
                  id="edit-lead-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="name@company.com"
                  className={`w-full rounded-lg border px-3 py-2 text-xs text-odw-text placeholder:text-slate-400 focus:outline-none focus:ring-1 transition-colors ${
                    errors.email
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-400'
                      : 'border-odw-border focus:border-odw-primary focus:ring-odw-primary'
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-[11px] text-rose-500">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="edit-lead-phone" className="block text-xs font-semibold text-odw-text mb-1">
                  Phone <span className="text-rose-500">*</span>
                </label>
                <input
                  id="edit-lead-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  className={`w-full rounded-lg border px-3 py-2 text-xs text-odw-text placeholder:text-slate-400 focus:outline-none focus:ring-1 transition-colors ${
                    errors.phone
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-400'
                      : 'border-odw-border focus:border-odw-primary focus:ring-odw-primary'
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-[11px] text-rose-500">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Service Required */}
            <div>
              <label htmlFor="edit-lead-service" className="block text-xs font-semibold text-odw-text mb-1">
                Service Required <span className="text-rose-500">*</span>
              </label>
              <select
                id="edit-lead-service"
                value={formData.service}
                onChange={(e) => handleChange('service', e.target.value)}
                className={`w-full rounded-lg border bg-white px-3 py-2 text-xs text-odw-text focus:outline-none focus:ring-1 cursor-pointer transition-colors ${
                  errors.service
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-400'
                    : 'border-odw-border focus:border-odw-primary focus:ring-odw-primary'
                }`}
              >
                {SERVICE_OPTIONS.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
              {errors.service && (
                <p className="mt-1 text-[11px] text-rose-500">{errors.service}</p>
              )}
            </div>

            {/* Lead Source & Lead Status (2-col layout) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Lead Source */}
              <div>
                <label htmlFor="edit-lead-source" className="block text-xs font-semibold text-odw-text mb-1">
                  Lead Source <span className="text-rose-500">*</span>
                </label>
                <select
                  id="edit-lead-source"
                  value={formData.source}
                  onChange={(e) => handleChange('source', e.target.value)}
                  className={`w-full rounded-lg border bg-white px-3 py-2 text-xs text-odw-text focus:outline-none focus:ring-1 cursor-pointer transition-colors ${
                    errors.source
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-400'
                    : 'border-odw-border focus:border-odw-primary focus:ring-odw-primary'
                  }`}
                >
                  {AVAILABLE_SOURCES.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
                {errors.source && (
                  <p className="mt-1 text-[11px] text-rose-500">{errors.source}</p>
                )}
              </div>

              {/* Lead Status */}
              <div>
                <label htmlFor="edit-lead-status" className="block text-xs font-semibold text-odw-text mb-1">
                  Lead Status <span className="text-rose-500">*</span>
                </label>
                <select
                  id="edit-lead-status"
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className={`w-full rounded-lg border bg-white px-3 py-2 text-xs text-odw-text focus:outline-none focus:ring-1 cursor-pointer transition-colors ${
                    errors.status
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-400'
                    : 'border-odw-border focus:border-odw-primary focus:ring-odw-primary'
                  }`}
                >
                  {LEAD_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                {errors.status && (
                  <p className="mt-1 text-[11px] text-rose-500">{errors.status}</p>
                )}
              </div>
            </div>

            {/* Customer Message (Optional) */}
            <div>
              <label htmlFor="edit-lead-message" className="block text-xs font-semibold text-odw-text mb-1">
                Customer Message
              </label>
              <textarea
                id="edit-lead-message"
                rows={3}
                value={formData.message}
                onChange={(e) => handleChange('message', e.target.value)}
                placeholder="Describe the customer's requirement..."
                className="w-full rounded-lg border border-odw-border px-3 py-2 text-xs text-odw-text placeholder:text-slate-400 focus:border-odw-primary focus:outline-none focus:ring-1 focus:ring-odw-primary transition-colors resize-none"
              />
            </div>

            {/* Notes (Optional) */}
            <div>
              <label htmlFor="edit-lead-notes" className="block text-xs font-semibold text-odw-text mb-1">
                Notes
              </label>
              <textarea
                id="edit-lead-notes"
                rows={2}
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Add internal notes..."
                className="w-full rounded-lg border border-odw-border px-3 py-2 text-xs text-odw-text placeholder:text-slate-400 focus:border-odw-primary focus:outline-none focus:ring-1 focus:ring-odw-primary transition-colors resize-none"
              />
            </div>
          </form>

          {/* 3. Sticky Drawer Footer */}
          <div className="flex items-center justify-end gap-2.5 border-t border-odw-border p-4 bg-slate-50/70 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-odw-border bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="edit-lead-form"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-odw-primary px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-odw-primary-hover active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default EditLeadDrawer
