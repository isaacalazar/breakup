import { Redirect } from 'expo-router'
import { Text, View } from 'react-native'
import { useSession } from '../src/providers/SessionProvider'
import { useAuth } from '../src/providers/AuthProvider'

export default function IndexScreen() {
  const { isReady, hasSeenLanding, hasCompletedOnboarding } = useSession()
  const { session } = useAuth()

  // Debug logging
  console.log('Index Screen - Navigation State:', {
    isReady,
    hasSeenLanding,
    hasCompletedOnboarding,
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

  if (!hasCompletedOnboarding) {
    console.log('Redirecting to onboarding')
    return <Redirect href="/onboarding" />
  }

  // User has completed onboarding - go to main app
  console.log('Redirecting to app')
  return <Redirect href="/(tabs)" />
}
