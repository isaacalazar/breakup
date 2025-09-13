import { Redirect } from 'expo-router'
import { Text, View } from 'react-native'
import { useAuth } from '../src/providers/AuthProvider'
import { useSession } from '../src/providers/SessionProvider'

export default function IndexScreen() {
  const { isReady, hasSeenLanding, hasCompletedOnboarding } = useSession()
  const { session, profile } = useAuth()

  // Check onboarding completion from both database and local storage
  const isOnboardingComplete = profile?.onboarding_completed || hasCompletedOnboarding

  // Debug logging
  console.log('Index Screen - Navigation State:', {
    isReady,
    hasSeenLanding,
    hasCompletedOnboarding,
    dbOnboardingComplete: profile?.onboarding_completed,
    isOnboardingComplete,
    hasSession: !!session
  })

  // Show loading while session is being initialized
  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <Text style={{ fontSize: 18, color: '#000' }}>Loading...</Text>
      </View>
    )
  }

  // Route based on user state
  if (!hasSeenLanding) {
    console.log('Redirecting to landing page')
    return <Redirect href="/landing" />
  }

  if (!isOnboardingComplete) {
    console.log('Redirecting to onboarding')
    return <Redirect href="/onboarding" />
  }

  // Check if onboarding is complete but there's no session/profile
  // This can happen if profile save failed but was marked complete locally
  if (isOnboardingComplete && !session && !profile) {
    console.log('Onboarding marked complete but no session/profile - redirecting back to onboarding')
    return <Redirect href="/onboarding" />
  }

  // User has completed onboarding - go to main app
  console.log('Redirecting to app')
  return <Redirect href="/(tabs)" />
}
