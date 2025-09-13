import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from 'expo-router'
import { Alert } from 'react-native'
import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { combineLocalDateTimeToUTC } from '../utils/date'

export interface OnboardingData {
  gender: string
  name: string
  age: string
  breakupDate: string
  lastContactDate: string
  lastContactTime: string
  lastContactPreset: 'same' | 'today' | 'yesterday' | 'week' | 'month' | 'year' | 'custom'
  goalDays: string
  selectedGoalDays: number | null
  triggers: string[]
  challenges: string[]
  panicTools: string[]
  motivations: string[]
  readiness: string
  attachment: string
}

interface OnboardingStore extends OnboardingData {
  updateData: (updates: Partial<OnboardingData>) => void
  toggleSelection: (item: string, field: keyof Pick<OnboardingData, 'triggers' | 'challenges' | 'panicTools' | 'motivations'>) => void
  saveProfile: () => Promise<boolean>
  reset: () => void
}

const initialState: OnboardingData = {
  gender: '',
  name: '',
  age: '',
  breakupDate: '',
  lastContactDate: '',
  lastContactTime: '',
  lastContactPreset: 'same',
  goalDays: '',
  selectedGoalDays: 30,
  triggers: [],
  challenges: [],
  panicTools: [],
  motivations: [],
  readiness: '5',
  attachment: '5'
}

export const useOnboardingStore = create<OnboardingStore>((set, get) => ({
  ...initialState,

  updateData: (updates) => set((state) => ({ ...state, ...updates })),

  toggleSelection: (item, field) => set((state) => {
    const array = state[field] as string[]
    if (array.includes(item)) {
      return { ...state, [field]: array.filter(i => i !== item) }
    } else {
      return { ...state, [field]: [...array, item] }
    }
  }),

  saveProfile: async () => {
    const state = get()
    
    // Resolve last-contact date based on preset or custom input
    const toISODate = (d: Date) => d.toISOString().slice(0, 10)
    const addDays = (d: Date, days: number) => {
      const copy = new Date(d)
      copy.setDate(copy.getDate() + days)
      return copy
    }
    const addMonths = (d: Date, months: number) => {
      const copy = new Date(d)
      copy.setMonth(copy.getMonth() + months)
      return copy
    }
    const addYears = (d: Date, years: number) => {
      const copy = new Date(d)
      copy.setFullYear(copy.getFullYear() + years)
      return copy
    }

    const today = new Date()
    const presetDate =
      state.lastContactPreset === 'week' ? toISODate(addDays(today, -7)) :
      state.lastContactPreset === 'month' ? toISODate(addMonths(today, -1)) :
      state.lastContactPreset === 'year' ? toISODate(addYears(today, -1)) :
      ''

    const effectiveLastContactDate = state.lastContactPreset === 'custom' ? state.lastContactDate : (state.lastContactPreset === 'same' ? '' : presetDate)

    const streak_start = combineLocalDateTimeToUTC(effectiveLastContactDate || state.breakupDate, state.lastContactTime || '09:00')
    const attachment_score = parseInt(state.attachment) * 10
    const readiness_score = parseInt(state.readiness) * 10

    const goalDaysValue = state.selectedGoalDays ?? parseInt(state.goalDays)

    const profileData = {
      name: state.name?.trim() || null,
      age: state.age ? parseInt(state.age) : null,
      breakup_date: state.breakupDate,
      streak_start,
      goal_days: goalDaysValue,
      triggers: state.triggers,
      challenges: state.challenges,
      panic_tools: state.panicTools,
      motivations: state.motivations,
      attachment_score,
      readiness_score,
      onboarding_completed: true,
    }

    // Ensure authenticated session before writing profile (handle race after OAuth)
    const waitForSession = async (maxMs: number = 10000, intervalMs: number = 500) => {
      console.log('Waiting for session establishment...')
      const start = Date.now()
      while (Date.now() - start < maxMs) {
        const { data, error } = await supabase.auth.getSession()
        console.log(`Session check ${Date.now() - start}ms: session=${!!data.session}, user=${data.session?.user?.id}, error=${error?.message}`)
        const user = data.session?.user
        if (user) {
          console.log('Session found!', user.id)
          return user
        }
        await new Promise(res => setTimeout(res, intervalMs))
      }
      console.log('Session wait timeout after', maxMs, 'ms')
      return null
    }

    console.log('=== SAVE PROFILE START ===')
    let { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    console.log('Initial session check:', !!sessionData.session, sessionData.session?.user?.id, sessionError)
    
    let user = sessionData.session?.user || null
    if (!user && !sessionError) {
      console.log('No user found, waiting for session...')
      user = await waitForSession()
      console.log('After waiting for session:', !!user, user?.id)
    }

    if (sessionError || !user) {
      console.error('=== AUTHENTICATION FAILED ===')
      console.error('Session error:', sessionError)
      console.error('User:', user)
      Alert.alert('Authentication Error', 'Please sign in before saving your profile.')
      return false
    }

    if (user) {
      // User is logged in - save to database
      console.log('Saving profile data:', { ...profileData, id: user.id })
      
      const { data, error } = await supabase
        .from('profiles')
        .upsert({ ...profileData, id: user.id })
        .select()

      if (error) {
        console.error('=== PROFILE SAVE ERROR DETAILS ===')
        console.error('Error message:', error.message)
        console.error('Error details:', error.details)
        console.error('Error hint:', error.hint)
        console.error('Error code:', error.code)
        console.error('User ID:', user.id)
        console.error('Profile data:', profileData)
        Alert.alert('Profile Save Error', `${error.message}\n\nCheck console for details`)
        return false // Don't mark as complete if save failed
      }
      
      console.log('Profile saved successfully:', data)
      
      // Only mark onboarding as complete if save succeeded
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true')
      
      // Navigate to home page
      router.replace('/(tabs)/home')
      return true
    } else {
      console.log('No user found, storing locally for later sync')
      // No user - store locally for later sync
      await AsyncStorage.setItem('pendingOnboarding', JSON.stringify(profileData))
      
      // Mark onboarding as complete for local storage case
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true')
      
      // Navigate to home page
      router.replace('/(tabs)/home')
      return true
    }
  },

  reset: () => set(initialState)
}))
