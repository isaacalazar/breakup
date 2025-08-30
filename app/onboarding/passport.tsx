import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { Dimensions, StyleSheet, Text, View } from 'react-native'
import { OnboardingButton } from '../../src/components/onboarding/OnboardingButton'
import { OnboardingContainer } from '../../src/components/onboarding/OnboardingContainer'
import { useOnboardingStore } from '../../src/stores/onboardingStore'

export default function PassportScreen() {
  const store = useOnboardingStore()
  const { lastContactDate, breakupDate, selectedGoalDays, goalDays, saveProfile } = store

  const handleContinue = async () => {
    await saveProfile()
    router.replace('/(tabs)/home')
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

  return (
    <OnboardingContainer step={8} totalSteps={9} onBack={handleBack}>
      <View className="flex-1 px-8 pt-8">
        {/* Header */}
        <View className="items-center mb-12">
          <Text className="text-white text-3xl font-bold mb-4">Good News!</Text>
          <Text className="text-white/80 text-center text-base leading-6">
            We've built your profile. Your progress will be{'\n'}tracked here.
          </Text>
        </View>

        {/* Card with Gradient - tuned to brand (cyan → blue → purple) */}
        <View className="items-center mb-12">
          <CardGradient formatDate={formatDate} goalDays={(selectedGoalDays ?? parseInt(goalDays)) || 0} />
        </View>


        {/* Primary CTA (match onboarding button style) */}
        <View className="flex-1 justify-end pb-16">
          <OnboardingButton title="Next" onPress={handleContinue} />
        </View>
      </View>
    </OnboardingContainer>
  )
}

// --- Presentational gradient card extracted for clarity ---
function CardGradient({ formatDate, goalDays }: { formatDate: () => string; goalDays: number }) {
  const { width } = Dimensions.get('window')
  const cardWidth = Math.min(width - 48, 340)
  const cardHeight = Math.round(cardWidth * 1.15)

  return (
    <View style={[styles.cardShadow, { width: cardWidth, borderRadius: 26, overflow: 'hidden' }]}>      
      {/* Main vibrant gradient */}
      <LinearGradient
        colors={[ '#22D3EE', '#3B82F6', '#7C3AED' ]}
        locations={[0, 0.45, 1]}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={{ height: cardHeight - 68, padding: 24, justifyContent: 'space-between' }}
      >
        {/* Subtle highlight sweep */}
        <LinearGradient
          colors={[ 'rgba(255,255,255,0.25)', 'rgba(255,255,255,0)' ]}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Diagonal glow blob */}
        <LinearGradient
          colors={[ 'rgba(255,255,255,0.22)', 'rgba(255,255,255,0)' ]}
          style={{
            position: 'absolute',
            width: cardWidth,
            height: cardWidth,
            borderRadius: cardWidth,
            top: -cardWidth * 0.35,
            left: -cardWidth * 0.25,
            transform: [{ rotate: '25deg' }]
          }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        {/* Header logo */}
        <View className="flex-row justify-between items-start">
          <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center">
            <Text className="text-white font-bold text-base">EX</Text>
          </View>
        </View>

        {/* Main content */}
        <View>
          <Text className="text-white text-base font-medium mb-2">Active Streak</Text>
          <Text className="text-white text-5xl font-bold">0 days</Text>
        </View>
      </LinearGradient>

      {/* Bottom footer strip */}
      <LinearGradient
        colors={[ 'rgba(13,8,31,0.85)', 'rgba(13,8,31,0.95)' ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ paddingHorizontal: 24, paddingVertical: 18, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}
      >
        <View className="flex-row justify-between items-end">
          <View>
            <Text className="text-white/70 text-sm">Goal</Text>
            <Text className="text-white text-lg font-semibold">{goalDays} days</Text>
          </View>
          <View>
            <Text className="text-white/70 text-sm text-right">Free since</Text>
            <Text className="text-white text-xl font-bold">{formatDate()}</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.32,
    shadowRadius: 24,
    elevation: 14,
  },
})