import DateTimePicker from '@react-native-community/datetimepicker'
import { router } from 'expo-router'
import React from 'react'
import { Text, View } from 'react-native'
import { OnboardingButton } from '../../src/components/onboarding/OnboardingButton'
import { OnboardingContainer } from '../../src/components/onboarding/OnboardingContainer'
import { QuestionHeader } from '../../src/components/onboarding/QuestionHeader'
import { useOnboardingStore } from '../../src/stores/onboardingStore'
import { isValidISODate } from '../../src/utils/date'

export default function BreakupDateScreen() {
  const { breakupDate, updateData } = useOnboardingStore()

  const isValid = isValidISODate(breakupDate)

  const selectedDate = breakupDate ? new Date(breakupDate) : new Date()

  React.useEffect(() => {
    if (!breakupDate) {
      const iso = new Date().toISOString().slice(0, 10)
      updateData({ breakupDate: iso })
    }
  }, [])

  const onChange = (_: any, newDate?: Date) => {
    if (!newDate) return
    const iso = newDate.toISOString().slice(0, 10)
    updateData({ breakupDate: iso })
  }

  // On Android, inline calendar UI may vary by version; we still render the picker inline.

  const handleNext = () => {
    router.push('/onboarding/last-contact')
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <OnboardingContainer step={2} totalSteps={9} onBack={handleBack}>
      <View className="flex-1 justify-between py-8">
        <View className="flex-1 justify-center">
          <QuestionHeader
            questionNumber={2}
            title="When was the breakup?"
          />
          
          <View className="mt-8 px-6">
            <View className="bg-white/5 rounded-2xl border border-white/15 px-2 py-2">
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="spinner"
                onChange={(event, date) => {
                  if (date) onChange(event, date)
                }}
                themeVariant="dark"
                style={{ backgroundColor: 'transparent' }}
              />
            </View>
            <Text className="text-white/80 text-center text-base mt-4">
              {breakupDate}
            </Text>
          </View>
        </View>

        <View className="px-6 pt-8">
          <OnboardingButton
            title="Next"
            onPress={handleNext}
            disabled={!isValid}
          />
        </View>
      </View>
    </OnboardingContainer>
  )
}