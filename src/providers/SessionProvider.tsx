import React, { createContext, useContext, useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAuth } from './AuthProvider'

interface SessionContextType {
  isReady: boolean
  hasSeenLanding: boolean
  hasCompletedOnboarding: boolean
  markLandingSeen: () => Promise<void>
  markOnboardingComplete: () => Promise<void>
  resetSessionState: () => Promise<void>
}

const SessionContext = createContext<SessionContextType | null>(null)

export function useSession() {
  const value = useContext(SessionContext)
  if (!value) {
    throw new Error('useSession must be wrapped in a <SessionProvider />')
  }
  return value
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { loading: authLoading } = useAuth()
  const [isReady, setIsReady] = useState(false)
  const [hasSeenLanding, setHasSeenLanding] = useState(false)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false)

  useEffect(() => {
    const initializeSession = async () => {
      try {
        // For development: Always start fresh on landing page
        // Remove these lines in production if you want to persist user progress
        await Promise.all([
          AsyncStorage.removeItem('hasSeenLanding'),
          AsyncStorage.removeItem('hasCompletedOnboarding')
        ])
        
        const [landing, onboarding] = await Promise.all([
          AsyncStorage.getItem('hasSeenLanding'),
          AsyncStorage.getItem('hasCompletedOnboarding')
        ])
        
        console.log('SessionProvider - AsyncStorage values:', {
          hasSeenLanding: landing,
          hasCompletedOnboarding: onboarding
        })
        
        const seenLanding = landing === 'true'
        const completedOnboarding = onboarding === 'true'
        
        console.log('SessionProvider - Setting state:', {
          hasSeenLanding: seenLanding,
          hasCompletedOnboarding: completedOnboarding
        })
        
        setHasSeenLanding(seenLanding)
        setHasCompletedOnboarding(completedOnboarding)
      } catch (error) {
        console.error('Error initializing session:', error)
      } finally {
        setIsReady(true)
      }
    }

    if (!authLoading) {
      initializeSession()
    }
  }, [authLoading])

  const markLandingSeen = async () => {
    await AsyncStorage.setItem('hasSeenLanding', 'true')
    setHasSeenLanding(true)
  }

  const markOnboardingComplete = async () => {
    await AsyncStorage.setItem('hasCompletedOnboarding', 'true')
    setHasCompletedOnboarding(true)
  }

  const resetSessionState = async () => {
    await Promise.all([
      AsyncStorage.removeItem('hasSeenLanding'),
      AsyncStorage.removeItem('hasCompletedOnboarding')
    ])
    setHasSeenLanding(false)
    setHasCompletedOnboarding(false)
  }

  return (
    <SessionContext.Provider
      value={{
        isReady: isReady && !authLoading,
        hasSeenLanding,
        hasCompletedOnboarding,
        markLandingSeen,
        markOnboardingComplete,
        resetSessionState,
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}