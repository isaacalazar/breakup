import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Pressable, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '../../src/lib/supabase'
import { useAuth } from '../../src/providers/AuthProvider'
import { daysBetweenUTC } from '../../src/utils/date'

export default function HomeScreen() {
  const { profile, refreshProfile, session } = useAuth()
  const router = useRouter()
  const [localProfile, setLocalProfile] = useState(null)

  useEffect(() => {
    if (!session && !profile) {
      loadLocalProfile()
    }
  }, [session, profile])

  const loadLocalProfile = async () => {
    try {
      const pendingData = await AsyncStorage.getItem('pendingOnboarding')
      if (pendingData) {
        setLocalProfile(JSON.parse(pendingData))
      }
    } catch (error) {
      console.error('Error loading local profile:', error)
    }
  }

  const activeProfile = profile || localProfile
  
  const currentStreakDays = activeProfile?.streak_start 
    ? (() => {
        const streakStart = new Date(activeProfile.streak_start)
        const now = new Date()
        const days = daysBetweenUTC(streakStart, now)
        if (__DEV__) {
          console.log('Streak calculation:', {
            streakStart: streakStart.toISOString(),
            now: now.toISOString(),
            days,
            activeProfile
          })
        }
        return days
      })()
    : 0

  const resetStreak = async () => {
    const newStreakStart = new Date().toISOString()
    
    if (session && profile) {
      // User is logged in - update database
      await supabase
        .from('profiles')
        .update({ streak_start: newStreakStart })
        .eq('id', profile.id)
      refreshProfile()
    } else if (localProfile && typeof localProfile === 'object' && localProfile !== null) {
      // User not logged in - update local storage
      const updatedProfile = Object.assign({}, localProfile, { streak_start: newStreakStart });
      await AsyncStorage.setItem('pendingOnboarding', JSON.stringify(updatedProfile));
      setLocalProfile(updatedProfile);
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
    } finally {
      await AsyncStorage.removeItem('pendingOnboarding')
      router.replace('/landing')
    }
  }

  if (!activeProfile) {
    return (
      <SafeAreaView style={{ flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 18, marginBottom: 20, textAlign: 'center' }}>
          No profile data found. Please complete onboarding first.
        </Text>
        <Pressable
          onPress={() => router.push('/onboarding')}
          style={{ backgroundColor: '#007AFF', padding: 15, borderRadius: 8 }}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>Go to Onboarding</Text>
        </Pressable>
      </SafeAreaView>
    )
  }


  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black p-5">
      <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-5">Your Streak</Text>

      <Text className="text-5xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">{currentStreakDays} days</Text>
      <Text className="text-gray-600 dark:text-gray-300 mb-8">Goal: {activeProfile?.goal_days} days</Text>

      <Pressable onPress={resetStreak} className="rounded-xl bg-blue-600 px-4 py-3 mb-3">
        <Text className="text-white text-center font-semibold">Reset Streak</Text>
      </Pressable>

      <Pressable onPress={() => router.push('/panic')} className="rounded-xl bg-red-600 px-4 py-3 mb-3">
        <Text className="text-white text-center font-semibold">Panic</Text>
      </Pressable>

      <Pressable onPress={signOut} className="rounded-xl bg-gray-500 px-4 py-3">
        <Text className="text-white text-center font-semibold">Sign Out</Text>
      </Pressable>
    </SafeAreaView>
  )
}