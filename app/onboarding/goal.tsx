import { router } from 'expo-router'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { OnboardingButton } from '../../src/components/onboarding/OnboardingButton'
import { OnboardingContainer } from '../../src/components/onboarding/OnboardingContainer'
import { QuestionHeader } from '../../src/components/onboarding/QuestionHeader'
import { useOnboardingStore } from '../../src/stores/onboardingStore'

export default function GoalScreen() {
  const { goalDays, selectedGoalDays, updateData } = useOnboardingStore()

  const custom = parseInt(goalDays)
  const presetValid = typeof selectedGoalDays === 'number' && selectedGoalDays >= 7 && selectedGoalDays <= 365
  const customValid = !isNaN(custom) && custom >= 7 && custom <= 365
  const isValid = presetValid || customValid

  const handleNext = () => {
    router.push('/onboarding/triggers')
  }

  const handleBack = () => {
    router.back()
  }

  const goalPresets = [
    { label: '1 week', days: 7 },
    { label: '30 days', days: 30 },
    { label: '3 months', days: 90 },
    { label: '6 months', days: 180 },
    { label: '1 year', days: 365 },
  ]

  return (
    <OnboardingContainer step={4} totalSteps={12} onBack={handleBack}>
      <View className="flex-1 justify-between">
        <View className="flex-1 px-6">
          <QuestionHeader
            questionNumber={4}
            title="What's your no-contact goal?"
          />

          <View style={{ marginBottom: 10, marginTop: 20 }}>
          {goalPresets.map((p) => {
            const selected = selectedGoalDays === p.days
            return (
              <Pressable
                key={p.label}
                onPress={() => updateData({ selectedGoalDays: p.days })}
                style={[styles.listItem, selected ? styles.listItemSelected : styles.listItemDefault]}
              >
                <Text style={[styles.listItemText, selected ? styles.listItemTextSelected : styles.listItemTextDefault]}>
                  {p.label}
                </Text>
              </Pressable>
            )
          })}
          </View>
          
          <Text style={[styles.helper, { marginTop: 4 }]}>Or enter custom days (7-365)</Text>
          <TextInput
            placeholder="e.g. 45"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={goalDays}
            onChangeText={(text) => updateData({ goalDays: text })}
            keyboardType="numeric"
            style={styles.input}
          />
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