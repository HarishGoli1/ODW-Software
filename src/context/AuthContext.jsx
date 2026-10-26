import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({
  user: null,
  session: null,
  employee: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  updatePassword: async () => {},
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch employee record matching the Supabase auth user id
  const fetchEmployeeProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('auth_user_id', userId)
        .maybeSingle()

      if (error) {
        console.warn('Notice: Could not fetch linked team_member record:', error.message)
        return null
      }
      return data
    } catch (err) {
      console.warn('Unexpected error fetching employee profile:', err)
      return null
    }
  }

  useEffect(() => {
    let isMounted = true

    // 1. Initial session bootstrap on mount
    const initializeAuth = async () => {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession()

        if (!isMounted) return

        setSession(initialSession)
        setUser(initialSession?.user ?? null)

        if (initialSession?.user) {
          const emp = await fetchEmployeeProfile(initialSession.user.id)
          if (isMounted) setEmployee(emp)
        }
      } catch (err) {
        console.error('Auth initialization error:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    initializeAuth()

    // 2. Listen to real-time auth state events (SIGN_IN, SIGN_OUT, TOKEN_REFRESHED)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!isMounted) return

      setSession(currentSession)
      setUser(currentSession?.user ?? null)

      if (currentSession?.user) {
        const emp = await fetchEmployeeProfile(currentSession.user.id)
        if (isMounted) setEmployee(emp)
      } else {
        if (isMounted) setEmployee(null)
      }

      // If a password recovery link lands on an unexpected route, redirect to /reset-password
      if (event === 'PASSWORD_RECOVERY') {
        if (typeof window !== 'undefined' && window.location.pathname !== '/reset-password') {
          window.location.href = '/reset-password'
          return
        }
      }

      setLoading(false)
    })

    return () => {
      isMounted = false
      subscription?.unsubscribe()
    }
  }, [])

  // Sign in using employee email and password
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  // Sign out the current session
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
    setSession(null)
    setEmployee(null)
  }

  // Send password recovery email with redirect to /reset-password
  const resetPassword = async (email) => {
    const redirectUrl =
      typeof window !== 'undefined' && window.location.origin
        ? `${window.location.origin}/reset-password`
        : 'https://odw-software.vercel.app/reset-password'

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    })
    if (error) throw error
    return data
  }

  // Update password for active recovery session or logged-in user
  const updatePassword = async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    if (error) throw error
    return data
  }

  const value = {
    user,
    session,
    employee,
    loading,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
