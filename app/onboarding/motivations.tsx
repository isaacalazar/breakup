import { router } from 'expo-router'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { OnboardingButton } from '../../src/components/onboarding/OnboardingButton'
import { OnboardingContainer } from '../../src/components/onboarding/OnboardingContainer'
import { QuestionHeader } from '../../src/components/onboarding/QuestionHeader'
import { useOnboardingStore } from '../../src/stores/onboardingStore'

const MOTIVATION_OPTIONS = [
  {
    id: "stronger-relationships",
    label: "Stronger relationships",
    icon: "❤️",
    color: "#dc2626",
    gradient: ["#dc2626", "#b91c1c"]
  },
  {
    id: "self-confidence",
    label: "Improved self-confidence",
    icon: "👤",
    color: "#2563eb",
    gradient: ["#2563eb", "#1d4ed8"]
  },
  {
    id: "mood-happiness",
    label: "Improved mood and happiness",
    icon: "😊",
    color: "#eab308",
    gradient: ["#eab308", "#ca8a04"]
  },
  {
    id: "energy-motivation",
    label: "More energy and motivation",
    icon: "⚡",
    color: "#ea580c",
    gradient: ["#ea580c", "#c2410c"]
  },
  {
    id: "libido-sex-life",
    label: "Improved libido and sex life",
    icon: "🔥",
    color: "#dc2626",
    gradient: ["#dc2626", "#b91c1c"]
  },
  {
    id: "self-control",
    label: "Improved self-control",
    icon: "🧠",
    color: "#0891b2",
    gradient: ["#0891b2", "#0e7490"]
  },
  {
    id: "focus-clarity",
    label: "Improved focus and clarity",
    icon: "🌀",
    color: "#7c3aed",
    gradient: ["#7c3aed", "#6d28d9"]
  }
]

export default function MotivationsScreen() {
  const { motivations, toggleSelection } = useOnboardingStore()

  const handleNext = () => {
    router.push('/onboarding/scales')
  }

  const handleBack = () => {
    router.back()
  }

  const handleMotivationSelect = (motivationId: string) => {
    toggleSelection(motivationId, 'motivations')
  }

  const isSelected = (motivationId: string) => {
    return Array.isArray(motivations) && motivations.includes(motivationId)
  }

  return (
    <OnboardingContainer step={6} totalSteps={12} onBack={handleBack}>
      <View className="flex-1" style={{ paddingHorizontal: 24 }}>
        <QuestionHeader
          questionNumber={7}
          title="Choose your goals"
          subtitle="Select the goals you wish to track during your reboot"
        />
        
        <ScrollView 
          style={{ flex: 1 }} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {MOTIVATION_OPTIONS.map((motivation) => {
            const selected = isSelected(motivation.id)
            return (
              <Pressable
                key={motivation.id}
                onPress={() => handleMotivationSelect(motivation.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 14,
                  paddingHorizontal: 18,
                  borderRadius: 14,
                  backgroundColor: selected ? motivation.color : 'rgba(255,255,255,0.06)',
                  borderWidth: 1.5,
                  borderColor: selected ? motivation.color : 'rgba(255,255,255,0.18)',
                  marginBottom: 10,
                  shadowColor: selected ? motivation.color : 'transparent',
                  shadowOpacity: selected ? 0.3 : 0,
                  shadowRadius: 6,
                  shadowOffset: { width: 0, height: 3 },
                  elevation: selected ? 3 : 0
                }}
              >
                {/* Icon */}
                <Text style={{ 
                  fontSize: 22, 
                  marginRight: 14,
                  opacity: selected ? 1 : 0.8
                }}>
                  {motivation.icon}
                </Text>

                {/* Label */}
                <Text style={{
                  flex: 1,
                  fontSize: 16,
                  fontWeight: selected ? '700' : '600',
                  color: selected ? '#FFFFFF' : 'rgba(255,255,255,0.92)',
                  lineHeight: 20
                }}>
                  {motivation.label}
                </Text>

                {/* Selection Indicator */}
                <View style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: selected ? '#FFFFFF' : 'rgba(255,255,255,0.1)',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  {selected && (
                    <Text style={{ fontSize: 14, color: motivation.color, fontWeight: 'bold' }}>✓</Text>
                  )}
                </View>
              </Pressable>
            )
          })}
        </ScrollView>
      </View>

      <View style={{ paddingHorizontal: 24, paddingBottom: 32 }}>
        <OnboardingButton
          title="Track these goals"
          onPress={handleNext}
        />
      </View>
    </OnboardingContainer>
  )
}