import React, { createContext, useContext, useEffect, useState } from 'react'
import { Session } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../lib/supabase'

interface Profile {
  id: string
  breakup_date: string | null
  streak_start: string | null
  goal_days: number
  triggers: any
  challenges: any
  panic_tools: any
  motivations: any
  attachment_score: number | null
  readiness_score: number | null
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
    if (!session?.user?.id) {
      setProfile(null)
      return
    }

    const { data } = await supabase
      .from('profiles')
      .select('id, breakup_date, streak_start, goal_days, triggers, challenges, panic_tools, motivations, attachment_score, readiness_score')
      .eq('id', session.user.id)
      .single()

    setProfile(data || null)
    
    if (!data) {
      // No profile exists, check if there's pending onboarding data to sync
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        refreshProfile()
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        refreshProfile()
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
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