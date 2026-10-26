import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle, Lock, Mail, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import odwLogo from '../assets/Optimum logo.jpg'

export default function Login() {
  const { user, loading: authLoading, signIn, resetPassword } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // Sign In States
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Forgot Password States
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const [resetError, setResetError] = useState('')

  // If already authenticated, redirect to /dashboard immediately
  if (!authLoading && user) {
    const destination = location.state?.from?.pathname || '/dashboard'
    return <Navigate to={destination} replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.')
      return
    }

    setIsSubmitting(true)

    try {
      await signIn(email.trim(), password)
      const targetPath = location.state?.from?.pathname || '/dashboard'
      navigate(targetPath, { replace: true })
    } catch (err) {
      console.error('Login failure:', err)
      if (err.message?.includes('Invalid login credentials')) {
        setErrorMessage('Invalid email or password. Please verify your credentials.')
      } else if (err.message?.includes('Email not confirmed')) {
        setErrorMessage('Email address has not been confirmed yet.')
      } else {
        setErrorMessage(err.message || 'An error occurred while signing in. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault()
    setResetError('')

    if (!resetEmail.trim()) {
      setResetError('Please enter your email address.')
      return
    }

    setResetLoading(true)

    try {
      await resetPassword(resetEmail.trim())
      setResetSuccess(true)
    } catch (err) {
      console.error('Password reset failure:', err)
      setResetError(
        err.message || 'Failed to send password recovery link. Please try again.'
      )
    } finally {
      setResetLoading(false)
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
            {isForgotPassword ? 'Reset your password' : 'Sign in to ODW OS'}
          </h1>
          <p className="mt-1.5 text-xs text-odw-text-muted">
            {isForgotPassword
              ? 'Enter your employee email to receive a recovery link.'
              : 'Enter your employee credentials to access the workspace.'}
          </p>
        </div>

        {/* FORGOT PASSWORD VIEW */}
        {isForgotPassword ? (
          <div>
            {resetSuccess ? (
              <div className="space-y-6">
                <div className="flex items-start gap-2.5 rounded-lg bg-emerald-50 border border-emerald-200/80 p-3.5 text-xs text-emerald-800">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
                  <div className="leading-relaxed">
                    <span className="font-semibold block mb-0.5">Recovery link sent!</span>
                    We sent a password reset link to{' '}
                    <strong className="font-semibold">{resetEmail}</strong>. Please check your inbox and spam folder.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false)
                    setResetSuccess(false)
                    setResetError('')
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-odw-primary px-4 py-2.5 text-sm font-semibold text-white shadow-2xs hover:bg-odw-primary-hover focus:outline-none focus:ring-2 focus:ring-odw-primary/40 focus:ring-offset-1 transition-colors"
                >
                  <span>Return to sign in</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                {resetError && (
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 rounded-lg bg-rose-50 border border-rose-200/80 p-3 text-xs text-rose-800 animate-in fade-in duration-150"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                    <div className="flex-1 font-medium leading-relaxed">{resetError}</div>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="reset-email"
                    className="block text-xs font-semibold text-odw-text mb-1.5"
                  >
                    Employee email address
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      id="reset-email"
                      type="email"
                      autoComplete="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="name@odw.com"
                      className="w-full rounded-lg border border-odw-border bg-white pl-9 pr-3 py-2 text-sm text-odw-text placeholder-slate-400 focus:border-odw-primary focus:outline-none focus:ring-1 focus:ring-odw-primary/30 transition-colors"
                      disabled={resetLoading}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-odw-primary px-4 py-2.5 text-sm font-semibold text-white shadow-2xs hover:bg-odw-primary-hover focus:outline-none focus:ring-2 focus:ring-odw-primary/40 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    {resetLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                        <span>Sending recovery link...</span>
                      </>
                    ) : (
                      <span>Send recovery link</span>
                    )}
                  </button>
                </div>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false)
                      setResetError('')
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-odw-text-muted hover:text-odw-primary transition-colors focus:outline-none"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back to sign in</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* STANDARD SIGN IN VIEW */
          <div>
            {/* Error Alert Banner */}
            {errorMessage && (
              <div
                role="alert"
                className="mb-6 flex items-start gap-2.5 rounded-lg bg-rose-50 border border-rose-200/80 p-3 text-xs text-rose-800 animate-in fade-in duration-150"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
              </div>
            )}

            {/* Credentials Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-odw-text mb-1.5"
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@odw.com"
                    className="w-full rounded-lg border border-odw-border bg-white pl-9 pr-3 py-2 text-sm text-odw-text placeholder-slate-400 focus:border-odw-primary focus:outline-none focus:ring-1 focus:ring-odw-primary/30 transition-colors"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold text-odw-text"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true)
                      setResetSuccess(false)
                      setResetError('')
                      setResetEmail(email)
                    }}
                    className="text-xs font-medium text-odw-primary hover:text-odw-primary-hover hover:underline transition-colors focus:outline-none"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-odw-border bg-white pl-9 pr-3 py-2 text-sm text-odw-text placeholder-slate-400 focus:border-odw-primary focus:outline-none focus:ring-1 focus:ring-odw-primary/30 transition-colors"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-odw-primary px-4 py-2.5 text-sm font-semibold text-white shadow-2xs hover:bg-odw-primary-hover focus:outline-none focus:ring-2 focus:ring-odw-primary/40 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <span>Sign in</span>
                  )}
                </button>
              </div>
            </form>
          </div>
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
