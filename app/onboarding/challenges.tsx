import { router } from 'expo-router'
import { View } from 'react-native'
import { OnboardingButton } from '../../src/components/onboarding/OnboardingButton'
import { OnboardingContainer } from '../../src/components/onboarding/OnboardingContainer'
import { QuestionHeader } from '../../src/components/onboarding/QuestionHeader'
import { SelectableList } from '../../src/components/onboarding/SelectableList'
import { useOnboardingStore } from '../../src/stores/onboardingStore'

const CHALLENGE_OPTIONS = [
  "Intrusive thoughts", "Checking socials/messages", "Sleep problems",
  "Low self-worth", "Can't focus on work/school", "Feeling isolated"
]

export default function ChallengesScreen() {
  const { challenges, toggleSelection } = useOnboardingStore()

  const handleNext = () => {
    router.push('/onboarding/motivations')
  }

  const handleBack = () => {
    router.back()
  }

  const handleChallengeSelect = (challenge: string) => {
    toggleSelection(challenge, 'challenges')
  }

  return (
    <OnboardingContainer step={5} totalSteps={12} onBack={handleBack}>
      <View className="flex-1" style={{ paddingHorizontal: 24 }}>
        <QuestionHeader
          questionNumber={6}
          title="What's hardest right now?"
        />
        
        <View style={{ marginTop: 20, flex: 1 }}>
          <SelectableList
            options={CHALLENGE_OPTIONS}
            selected={challenges}
            onSelect={handleChallengeSelect}
            multiSelect={true}
            variant="danger"
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