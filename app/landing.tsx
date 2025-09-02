import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { Alert, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSession } from '../src/providers/SessionProvider'
import { signInWithGoogle } from '../src/services/googleSignIn'
import "../global.css"

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
        {/* Background Highlights */}
        <View style={{
          position: 'absolute',
          top: 120,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: 100,
          backgroundColor: 'rgba(255,255,255,0.03)',
        }} />
        <View style={{
          position: 'absolute',
          top: 300,
          left: -80,
          width: 160,
          height: 160,
          borderRadius: 80,
          backgroundColor: 'rgba(255,255,255,0.02)',
        }} />
        <View style={{
          position: 'absolute',
          bottom: 200,
          right: 20,
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: 'rgba(124,58,237,0.1)',
        }} />

        {/* Subtle dots */}
        <View style={{ position: 'absolute', top: 150, left: 80, width: 3, height: 3, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 1.5 }} />
        <View style={{ position: 'absolute', top: 200, right: 120, width: 2, height: 2, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 1 }} />
        <View style={{ position: 'absolute', top: 350, left: 60, width: 2, height: 2, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 1 }} />
        <View style={{ position: 'absolute', bottom: 300, left: 40, width: 3, height: 3, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 1.5 }} />

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
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              {/* Hero Section */}
              <View style={{ alignItems: 'center', marginBottom: 80 }}>
                <Text style={{ 
                  color: 'white', 
                  fontSize: 48, 
                  fontWeight: '900',
                  textAlign: 'center',
                  marginBottom: 20,
                  lineHeight: 52
                }}>
                  Welcome!
                </Text>
                <Text style={{ 
                  color: 'rgba(255,255,255,0.8)', 
                  fontSize: 18,
                  textAlign: 'center',
                  lineHeight: 26,
                  paddingHorizontal: 20
                }}>
                  Let's start by finding what support you need most right now
                </Text>
              </View>

              {/* Social Proof */}
              <View style={{ marginBottom: 80 }}>
                <Text style={{ 
                  color: 'rgba(255,255,255,0.6)', 
                  fontSize: 16, 
                  textAlign: 'center' 
                }}>
                  🕊️ ⭐⭐⭐⭐⭐ 🕊️
                </Text>
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
              <Text style={{ color: 'white', fontSize: 16, marginRight: 12 }}>🍎</Text>
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
              <Text style={{ color: 'white', fontSize: 16, marginRight: 12 }}>G</Text>
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