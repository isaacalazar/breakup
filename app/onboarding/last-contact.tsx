import { router } from 'expo-router'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { OnboardingButton } from '../../src/components/onboarding/OnboardingButton'
import { OnboardingContainer } from '../../src/components/onboarding/OnboardingContainer'
import { QuestionHeader } from '../../src/components/onboarding/QuestionHeader'
import { useOnboardingStore } from '../../src/stores/onboardingStore'
import { isValidISODate } from '../../src/utils/date'

export default function LastContactScreen() {
  const { breakupDate, lastContactDate, lastContactTime, lastContactPreset, updateData } = useOnboardingStore()

  const isValid = lastContactPreset === 'custom' ? isValidISODate(lastContactDate) : true

  const handleNext = () => {
    if (!lastContactDate && lastContactPreset === 'custom') {
      updateData({ lastContactDate: breakupDate })
    }
    router.push('/onboarding/goal')
  }

  const handleBack = () => {
    router.back()
  }

  const toISODate = (d: Date) => d.toISOString().slice(0, 10)
  const addDays = (d: Date, days: number) => {
    const copy = new Date(d)
    copy.setDate(copy.getDate() + days)
    return copy
  }
  const addMonths = (d: Date, months: number) => {
    const copy = new Date(d)
    copy.setMonth(copy.getMonth() + months)
    return copy
  }
  const addYears = (d: Date, years: number) => {
    const copy = new Date(d)
    copy.setFullYear(copy.getFullYear() + years)
    return copy
  }

  const presets = [
    { key: 'same' as const, label: 'Same as breakup date', value: '' },
    { key: 'week' as const, label: 'Last week', value: toISODate(addDays(new Date(), -7)) },
    { key: 'month' as const, label: 'Last month', value: toISODate(addMonths(new Date(), -1)) },
    { key: 'year' as const, label: 'Last year', value: toISODate(addYears(new Date(), -1)) },
    { key: 'custom' as const, label: 'Enter a specific date', value: lastContactDate },
  ]

  return (
    <OnboardingContainer step={3} totalSteps={9} onBack={handleBack}>
      <View className="flex-1 justify-between">
        <View className="flex-1 px-6">
          <QuestionHeader
            questionNumber={3}
            title="When was your last contact with them?"
          />

          <View style={{ marginBottom: 10, marginTop: 20 }}>
            {presets.map((p) => (
              <Pressable
                key={p.key}
                onPress={() => {
                  updateData({ lastContactPreset: p.key })
                  if (p.key !== 'custom') {
                    updateData({ lastContactDate: '', lastContactTime: '' })
                  }
                }}
                style={[
                  styles.listItem,
                  lastContactPreset === p.key ? styles.listItemSelected : styles.listItemDefault,
                ]}
              >
                <Text
                  style={[
                    styles.listItemText,
                    lastContactPreset === p.key ? styles.listItemTextSelected : styles.listItemTextDefault,
                  ]}
                >
                  {p.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.helper, { marginTop: 4 }]}>Or enter a specific date</Text>
          <TextInput
            placeholder="YYYY-MM-DD"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={lastContactDate}
            onChangeText={(val) => {
              updateData({ lastContactPreset: 'custom', lastContactDate: val })
            }}
            autoCapitalize="none"
            keyboardType="numbers-and-punctuation"
            editable={lastContactPreset === 'custom'}
            style={[styles.input, lastContactPreset !== 'custom' && { opacity: 0.4 }]}
          />
          <Text style={[styles.helper, { marginTop: 6, fontSize: 12 }]}>Tip: choose a preset above or enter your own date.</Text>
        </View>

        <View className="px-6 pb-8">
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

const styles = StyleSheet.create({
  listItem: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 18,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  listItemDefault: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.18)',
  },
  listItemSelected: {
    backgroundColor: 'rgba(34,211,238,0.18)',
    borderColor: '#22d3ee',
    shadowColor: '#22d3ee',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  listItemText: {
    fontSize: 17,
    fontWeight: '600',
  },
  listItemTextDefault: {
    color: 'rgba(255,255,255,0.92)',
  },
  listItemTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  helper: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 13,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    marginTop: 4,
  },
})