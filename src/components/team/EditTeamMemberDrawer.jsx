import { useState, useEffect, useRef } from 'react'
import { X, Loader2, Users, Lock } from 'lucide-react'
import {
  FORM_TEAM_STATUSES,
  FORM_TEAM_DEPARTMENTS,
  FORM_TEAM_ROLES,
} from '../../data/team'

function EditTeamMemberDrawer({ member, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    status: '',
    joinedDate: '',
    skills: '',
    notes: '',
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const nameRef = useRef(null)
  const emailRef = useRef(null)
  const roleRef = useRef(null)
  const departmentRef = useRef(null)
  const statusRef = useRef(null)
  const joinedDateRef = useRef(null)

  // Populate form with existing member data
  useEffect(() => {
    if (member && isOpen) {
      setFormData({
        name: member.name || '',
        email: member.email || '',
        phone: member.phone || '',
        role: member.role || FORM_TEAM_ROLES[0],
        department: member.department || FORM_TEAM_DEPARTMENTS[0],
        status: member.status || 'Active',
        joinedDate: member.joinedDate || '',
        skills: Array.isArray(member.skills) ? member.skills.join(', ') : '',
        notes: member.notes || '',
      })
      setErrors({})
      setIsSubmitting(false)
    }
  }, [member, isOpen])

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

  if (!isOpen || !member) return null

  const validate = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required.'
    }

    const emailTrimmed = formData.email.trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailTrimmed) {
      newErrors.email = 'Email address is required.'
    } else if (!emailRegex.test(emailTrimmed)) {
      newErrors.email = 'Please enter a valid email address.'
    }

    if (!formData.role) {
      newErrors.role = 'Role is required.'
    }

    if (!formData.department) {
      newErrors.department = 'Department is required.'
    }

    if (!formData.status) {
      newErrors.status = 'Status is required.'
    }

    if (!formData.joinedDate) {
      newErrors.joinedDate = 'Joined date is required.'
    }

    setErrors(newErrors)

    if (newErrors.name && nameRef.current) {
      nameRef.current.focus()
    } else if (newErrors.email && emailRef.current) {
      emailRef.current.focus()
    } else if (newErrors.role && roleRef.current) {
      roleRef.current.focus()
    } else if (newErrors.department && departmentRef.current) {
      departmentRef.current.focus()
    } else if (newErrors.status && statusRef.current) {
      statusRef.current.focus()
    } else if (newErrors.joinedDate && joinedDateRef.current) {
      joinedDateRef.current.focus()
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

    const parsedSkills = formData.skills
      ? formData.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : []

    const updatedMember = {
      ...member,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      role: formData.role,
      department: formData.department,
      status: formData.status,
      joinedDate: formData.joinedDate,
      skills: parsedSkills,
      notes: formData.notes.trim(),
    }

    try {
      await onSave(updatedMember)
      onClose()
    } catch {
      // Keep drawer open if update fails
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-team-drawer-title"
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
                  <Users className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2
                    id="edit-team-drawer-title"
                    className="text-base sm:text-lg font-bold text-odw-text truncate"
                  >
                    Edit Team Member
                  </h2>
                  <p className="text-xs text-odw-text-muted mt-0.5">
                    Update profile, role, status, and skills.
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
            id="edit-team-form"
            onSubmit={handleSubmit}
            noValidate
            className="flex-1 overflow-y-auto p-5 space-y-4 text-xs"
          >
            {/* Locked Info Preview */}
            <div className="rounded-xl bg-slate-50 border border-slate-200/70 p-3 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-odw-text-muted flex items-center gap-1">
                  <Lock className="h-3 w-3 text-slate-400" />
                  Member ID (Locked)
                </span>
                <span className="font-mono font-bold text-slate-800 text-sm mt-0.5 block">
                  {member.id}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold tracking-wider text-odw-text-muted flex items-center justify-end gap-1">
                  <Lock className="h-3 w-3 text-slate-400" />
                  Created (Locked)
                </span>
                <span className="font-medium text-slate-700 mt-0.5 block">
                  {member.createdAt}
                </span>
              </div>
            </div>

            {/* 1. Full Name */}
            <div className="space-y-1">
              <label
                htmlFor="edit-team-name"
                className="block font-semibold text-slate-700"
              >
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                ref={nameRef}
                id="edit-team-name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g. Padhu Priya"
                className={`w-full rounded-lg border bg-white px-3 py-2 text-xs text-odw-text placeholder:text-slate-400 focus:outline-none focus:ring-1 transition-colors ${
                  errors.name
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500 bg-rose-50/20'
                    : 'border-odw-border focus:border-odw-primary focus:ring-odw-primary'
                }`}
              />
              {errors.name && (
                <p className="text-[11px] text-rose-600 font-medium mt-1">
                  {errors.name}
                </p>
              )}
            </div>

            {/* 2. Email & Phone in 2-col Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label
                  htmlFor="edit-team-email"
                  className="block font-semibold text-slate-700"
                >
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  ref={emailRef}
                  id="edit-team-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="e.g. padhu@odw.example"
                  className={`w-full rounded-lg border bg-white px-3 py-2 text-xs text-odw-text placeholder:text-slate-400 focus:outline-none focus:ring-1 transition-colors ${
                    errors.email
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500 bg-rose-50/20'
                      : 'border-odw-border focus:border-odw-primary focus:ring-odw-primary'
                  }`}
                />
                {errors.email && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="edit-team-phone"
                  className="block font-semibold text-slate-700"
                >
                  Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  id="edit-team-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="e.g. +91 90000 00001"
                  className="w-full rounded-lg border border-odw-border bg-white px-3 py-2 text-xs text-odw-text placeholder:text-slate-400 focus:border-odw-primary focus:outline-none focus:ring-1 focus:ring-odw-primary transition-colors"
                />
              </div>
            </div>

            {/* 3. Role & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label
                  htmlFor="edit-team-role"
                  className="block font-semibold text-slate-700"
                >
                  Role <span className="text-rose-500">*</span>
                </label>
                <select
                  ref={roleRef}
                  id="edit-team-role"
                  value={formData.role}
                  onChange={(e) => handleChange('role', e.target.value)}
                  className={`w-full rounded-lg border bg-white px-3 py-2 text-xs text-odw-text focus:outline-none focus:ring-1 transition-colors cursor-pointer ${
                    errors.role
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500 bg-rose-50/20'
                      : 'border-odw-border focus:border-odw-primary focus:ring-odw-primary'
                  }`}
                >
                  {FORM_TEAM_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                {errors.role && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1">
                    {errors.role}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="edit-team-department"
                  className="block font-semibold text-slate-700"
                >
                  Department <span className="text-rose-500">*</span>
                </label>
                <select
                  ref={departmentRef}
                  id="edit-team-department"
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  className={`w-full rounded-lg border bg-white px-3 py-2 text-xs text-odw-text focus:outline-none focus:ring-1 transition-colors cursor-pointer ${
                    errors.department
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500 bg-rose-50/20'
                      : 'border-odw-border focus:border-odw-primary focus:ring-odw-primary'
                  }`}
                >
                  {FORM_TEAM_DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                {errors.department && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1">
                    {errors.department}
                  </p>
                )}
              </div>
            </div>

            {/* 4. Status & Joined Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label
                  htmlFor="edit-team-status"
                  className="block font-semibold text-slate-700"
                >
                  Status <span className="text-rose-500">*</span>
                </label>
                <select
                  ref={statusRef}
                  id="edit-team-status"
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className={`w-full rounded-lg border bg-white px-3 py-2 text-xs text-odw-text focus:outline-none focus:ring-1 transition-colors cursor-pointer ${
                    errors.status
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500 bg-rose-50/20'
                      : 'border-odw-border focus:border-odw-primary focus:ring-odw-primary'
                  }`}
                >
                  {FORM_TEAM_STATUSES.map((st) => (
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
                  htmlFor="edit-team-joined-date"
                  className="block font-semibold text-slate-700"
                >
                  Joined Date <span className="text-rose-500">*</span>
                </label>
                <input
                  ref={joinedDateRef}
                  id="edit-team-joined-date"
                  type="date"
                  value={formData.joinedDate}
                  onChange={(e) => handleChange('joinedDate', e.target.value)}
                  className={`w-full rounded-lg border bg-white px-3 py-2 text-xs text-odw-text focus:outline-none focus:ring-1 transition-colors ${
                    errors.joinedDate
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500 bg-rose-50/20'
                      : 'border-odw-border focus:border-odw-primary focus:ring-odw-primary'
                  }`}
                />
                {errors.joinedDate && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1">
                    {errors.joinedDate}
                  </p>
                )}
              </div>
            </div>

            {/* 5. Skills */}
            <div className="space-y-1">
              <label
                htmlFor="edit-team-skills"
                className="block font-semibold text-slate-700"
              >
                Skills <span className="text-slate-400 font-normal">(Comma-separated)</span>
              </label>
              <input
                id="edit-team-skills"
                type="text"
                value={formData.skills}
                onChange={(e) => handleChange('skills', e.target.value)}
                placeholder="e.g. React, JavaScript, Tailwind CSS"
                className="w-full rounded-lg border border-odw-border bg-white px-3 py-2 text-xs text-odw-text placeholder:text-slate-400 focus:border-odw-primary focus:outline-none focus:ring-1 focus:ring-odw-primary transition-colors"
              />
            </div>

            {/* 6. Notes */}
            <div className="space-y-1">
              <label
                htmlFor="edit-team-notes"
                className="block font-semibold text-slate-700"
              >
                Notes <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                id="edit-team-notes"
                rows="3"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Key responsibilities, availability, or bio..."
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
              form="edit-team-form"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-odw-primary px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-odw-primary-hover transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Save Changes</span>
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default EditTeamMemberDrawer
