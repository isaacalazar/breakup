import { router } from 'expo-router'
import { View } from 'react-native'
import { OnboardingButton } from '../../src/components/onboarding/OnboardingButton'
import { OnboardingContainer } from '../../src/components/onboarding/OnboardingContainer'
import { QuestionHeader } from '../../src/components/onboarding/QuestionHeader'
import { SelectableList } from '../../src/components/onboarding/SelectableList'
import { useOnboardingStore } from '../../src/stores/onboardingStore'

const TRIGGER_OPTIONS = [
  "Lonely", "Anxious/Spiraling", "Bored/Scrolling", "Late at night",
  "After drinking", "Seeing their posts"
]

export default function TriggersScreen() {
  const { triggers, toggleSelection } = useOnboardingStore()

  const handleNext = () => {
    router.push('/onboarding/challenges')
  }

  const handleBack = () => {
    router.back()
  }

  const handleTriggerSelect = (trigger: string) => {
    toggleSelection(trigger, 'triggers')
  }

  return (
    <OnboardingContainer step={4} totalSteps={12} onBack={handleBack}>
      <View className="flex-1" style={{ paddingHorizontal: 24 }}>
        <QuestionHeader
          questionNumber={5}
          title="What triggers your urge to reach out?"
        />
        
        <View style={{ marginTop: 20, flex: 1 }}>
          <SelectableList
            options={TRIGGER_OPTIONS}
            selected={triggers}
            onSelect={handleTriggerSelect}
            multiSelect={true}
          />
        </View>
      </View>

      <View style={{ paddingHorizontal: 24, paddingBottom: 32 }}>
        <OnboardingButton
          title="Next"
          onPress={handleNext}
        />
      </View>
    </OnboardingContainer>
  )
}