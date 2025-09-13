import AsyncStorage from '@react-native-async-storage/async-storage'
import { Session } from '@supabase/supabase-js'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface Profile {
  id: string
  name: string | null
  age: number | null
  breakup_date: string | null
  streak_start: string | null
  goal_days: number
  triggers: any
  challenges: any
  panic_tools: any
  motivations: any
  attachment_score: number | null
  readiness_score: number | null
  onboarding_completed: boolean | null
}

interface AuthContextType {
  session: Session | null
  profile: Profile | null
  loading: boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = async () => {
    // Always read the latest session directly to avoid stale state races
    const { data: sess } = await supabase.auth.getSession()
    const userId = sess.session?.user?.id
    console.log('refreshProfile called with session:', !!sess.session, userId)
    if (!userId) {
      console.log('No session or user ID, setting profile to null')
      setProfile(null)
      return
    }

    // Try to read the profile (maybeSingle avoids throwing when 0 rows)
    let { data, error } = await supabase
      .from('profiles')
      .select('id, name, age, breakup_date, streak_start, goal_days, triggers, challenges, panic_tools, motivations, attachment_score, readiness_score, onboarding_completed')
      .eq('id', userId)
      .maybeSingle()

    // Gracefully handle 0-rows case (PGRST116) by retrying once after a short delay
    if (!data && (error?.code === 'PGRST116' || !error)) {
      await new Promise((r) => setTimeout(r, 250))
      const retry = await supabase
        .from('profiles')
        .select('id, name, age, breakup_date, streak_start, goal_days, triggers, challenges, panic_tools, motivations, attachment_score, readiness_score, onboarding_completed')
        .eq('id', userId)
        .maybeSingle()
      data = retry.data as any
      error = retry.error as any
    }

    if (error && error.code !== 'PGRST116') {
      console.error('refreshProfile select error:', error)
    }
    setProfile((data as any) || null)

    if (!data) {
      // No profile exists yet, check if there's pending onboarding data to sync
      await syncPendingOnboardingData()
    }
  }

  const syncPendingOnboardingData = async () => {
    if (!session?.user?.id) return

    try {
      const pendingData = await AsyncStorage.getItem('pendingOnboarding')
      if (pendingData) {
        const profileData = JSON.parse(pendingData)
        
        // Save to database
        const { error } = await supabase
          .from('profiles')
          .upsert({ ...profileData, id: session.user.id })

        if (!error) {
          // Successfully synced, remove from local storage
          await AsyncStorage.removeItem('pendingOnboarding')
          // Set the profile data directly to avoid recursive call
          setProfile({ ...profileData, id: session.user.id })
        }
      }
    } catch (error) {
      console.error('Error syncing pending onboarding data:', error)
    }
  }

  useEffect(() => {
    // Timeout fallback to prevent infinite loading
    const timeout = setTimeout(() => {
      console.warn('Auth loading timeout, setting loading to false')
      setLoading(false)
    }, 5000) // 5 second timeout

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      clearTimeout(timeout)
      console.log('=== AUTH PROVIDER INIT ===')
      console.log('Initial session:', !!session, session?.user?.id)
      console.log('Session error:', error)
      setSession(session)
      if (session) {
        console.log('Session found, refreshing profile')
        refreshProfile().finally(() => setLoading(false))
      } else {
        console.log('No session found, setting loading to false')
        setLoading(false)
      }
    }).catch((error) => {
      clearTimeout(timeout)
      console.error('Auth session error:', error)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('=== AUTH STATE CHANGE ===')
      console.log('Event:', event)
      console.log('Session:', !!session, session?.user?.id)
      setSession(session)
      if (session) {
        console.log('Session restored, refreshing profile')
        refreshProfile().finally(() => setLoading(false))
      } else {
        console.log('Session lost, clearing profile')
        setProfile(null)
        setLoading(false)
      }
    })

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (session && !profile) {
      refreshProfile()
    }
  }, [session])

  return (
    <AuthContext.Provider value={{ session, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
