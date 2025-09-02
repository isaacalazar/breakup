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
  saveProfile: () => Promise<void>
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
      breakup_date: state.breakupDate,
      streak_start,
      goal_days: goalDaysValue,
      triggers: JSON.stringify(state.triggers),
      challenges: JSON.stringify(state.challenges),
      panic_tools: JSON.stringify(state.panicTools),
      motivations: JSON.stringify(state.motivations),
      attachment_score,
      readiness_score,
    }

    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // User is logged in - save to database
      const { error } = await supabase
        .from('profiles')
        .upsert({ ...profileData, id: user.id })

      if (error) {
        Alert.alert('Error', error.message)
        return
      }
    } else {
      // No user - store locally for later sync
      await AsyncStorage.setItem('pendingOnboarding', JSON.stringify(profileData))
    }

    // Mark onboarding as complete
    await AsyncStorage.setItem('hasCompletedOnboarding', 'true')
    
    // Navigate to home page
    router.replace('/(tabs)')
  },

  reset: () => set(initialState)
}))