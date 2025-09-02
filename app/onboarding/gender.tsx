import { router } from 'expo-router'
import { View } from 'react-native'
import { OnboardingButton } from '../../src/components/onboarding/OnboardingButton'
import { OnboardingContainer } from '../../src/components/onboarding/OnboardingContainer'
import { QuestionHeader } from '../../src/components/onboarding/QuestionHeader'
import { SelectableList } from '../../src/components/onboarding/SelectableList'
import { useOnboardingStore } from '../../src/stores/onboardingStore'

const GENDER_OPTIONS = [
  'Woman',
  'Man',
]

export default function GenderScreen() {
  const { gender, updateData } = useOnboardingStore()

  const isValid = !!gender

  const handleNext = () => {
    router.push('/onboarding/breakup-date')
  }

  const handleBack = () => {
    router.replace('/landing')
  }

  return (
    <OnboardingContainer step={1} totalSteps={9} onBack={handleBack}>
      <View className="flex-1 justify-center px-6">
        <QuestionHeader
          questionNumber={1}
          title="What gender are you?"
        />

        <SelectableList
          options={GENDER_OPTIONS}
          selected={gender}
          onSelect={(option) => updateData({ gender: option })}
          multiSelect={false}
        />
      </View>

      <View className="px-6 pb-10">
        <OnboardingButton
          title="Next"
          onPress={handleNext}
          disabled={!isValid}
        />
      </View>
    </OnboardingContainer>
  )
}


