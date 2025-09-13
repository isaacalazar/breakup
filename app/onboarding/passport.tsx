import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { Alert, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native'
import { useAuth } from '../../src/providers/AuthProvider'
import { useSession } from '../../src/providers/SessionProvider'
import { signInWithGoogle } from '../../src/services/googleSignIn'
import { useOnboardingStore } from '../../src/stores/onboardingStore'
import { supabase } from '../../src/lib/supabase'

export default function PassportScreen() {
  const store = useOnboardingStore()
  const { lastContactDate, breakupDate, selectedGoalDays, goalDays, saveProfile } = store
  const { session } = useAuth()
  const { markOnboardingComplete } = useSession()

  const handleContinue = async () => {
    // Check if user is authenticated before completing onboarding
    if (!session) {
      // Trigger Google sign-in if not authenticated
      try {
        const result = await signInWithGoogle()
        
        if (result.success) {
          // Wait for session to be properly established in AuthProvider
          console.log('OAuth successful, waiting for session to be established...')
          
          // Wait for session to appear in the AuthProvider
          const waitForAuthSession = async (maxMs = 10000) => {
            const start = Date.now()
            console.log('Starting session wait...')
            while (Date.now() - start < maxMs) {
              // Refresh the session from the auth provider
              const { data, error } = await supabase.auth.getSession()
              console.log(`Session check ${Date.now() - start}ms:`, {
                hasSession: !!data.session,
                hasUser: !!data.session?.user,
                userId: data.session?.user?.id,
                error: error?.message
              })
              if (data.session?.user) {
                console.log('Session established, user:', data.session.user.id)
                return true
              }
              await new Promise(resolve => setTimeout(resolve, 500))
            }
            console.log('Session wait timed out after', maxMs, 'ms')
            return false
          }
          
          const sessionEstablished = await waitForAuthSession()
          if (sessionEstablished) {
            console.log('Attempting to save profile after session establishment...')
            const ok = await saveProfile()
            if (!ok) return
          } else {
            Alert.alert('Error', 'Failed to establish session after sign in. Please try again.')
          }
        } else {
          Alert.alert('Sign In Required', result.error || 'Please sign in to complete your profile')
        }
      } catch (error: any) {
        console.error('Google Sign-In error:', error)
        Alert.alert('Error', 'An unexpected error occurred during sign in')
      }
      return
    }
    const ok = await saveProfile()
    if (!ok) return
  }

  const handleBack = () => {
    router.back()
  }

  const formatDate = () => {
    const date = lastContactDate || breakupDate
    return date ? new Date(date).toLocaleDateString('en-US', { 
      month: '2-digit', 
      day: '2-digit',
      year: '2-digit' 
    }) : '02/25'
  }

  const { width } = Dimensions.get('window')
  const cardWidth = Math.min(width - 60, 320)
  const cardHeight = cardWidth * 1.25

  return (
    <LinearGradient 
      colors={['#2D1B69', '#1E0A3C', '#0A0617']}
      style={{ flex: 1 }}
    >
      {/* Header */}
      <View className="pt-14 px-6">
        <Pressable onPress={handleBack} className="mb-10">
          <Ionicons name="chevron-back" size={26} color="white" />
        </Pressable>
        
        <View className="items-center mb-10">
          <Text style={styles.headerTitle}>Good News!</Text>
          <Text style={styles.headerSubtitle}>
            We've built your profile. Your progress will be{'\n'}tracked here.
          </Text>
        </View>
      </View>

      {/* Card Container */}
      <View className="flex-1 items-center justify-center px-7">
        <View className="relative">
          {/* Star decoration */}
          <View className="absolute -top-3 -right-3 z-10">
            <Text style={{ fontSize: 36 }}>✨</Text>
          </View>

          {/* Passport Card */}
          <View style={[styles.cardContainer, { width: cardWidth, height: cardHeight }]}>
            {/* Gradient Section */}
            <LinearGradient
              colors={['#FF6B35', '#FF4E7C', '#B73AED']}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={[styles.cardGradient, { height: cardHeight - 75 }]}
            >
              {/* Card Header Icons */}
              <View className="flex-row justify-between items-start">
                <View style={styles.iconContainer}>
                  <Text style={styles.iconText}>EX</Text>
                </View>
                <View style={styles.profileIcon}>
                  <Ionicons name="person-outline" size={18} color="white" />
                </View>
              </View>

              {/* Main Content */}
              <View className="flex-1 justify-end pb-5">
                <Text style={styles.streakLabel}>Active Streak</Text>
                <View className="flex-row items-baseline">
                  <Text style={styles.streakNumber}>0</Text>
                  <Text style={styles.streakDays}> days</Text>
                </View>
              </View>
            </LinearGradient>

            {/* Bottom Dark Section */}
            <View style={styles.bottomSection}>
              <View className="flex-row justify-end items-center">
                <View className="items-end">
                  <Text style={styles.dateLabel}>Free since</Text>
                  <Text style={styles.dateValue}>{formatDate()}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>


      {/* Next Button */}
      <View className="px-6 pb-10">
        <Pressable
          onPress={handleContinue}
          style={[styles.button, styles.buttonShadow]}
          className="active:scale-98"
        >
          <Text style={styles.buttonText}>Next</Text>
        </Pressable>
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  // Header Styles
  headerTitle: {
    color: 'white',
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '400',
  },
  
  // Card Styles
  cardContainer: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#2a2a2a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 12,
  },
  cardGradient: {
    padding: 22,
  },
  
  // Icon Styles
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  profileIcon: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Streak Styles
  streakLabel: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  streakNumber: {
    color: 'white',
    fontSize: 56,
    fontWeight: '700',
    letterSpacing: -1,
    lineHeight: 56,
  },
  streakDays: {
    color: 'white',
    fontSize: 24,
    fontWeight: '400',
    marginLeft: 4,
  },
  
  // Bottom Section Styles
  bottomSection: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 22,
    paddingVertical: 18,
    height: 75,
    justifyContent: 'center',
  },
  dateLabel: {
    color: '#888',
    fontSize: 13,
    fontWeight: '400',
    marginBottom: 3,
  },
  dateValue: {
    color: 'white',
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  
  // Bottom Text Style
  bottomText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  
  // Button Styles
  button: {
    backgroundColor: '#0084FF',
    paddingVertical: 16,
    borderRadius: 28,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  buttonShadow: {
    shadowColor: '#0084FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
})
