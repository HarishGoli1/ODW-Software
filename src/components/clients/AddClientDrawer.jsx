import { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import {
  FORM_CLIENT_SERVICES,
  FORM_CLIENT_STATUSES,
  FORM_CLIENT_PAYMENTS,
} from '../../data/clients'

function AddClientDrawer({ isOpen, onClose, onSaveClient }) {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    service: 'Business Website',
    status: 'Active',
    payment: 'Pending',
    notes: '',
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when drawer opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        company: '',
        email: '',
        phone: '',
        service: 'Business Website',
        status: 'Active',
        payment: 'Pending',
        notes: '',
      })
      setErrors({})
      setIsSubmitting(false)
    }
  }, [isOpen])

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

  if (!isOpen) return null

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

    // Phone (Accept Indian numbers, common +91, 10 digits)
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

    // Status
    if (!formData.status) {
      newErrors.status = 'Please select a client status.'
    }

    // Payment Status
    if (!formData.payment) {
      newErrors.payment = 'Please select a payment status.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)

    try {
      const newClient = {
        name: formData.name.trim(),
        company: formData.company.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        service: formData.service,
        status: formData.status,
        payment: formData.payment,
        notes: formData.notes.trim(),
      }

      await onSaveClient(newClient)
      onClose()
    } catch (err) {
      console.error('Failed to save client:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="add-client-drawer-title">
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
          <div className="flex items-start justify-between border-b border-odw-border p-5 shrink-0 bg-white">
            <div>
              <h2 id="add-client-drawer-title" className="text-base font-bold text-odw-text">
                Add New Client
              </h2>
              <p className="mt-0.5 text-xs text-odw-text-muted">
                Create a new client relationship.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/70 text-slate-400 hover:text-odw-text hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close drawer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* 2. Scrollable Form Body */}
          <form
            id="add-client-form"
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar"
          >
            {/* Full Name */}
            <div>
              <label htmlFor="client-name" className="block text-xs font-semibold text-odw-text mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="client-name"
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
              <label htmlFor="client-company" className="block text-xs font-semibold text-odw-text mb-1">
                Company Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="client-company"
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
                <label htmlFor="client-email" className="block text-xs font-semibold text-odw-text mb-1">
                  Email <span className="text-rose-500">*</span>
                </label>
                <input
                  id="client-email"
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
                <label htmlFor="client-phone" className="block text-xs font-semibold text-odw-text mb-1">
                  Phone <span className="text-rose-500">*</span>
                </label>
                <input
                  id="client-phone"
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
              <label htmlFor="client-service" className="block text-xs font-semibold text-odw-text mb-1">
                Service Required <span className="text-rose-500">*</span>
              </label>
              <select
                id="client-service"
                value={formData.service}
                onChange={(e) => handleChange('service', e.target.value)}
                className={`w-full rounded-lg border bg-white px-3 py-2 text-xs text-odw-text focus:outline-none focus:ring-1 cursor-pointer transition-colors ${
                  errors.service
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-400'
                    : 'border-odw-border focus:border-odw-primary focus:ring-odw-primary'
                }`}
              >
                {FORM_CLIENT_SERVICES.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
              {errors.service && (
                <p className="mt-1 text-[11px] text-rose-500">{errors.service}</p>
              )}
            </div>

            {/* Client Status & Payment Status (2-col layout) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Client Status */}
              <div>
                <label htmlFor="client-status" className="block text-xs font-semibold text-odw-text mb-1">
                  Client Status <span className="text-rose-500">*</span>
                </label>
                <select
                  id="client-status"
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className={`w-full rounded-lg border bg-white px-3 py-2 text-xs text-odw-text focus:outline-none focus:ring-1 cursor-pointer transition-colors ${
                    errors.status
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-400'
                    : 'border-odw-border focus:border-odw-primary focus:ring-odw-primary'
                  }`}
                >
                  {FORM_CLIENT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                {errors.status && (
                  <p className="mt-1 text-[11px] text-rose-500">{errors.status}</p>
                )}
              </div>

              {/* Payment Status */}
              <div>
                <label htmlFor="client-payment" className="block text-xs font-semibold text-odw-text mb-1">
                  Payment Status <span className="text-rose-500">*</span>
                </label>
                <select
                  id="client-payment"
                  value={formData.payment}
                  onChange={(e) => handleChange('payment', e.target.value)}
                  className={`w-full rounded-lg border bg-white px-3 py-2 text-xs text-odw-text focus:outline-none focus:ring-1 cursor-pointer transition-colors ${
                    errors.payment
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-400'
                    : 'border-odw-border focus:border-odw-primary focus:ring-odw-primary'
                  }`}
                >
                  {FORM_CLIENT_PAYMENTS.map((payment) => (
                    <option key={payment} value={payment}>
                      {payment}
                    </option>
                  ))}
                </select>
                {errors.payment && (
                  <p className="mt-1 text-[11px] text-rose-500">{errors.payment}</p>
                )}
              </div>
            </div>

            {/* Notes (Optional) */}
            <div>
              <label htmlFor="client-notes" className="block text-xs font-semibold text-odw-text mb-1">
                Notes
              </label>
              <textarea
                id="client-notes"
                rows={3}
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
              form="add-client-form"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-odw-primary px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-odw-primary-hover active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Client</span>
              )}
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default AddClientDrawer
