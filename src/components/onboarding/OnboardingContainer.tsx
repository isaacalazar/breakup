import { LinearGradient } from 'expo-linear-gradient'
import { ReactNode } from 'react'
import { Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

interface OnboardingContainerProps {
  children: ReactNode
  step: number
  totalSteps: number
  onBack?: () => void
  showBackButton?: boolean
}

export function OnboardingContainer({
  children,
  step,
  totalSteps,
  onBack,
  showBackButton = true
}: OnboardingContainerProps) {
  return (
    <LinearGradient 
      colors={['#2D1B69', '#1E0A3C', '#0A0617']} 
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1" style={{ overflow: 'hidden' }}>
        <View className="px-6 pt-1 pb-2">
          <View className="flex-row items-center justify-between">
            {showBackButton ? (
              <Pressable 
                onPress={onBack}
                className="w-10 h-10 items-center justify-center rounded-full bg-white/10 active:bg-white/20"
                hitSlop={8}
              >
                <Text className="text-white text-lg font-bold">←</Text>
              </Pressable>
            ) : (
              <View className="w-10 h-10" />
            )}
            
            {/* Progress indicator */}
            <View className="flex-1 ml-6 h-2 bg-white/15 rounded-full overflow-hidden">
              <View 
                className="h-full bg-cyan-400 transition-all duration-500 ease-out"
                style={{
                  width: (() => {
                    const isFinal = step >= (totalSteps - 1)
                    if (isFinal) return '100%'
                    const capped = Math.min(step, 3)
                    return `${(capped / 4) * 100}%`
                  })()
                }}
              />
            </View>
            
            <View className="w-10 h-10" />
          </View>
        </View>

        <View className="flex-1" style={{ overflow: 'hidden' }}>
          {children}
        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}