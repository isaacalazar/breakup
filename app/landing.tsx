import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { Alert, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import "../global.css"
import { useSession } from '../src/providers/SessionProvider'
import { signInWithGoogle } from '../src/services/googleSignIn'

export default function LandingScreen() {
  const { markLandingSeen } = useSession()

  const handleAppleSignIn = async () => {
    await markLandingSeen()
    // TODO: Implement Apple Sign In
    Alert.alert('Coming Soon', 'Apple Sign-In will be available soon!')
  }

  const handleGoogleSignIn = async () => {
    try {
      await markLandingSeen()
      
      const result = await signInWithGoogle()
      
      if (result.success) {
        // Navigate to home after successful sign in
        router.replace('/(tabs)/home')
      } else {
        Alert.alert('Sign In Failed', result.error || 'Failed to sign in with Google')
      }
    } catch (error: any) {
      console.error('Google Sign-In error:', error)
      Alert.alert('Error', 'An unexpected error occurred during sign in')
    }
  }

  const handleSkip = async () => {
    await markLandingSeen()
    router.replace('/onboarding')
  }

  const handleSignIn = async () => {
    await markLandingSeen()
    router.push('/(auth)/sign-in')
  }

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient 
        colors={['#2D1B69', '#1E0A3C', '#0A0617']} 
        style={{ flex: 1 }}
      >
        {/* Bottom gradient overlay for button area */}
        <LinearGradient
          colors={['transparent', 'rgba(16, 8, 28, 0.8)', '#100820']}
          locations={[0, 0.7, 1]}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 200,
          }}
        />
        {/* Background Orb - QUITTR Style */}
        <View style={{
          position: 'absolute',
          top: '30%',
          right: -100,
          width: 300,
          height: 300,
          borderRadius: 150,
          backgroundColor: 'rgba(124,58,237,0.15)',
          transform: [{ scale: 1.5 }]
        }} />

        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ flex: 1, paddingHorizontal: 32, paddingTop: 40 }}>
            {/* Brand Logo */}
            <View style={{ alignItems: 'center', marginBottom: 60 }}>
              <Text style={{ 
                color: 'white', 
                fontSize: 42, 
                fontWeight: '800',
                letterSpacing: -1
              }}>
                exhale
              </Text>
            </View>

            {/* Main Content */}
            <View style={{ flex: 1, justifyContent: 'center' }}>
              {/* Hero Section */}
              <View style={{ marginBottom: 60 }}>
                <Text style={{ 
                  color: 'white', 
                  fontSize: 42, 
                  fontWeight: '800',
                  marginBottom: 24,
                  lineHeight: 48
                }}>
                  Welcome!
                </Text>
                <Text style={{ 
                  color: 'rgba(255,255,255,0.75)', 
                  fontSize: 18,
                  lineHeight: 28,
                  fontWeight: '400'
                }}>
                  Let's start by finding out if{'\n'}you need support with your{'\n'}healing journey
                </Text>
              </View>

              {/* Social Proof - QUITTR Style */}
              <View style={{ marginBottom: 60 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 20 }}>🕊️</Text>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Text key={star} style={{ fontSize: 16 }}>⭐</Text>
                  ))}
                  <Text style={{ fontSize: 20 }}>🕊️</Text>
                </View>
              </View>
            </View>

          {/* CTA Buttons */}
          <View style={{ paddingBottom: 40 }}>
            {/* Apple Sign In */}
            <Pressable 
              onPress={handleAppleSignIn} 
              style={{
                backgroundColor: 'transparent',
                borderRadius: 25,
                paddingVertical: 16,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.3)',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Ionicons name="logo-apple" size={20} color="white" style={{ marginRight: 12 }} />
              <Text style={{ 
                color: 'white', 
                fontSize: 16, 
                fontWeight: '500' 
              }}>
                Continue with Apple
              </Text>
            </Pressable>

            {/* Google Sign In */}
            <Pressable 
              onPress={handleGoogleSignIn} 
              style={{
                backgroundColor: 'transparent',
                borderRadius: 25,
                paddingVertical: 16,
                marginBottom: 32,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.3)',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Ionicons name="logo-google" size={20} color="white" style={{ marginRight: 12 }} />
              <Text style={{ 
                color: 'white', 
                fontSize: 16, 
                fontWeight: '500' 
              }}>
                Continue with Google
              </Text>
            </Pressable>

            {/* Start Quiz Button */}
            <Pressable 
              onPress={handleSkip} 
              style={{
                backgroundColor: 'white',
                borderRadius: 25,
                paddingVertical: 16,
                marginBottom: 24,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 24,
                shadowColor: 'rgba(0,0,0,0.1)',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.8,
                shadowRadius: 8,
                elevation: 5
              }}
            >
              <Text style={{ 
                color: 'black', 
                fontSize: 16, 
                fontWeight: '600',
                marginRight: 8
              }}>
                Start Quiz
              </Text>
              <View style={{
                backgroundColor: 'black',
                borderRadius: 12,
                width: 24,
                height: 24,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Text style={{ color: 'white', fontSize: 12, marginLeft: 1 }}>▶</Text>
              </View>
            </Pressable>

            {/* Bottom Link */}
            <View style={{ alignItems: 'center' }}>
              <Pressable>
                <Text style={{ 
                  color: 'rgba(255,255,255,0.5)', 
                  fontSize: 14
                }}>
                  I have a code
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
    </View>
  )
}