import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Mail,
  KeyRound,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import odwLogo from '../assets/Optimum logo.jpg'

export default function ResetPassword() {
  const navigate = useNavigate()
  const { resetPassword, updatePassword } = useAuth()

  // Session & Verification State
  const [isVerifying, setIsVerifying] = useState(true)
  const [hasValidSession, setHasValidSession] = useState(false)
  const [linkError, setLinkError] = useState('')

  // Form Fields
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Status & Messaging
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  // Request New Link (Fallback when expired/invalid)
  const [resendEmail, setResendEmail] = useState('')
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [resendError, setResendError] = useState('')

  useEffect(() => {
    let isMounted = true

    const verifyRecoveryLink = async () => {
      // 1. Inspect URL parameters in both hash (#) and query string (?)
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
      const searchParams = new URLSearchParams(window.location.search)

      const urlError = hashParams.get('error') || searchParams.get('error')
      const urlErrorDescription =
        hashParams.get('error_description') || searchParams.get('error_description')
      const urlErrorCode = hashParams.get('error_code') || searchParams.get('error_code')
      const type = hashParams.get('type') || searchParams.get('type')

      // Detect expired or denied OTP links
      if (urlError || urlErrorCode) {
        if (!isMounted) return
        setIsVerifying(false)
        setHasValidSession(false)
        setLinkError(
          urlErrorDescription
            ? decodeURIComponent(urlErrorDescription.replace(/\+/g, ' '))
            : 'This password recovery link has expired or is invalid. Please request a new one.'
        )
        return
      }

      // 2. Check existing session from Supabase
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (!isMounted) return

        if (sessionError) {
          setIsVerifying(false)
          setHasValidSession(false)
          setLinkError(sessionError.message)
          return
        }

        // If session exists or recovery tokens are present
        if (session || type === 'recovery') {
          setHasValidSession(true)
          setIsVerifying(false)
          return
        }

        // 3. Fallback: Wait briefly for Supabase auth listener if hash tokens are being exchanged
        setTimeout(async () => {
          if (!isMounted) return
          const {
            data: { session: delayedSession },
          } = await supabase.auth.getSession()

          if (!isMounted) return
          if (delayedSession) {
            setHasValidSession(true)
            setIsVerifying(false)
          } else {
            setIsVerifying(false)
            setHasValidSession(false)
            setLinkError(
              'No active password reset session found. Recovery links are single-use and time-limited. Please request a new link below.'
            )
          }
        }, 600)
      } catch (err) {
        console.warn('Session verification error:', err)
        if (!isMounted) return
        setIsVerifying(false)
        setHasValidSession(false)
        setLinkError('An unexpected error occurred while verifying the recovery link.')
      }
    }

    verifyRecoveryLink()

    // 4. Subscribe to onAuthStateChange for PASSWORD_RECOVERY event
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        setHasValidSession(true)
        setIsVerifying(false)
        setLinkError('')
      }
    })

    return () => {
      isMounted = false
      subscription?.unsubscribe()
    }
  }, [])

  // Handle password update
  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (!newPassword) {
      setErrorMessage('Please enter a new password.')
      return
    }

    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify both fields.')
      return
    }

    setIsSubmitting(true)

    try {
      await updatePassword(newPassword)

      // Sign out from temporary recovery session so user signs in cleanly with new password
      try {
        await supabase.auth.signOut()
      } catch (signOutErr) {
        console.warn('Sign out notice after password update:', signOutErr)
      }

      setIsSuccess(true)
    } catch (err) {
      console.error('Password update failure:', err)
      if (err.message?.includes('different from the old password')) {
        setErrorMessage('New password should be different from your old password.')
      } else if (err.message?.includes('weak')) {
        setErrorMessage('Password is too weak. Please choose a stronger combination.')
      } else {
        setErrorMessage(
          err.message || 'Failed to update password. Please verify your connection and try again.'
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle requesting a new reset link when current one is expired/invalid
  const handleResend = async (e) => {
    e.preventDefault()
    setResendError('')

    if (!resendEmail.trim()) {
      setResendError('Please enter your email address.')
      return
    }

    setIsResending(true)

    try {
      await resetPassword(resendEmail.trim())
      setResendSuccess(true)
    } catch (err) {
      console.error('Password reset email resend failure:', err)
      setResendError(
        err.message || 'Unable to send recovery email. Please check the email address and try again.'
      )
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-odw-bg text-odw-text flex flex-col justify-center items-center px-4 py-12 antialiased selection:bg-odw-primary selection:text-white">
      {/* Container Card */}
      <div className="w-full max-w-md bg-white rounded-xl border border-odw-border shadow-xs p-8 sm:p-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex items-center justify-center h-16 w-48 mb-4 overflow-hidden">
            <img
              src={odwLogo}
              alt="Optimum Digital Works"
              className="w-48 max-w-none h-auto object-contain"
            />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-odw-text">
            {isSuccess
              ? 'Password Updated'
              : !hasValidSession && !isVerifying
                ? 'Recovery Link Expired'
                : 'Set New Password'}
          </h1>
          <p className="mt-1.5 text-xs text-odw-text-muted">
            {isSuccess
              ? 'Your password has been changed successfully.'
              : !hasValidSession && !isVerifying
                ? 'This recovery link is no longer valid.'
                : 'Enter and confirm your new employee password.'}
          </p>
        </div>

        {/* 1. VERIFYING STATE */}
        {isVerifying && (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
            <Loader2 className="h-7 w-7 animate-spin text-odw-primary" />
            <p className="text-xs font-medium text-odw-text-muted">
              Verifying your recovery link...
            </p>
          </div>
        )}

        {/* 2. SUCCESS STATE */}
        {!isVerifying && isSuccess && (
          <div className="space-y-6">
            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-emerald-50 border border-emerald-200/80">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 mb-2" />
              <p className="text-xs font-semibold text-emerald-900">
                Password updated successfully
              </p>
              <p className="mt-1 text-xs text-emerald-700 leading-relaxed">
                Your new password is now active. You can log in to the CRM with your updated credentials.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/login', { replace: true })}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-odw-primary px-4 py-2.5 text-sm font-semibold text-white shadow-2xs hover:bg-odw-primary-hover focus:outline-none focus:ring-2 focus:ring-odw-primary/40 focus:ring-offset-1 transition-colors"
            >
              <span>Sign in with new password</span>
            </button>
          </div>
        )}

        {/* 3. EXPIRED / INVALID LINK STATE */}
        {!isVerifying && !hasValidSession && !isSuccess && (
          <div className="space-y-6">
            <div className="flex items-start gap-3 rounded-lg bg-rose-50 border border-rose-200/80 p-3.5 text-xs text-rose-800">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-semibold block mb-0.5">Link expired or invalid</span>
                {linkError ||
                  'This recovery link has expired or has already been used. Password reset links are time-limited for security.'}
              </div>
            </div>

            {/* Resend Recovery Link Form */}
            <div className="pt-2">
              <h2 className="text-xs font-bold text-odw-text uppercase tracking-wider mb-2">
                Request a new reset link
              </h2>

              {resendSuccess ? (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200/80 p-3.5 text-xs text-emerald-800 flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                  <div className="leading-relaxed">
                    A new recovery link has been sent to{' '}
                    <strong className="font-semibold">{resendEmail}</strong>. Please check your inbox and spam folder.
                  </div>
                </div>
              ) : (
                <form onSubmit={handleResend} className="space-y-3">
                  {resendError && (
                    <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                      {resendError}
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="resend-email"
                      className="block text-xs font-semibold text-odw-text mb-1"
                    >
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        id="resend-email"
                        type="email"
                        required
                        value={resendEmail}
                        onChange={(e) => setResendEmail(e.target.value)}
                        placeholder="name@odw.com"
                        className="w-full rounded-lg border border-odw-border bg-white pl-9 pr-3 py-2 text-sm text-odw-text placeholder-slate-400 focus:border-odw-primary focus:outline-none focus:ring-1 focus:ring-odw-primary/30 transition-colors"
                        disabled={isResending}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isResending}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-odw-primary px-4 py-2 text-sm font-semibold text-white shadow-2xs hover:bg-odw-primary-hover focus:outline-none focus:ring-2 focus:ring-odw-primary/40 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                        <span>Sending link...</span>
                      </>
                    ) : (
                      <span>Send new recovery link</span>
                    )}
                  </button>
                </form>
              )}
            </div>

            <div className="pt-2 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-odw-text-muted hover:text-odw-primary transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Return to sign in</span>
              </Link>
            </div>
          </div>
        )}

        {/* 4. VALID RECOVERY SESSION FORM */}
        {!isVerifying && hasValidSession && !isSuccess && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-lg bg-rose-50 border border-rose-200/80 p-3 text-xs text-rose-800 animate-in fade-in duration-150"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
              </div>
            )}

            {/* New Password Field */}
            <div>
              <label
                htmlFor="new-password"
                className="block text-xs font-semibold text-odw-text mb-1.5"
              >
                New password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-lg border border-odw-border bg-white pl-9 pr-10 py-2 text-sm text-odw-text placeholder-slate-400 focus:border-odw-primary focus:outline-none focus:ring-1 focus:ring-odw-primary/30 transition-colors"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-[11px] text-odw-text-muted">
                Must be at least 6 characters long.
              </p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirm-password"
                className="block text-xs font-semibold text-odw-text mb-1.5"
              >
                Confirm new password
              </label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className={`w-full rounded-lg border bg-white pl-9 pr-10 py-2 text-sm text-odw-text placeholder-slate-400 focus:outline-none transition-colors ${
                    confirmPassword && confirmPassword !== newPassword
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30'
                      : 'border-odw-border focus:border-odw-primary focus:ring-1 focus:ring-odw-primary/30'
                  }`}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {confirmPassword && confirmPassword !== newPassword && (
                <p className="mt-1 text-[11px] text-rose-600 font-medium">
                  Passwords do not match.
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-odw-primary px-4 py-2.5 text-sm font-semibold text-white shadow-2xs hover:bg-odw-primary-hover focus:outline-none focus:ring-2 focus:ring-odw-primary/40 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                    <span>Updating password...</span>
                  </>
                ) : (
                  <span>Update password</span>
                )}
              </button>
            </div>

            <div className="pt-2 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-odw-text-muted hover:text-odw-primary transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Cancel and return to sign in</span>
              </Link>
            </div>
          </form>
        )}

        {/* Security / System Footer Note */}
        <div className="mt-8 pt-6 border-t border-odw-border text-center">
          <p className="text-[11px] text-odw-text-muted">
            Internal Business Operating System · Restricted Access
          </p>
        </div>
      </div>
    </div>
  )
}
