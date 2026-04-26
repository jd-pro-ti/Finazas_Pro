/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react'
import { supabase, getUserProfile, touchLastActive } from '../services/supabaseClient'
import { logger } from '../services/logger'

export const AuthContext = createContext(null)

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState(null)
  const [userStatus, setUserStatus] = useState('active')
  const [userProfile, setUserProfile] = useState(null)

  const loadUserProfile = useCallback(async (userId) => {
    try {
      const profile = await getUserProfile(userId)
      setUserProfile(profile)
      setUserRole(profile?.role || 'user')
      setUserStatus(profile?.status || 'active')
      return profile
    } catch (error) {
      console.error('Error loading user profile:', error)
      setUserProfile(null)
      setUserRole('user')
      setUserStatus('active')
      return null
    }
  }, [])

  const syncSession = useCallback((nextSession) => {
    setSession(nextSession)
    setUser(nextSession?.user ?? null)
  }, [])

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true)
      try {
        const {
          data: { session: currentSession }
        } = await supabase.auth.getSession()

        syncSession(currentSession)
        setLoading(false)

        if (currentSession?.user) {
          await loadUserProfile(currentSession.user.id)
          touchLastActive(currentSession.user.id)
        } else {
          setUserProfile(null)
          setUserRole(null)
          setUserStatus('active')
        }
      } catch (error) {
        console.error('Error getting session:', error)
        setUser(null)
        setSession(null)
        setUserProfile(null)
        setUserRole(null)
        setUserStatus('active')
        setLoading(false)
      }
    }

    initAuth()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      console.log('Auth state changed:', _event, nextSession?.user?.email)
      syncSession(nextSession)
      setLoading(false)

      if (nextSession?.user) {
        await loadUserProfile(nextSession.user.id)
        touchLastActive(nextSession.user.id)
      } else {
        setUserProfile(null)
        setUserRole(null)
        setUserStatus('active')
      }
    })

    return () => subscription.unsubscribe()
  }, [loadUserProfile, syncSession])

  const login = async (email, password) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      syncSession(data.session ?? null)
      const profile = data.user?.id ? await loadUserProfile(data.user.id) : null
      setLoading(false)

      if (profile?.status && profile.status !== 'active') {
        await supabase.auth.signOut()
        setUser(null)
        setSession(null)
        setUserProfile(null)
        setUserRole(null)
        setUserStatus(profile.status)
        return {
          success: false,
          error: profile.status === 'inactive'
            ? 'Tu cuenta está inactiva. Contacta al superadministrador.'
            : 'Tu cuenta no está activa. Contacta al superadministrador.'
        }
      }

      if (data.user?.id) {
        touchLastActive(data.user.id)
      }

      logger.info('User logged in successfully', { userId: data.user?.id, email: data.user?.email })
      return { success: true, data }
    } catch (error) {
      setLoading(false)
      logger.error('Login error', { error: error.message })
      return { success: false, error: error.message }
    }
  }

  const loginWithGoogle = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })

      if (error) throw error

      setLoading(false)
      logger.info('Google login initiated', { provider: 'google' })
      return { success: true, data }
    } catch (error) {
      setLoading(false)
      logger.error('Google login error', { error: error.message })
      return { success: false, error: error.message }
    }
  }

  const register = async (email, password, userData = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })

      if (error) throw error

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert([{
            id: data.user.id,
            email: data.user.email,
            role: 'user',
            full_name: userData.full_name || data.user.user_metadata?.full_name || '',
            avatar_url: userData.avatar_url || data.user.user_metadata?.avatar_url || null,
            ...userData
          }], {
            onConflict: 'id'
          })

        if (profileError) {
          console.error('Error creating profile:', profileError)
        }
      }

      logger.info('User registered successfully', { userId: data.user?.id, email: data.user?.email })
      return { success: true, data }
    } catch (error) {
      logger.error('Registration error', { error: error.message })
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      const userId = user?.id
      const userEmail = user?.email

      logger.info('User logging out', { userId, email: userEmail })

      const { error } = await supabase.auth.signOut()
      if (error) throw error

      setUser(null)
      setSession(null)
      setUserProfile(null)
      setUserRole(null)
      setUserStatus('active')
      localStorage.removeItem('supabase.auth.token')
      setLoading(false)

      console.log('Logout successful')
      return { success: true }
    } catch (error) {
      setLoading(false)
      console.error('Logout error:', error)
      logger.error('Logout error', { error: error.message })
      return { success: false, error: error.message }
    }
  }

  const hasRole = (requiredRole) => {
    if (userStatus !== 'active') return false
    if (!userRole) return requiredRole !== 'admin' && requiredRole !== 'superadmin'
    if (requiredRole === 'superadmin') return userRole === 'superadmin'
    if (requiredRole === 'admin') return userRole === 'admin' || userRole === 'superadmin'
    if (requiredRole === 'user') return ['user', 'admin', 'superadmin'].includes(userRole)
    return true
  }

  const isAdmin = () => userRole === 'admin' || userRole === 'superadmin'
  const isSuperAdmin = () => userRole === 'superadmin'

  const value = {
    user,
    session,
    loading,
    userRole,
    userStatus,
    userProfile,
    login,
    loginWithGoogle,
    register,
    logout,
    hasRole,
    isAdmin,
    isSuperAdmin,
    reloadProfile: async () => {
      if (!user?.id) return null
      return await loadUserProfile(user.id)
    }
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
