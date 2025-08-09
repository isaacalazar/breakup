import AsyncStorage from '@react-native-async-storage/async-storage'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import "../global.css"

export default function LandingScreen() {

  const markLandingSeen = async () => {
    await AsyncStorage.setItem('hasSeenLanding', 'true')
  }

  const handleSignUp = async () => {
    await markLandingSeen()
    router.push('/(auth)/sign-up')
  }

  const handleSignIn = async () => {
    await markLandingSeen()
    router.push('/(auth)/sign-in')
  }

  const handleSkip = async () => {
    await markLandingSeen()
    router.replace('/onboarding')
  }

  return (
    <LinearGradient 
      colors={['#2D1B69', '#1E0A3C', '#0A0617']} 
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1">
        <View className="flex-1 px-8">
          {/* Brand */}
          <View className="items-center pt-16 mb-16">
            <Text className="text-white text-5xl font-bold">exhale</Text>
          </View>

          {/* Main Content */}
          <View className="flex-1 justify-center px-4">
            <Text className="text-white text-6xl font-black mb-8 leading-tight">
              Welcome!
            </Text>
            <Text className="text-white/90 text-xl leading-relaxed mb-12">
              Let&apos;s start by finding what support you need most right now
            </Text>
            
            {/* Rating */}
            <View className="flex-row items-center mb-8">
              <Text className="text-white/90 text-2xl">🕊️ ⭐⭐⭐⭐⭐ 🕊️</Text>
            </View>
          </View>

          {/* CTA Button */}
          <View className="pb-12">
            <Pressable 
              onPress={handleSignUp} 
              className="bg-white rounded-full py-5 px-8 flex-row items-center justify-center"
            >
              <Text className="text-brand text-xl font-bold mr-2">Start Your Journey</Text>
              <View className="w-6 h-6 items-center justify-center">
                <Text className="text-brand text-xl font-bold">→</Text>
              </View>
            </Pressable>

            {/* Secondary Actions */}
            <View className="items-center mt-6 space-y-3">
              <Pressable onPress={handleSignIn} className="py-3">
                <Text className="text-white/80 text-base">Already have an account? Sign in</Text>
              </Pressable>

              <Pressable onPress={handleSkip} className="py-2">
                <Text className="text-white/60 text-sm">Continue without account</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}