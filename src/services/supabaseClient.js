import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
})

const withTimeout = async (promise, timeoutMs = 5000) => {
  return await Promise.race([
    promise,
    new Promise((_, reject) => {
      window.setTimeout(() => reject(new Error('Supabase request timeout')), timeoutMs)
    })
  ])
}

const isMissingTableError = (error) => {
  return error?.code === 'PGRST205' || error?.message?.toLowerCase().includes('could not find the table')
}

export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await withTimeout(
      supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(),
      5000
    )

    if (error) {
      console.error('Error getting user profile:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error getting user profile:', error)
    return null
  }
}

export const getUserRole = async (userId) => {
  const profile = await getUserProfile(userId)
  return profile?.role || 'user'
}

export const touchLastActive = async (userId) => {
  try {
    await supabase
      .from('profiles')
      .update({ last_active: new Date().toISOString() })
      .eq('id', userId)
  } catch (error) {
    console.error('Error updating last_active:', error)
  }
}

export const getProfiles = async () => {
  try {
    const { data, error } = await withTimeout(
      supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false }),
      7000
    )

    if (error) {
      console.error('Error getting profiles:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error getting profiles:', error)
    return []
  }
}

export const updateProfile = async (profileId, updates) => {
  const payload = { ...updates }

  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', profileId)
    .select('*')
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

export const updateUserRole = async (profileId, role) => {
  return await updateProfile(profileId, { role })
}

export const updateUserSuspension = async (profileId, suspended) => {
  return await updateProfile(profileId, {
    status: suspended ? 'inactive' : 'active'
  })
}

export const deleteProfile = async (profileId) => {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', profileId)

  if (error) {
    throw error
  }

  return true
}

export const getTransactionsCount = async () => {
  try {
    const { count, error } = await withTimeout(
      supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true }),
      5000
    )

    if (error) {
      if (isMissingTableError(error)) return 0
      console.error('Error getting transactions count:', error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('Error getting transactions count:', error)
    return 0
  }
}

export const getSystemLogsCount = async () => {
  try {
    const { count, error } = await withTimeout(
      supabase
        .from('system_logs')
        .select('*', { count: 'exact', head: true }),
      5000
    )

    if (error) {
      if (isMissingTableError(error)) return 0
      console.error('Error getting system logs count:', error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('Error getting system logs count:', error)
    return 0
  }
}

export const getSystemLogs = async (limit = 10) => {
  try {
    const { data, error } = await withTimeout(
      supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit),
      5000
    )

    if (error) {
      if (isMissingTableError(error)) return []
      console.error('Error getting system logs:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error getting system logs:', error)
    return []
  }
}

export const getUserTransactions = async (userId, limit = 5) => {
  try {
    const { data, error } = await withTimeout(
      supabase
        .from('transactions')
        .select('id, type, symbol, amount, price, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit),
      5000
    )

    if (error) {
      if (isMissingTableError(error)) return []
      console.error('Error getting user transactions:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error getting user transactions:', error)
    return []
  }
}

export const getAdminDashboardData = async () => {
  const [profiles, transactionsCount] = await Promise.all([
    getProfiles(),
    getTransactionsCount()
  ])

  const stats = {
    totalUsers: profiles.length,
    activeUsers: profiles.filter(profile => (profile.status || 'active') === 'active').length,
    totalAdmins: profiles.filter(profile => ['admin', 'superadmin'].includes(profile.role)).length,
    suspendedUsers: profiles.filter(profile => profile.status === 'inactive').length,
    totalTransactions: transactionsCount
  }

  return { profiles, stats }
}

export const getSuperAdminDashboardData = async () => {
  const [{ profiles, stats }, systemLogs, systemLogsCount] = await Promise.all([
    getAdminDashboardData(),
    getSystemLogs(12),
    getSystemLogsCount()
  ])

  return {
    profiles,
    stats: {
      ...stats,
      systemLogsCount
    },
    systemLogs
  }
}

export const getUserDashboardData = async (userId) => {
  const [profile, transactions] = await Promise.all([
    getUserProfile(userId),
    getUserTransactions(userId)
  ])

  return {
    profile,
    transactions
  }
}

export const isUserAdmin = async (userId) => {
  const role = await getUserRole(userId)
  return role === 'admin' || role === 'superadmin'
}
