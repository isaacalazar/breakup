import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../src/providers/AuthProvider'
import "../global.css"

export default function PassportScreen() {
  const router = useRouter()
  const { profile } = useAuth()

  const goalDays = profile?.goal_days || 30
  const freeSince = profile?.streak_start ? new Date(profile.streak_start).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }) : '08/28/25'

  const { width } = Dimensions.get('window')
  const cardWidth = Math.min(width - 64, 340)

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient 
        colors={['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6']} 
        style={{ flex: 1 }}
      >
        {/* Sparkle decoration */}
        <View style={{
          position: 'absolute',
          top: 320,
          right: 40,
          width: 40,
          height: 40,
          zIndex: 10,
        }}>
          <Text style={{ fontSize: 32, color: '#FFD700' }}>✨</Text>
        </View>

        <SafeAreaView style={{ flex: 1 }}>
          {/* Header */}
          <View className="px-6 pt-2 pb-4">
            <View className="flex-row items-center justify-between mb-8">
              <Pressable 
                onPress={() => router.back()}
                className="w-10 h-10 bg-white/10 rounded-full items-center justify-center active:bg-white/20"
                hitSlop={8}
              >
                <Text className="text-white text-lg font-bold">←</Text>
              </Pressable>
              
              <View className="w-10 h-10" />
            </View>
            
            <View className="items-center mb-16">
              <Text className="text-white text-4xl font-bold mb-4 text-center">Good News!</Text>
              <Text className="text-white/70 text-center text-lg px-4 leading-6">
                We've built your profile. Your progress will be tracked here.
              </Text>
            </View>
          </View>

          {/* QTR Card */}
          <View className="flex-1 items-center justify-center px-6">
            <View style={[styles.cardContainer, { width: cardWidth }]}>
              <LinearGradient
                colors={['#FF4545', '#FF6B35', '#8B5CF6', '#7C3AED']}
                locations={[0, 0.4, 0.8, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}
              >
                {/* Card Header */}
                <View className="flex-row justify-between items-center mb-6">
                  <View className="w-14 h-14 bg-white rounded-full items-center justify-center" style={{ borderWidth: 2, borderColor: '#DC2626' }}>
                    <Text className="text-red-600 font-bold text-lg">QTR</Text>
                  </View>
                  <View className="w-8 h-8 bg-white/30 rounded items-center justify-center">
                    <Text className="text-white text-sm">↗</Text>
                  </View>
                </View>

                {/* Active Streak Section */}
                <View className="flex-1 justify-end pb-6">
                  <Text className="text-white/90 text-lg mb-2">Active Streak</Text>
                  <Text className="text-white text-6xl font-bold">0 days</Text>
                </View>
              </LinearGradient>
              
              {/* Bottom Dark Section */}
              <View style={styles.bottomSection}>
                <View className="flex-row justify-between items-center">
                  <Text className="text-white/80 text-sm">Free since</Text>
                  <Text className="text-white text-lg font-bold">{freeSince}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Bottom Text */}
          <View className="px-6 mb-8">
            <Text className="text-white text-xl font-semibold text-center">
              Now, let's find out why you're struggling.
            </Text>
          </View>

          {/* Continue Button */}
          <View className="px-6 pb-12">
            <Pressable
              onPress={() => router.replace('/(tabs)/home')}
              style={styles.button}
              className="bg-blue-500 py-5 rounded-2xl active:scale-95"
            >
              <Text className="text-white text-xl font-semibold text-center">
                Next
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 18,
  },
  cardGradient: {
    padding: 28,
    paddingBottom: 24,
    minHeight: 280,
  },
  bottomSection: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 20,
    paddingVertical: 18,
  },
  button: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
})