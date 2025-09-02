import { router } from 'expo-router'
import { useState } from 'react'
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { OnboardingButton } from '../../src/components/onboarding/OnboardingButton'
import { OnboardingContainer } from '../../src/components/onboarding/OnboardingContainer'
import { QuestionHeader } from '../../src/components/onboarding/QuestionHeader'
import { useOnboardingStore } from '../../src/stores/onboardingStore'

export default function UserInfoScreen() {
  const { name, age, updateData } = useOnboardingStore()
  const [localName, setLocalName] = useState(name || '')
  const [localAge, setLocalAge] = useState(age || '')

  const isValid = localName.trim().length > 0 && localAge.trim().length > 0 && 
                  parseInt(localAge) >= 16 && parseInt(localAge) <= 100

  const handleNext = () => {
    updateData({ 
      name: localName.trim(),
      age: localAge.trim()
    })
    router.push('/onboarding/analysis')
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <OnboardingContainer step={8} totalSteps={12} onBack={handleBack}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <QuestionHeader
            questionNumber={8}
            title="Tell us a bit about yourself"
            subtitle="We'll use this to personalize your experience"
          />

          <View style={styles.inputContainer}>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>What's your name?</Text>
              <TextInput
                style={styles.input}
                value={localName}
                onChangeText={setLocalName}
                placeholder="Enter your first name"
                placeholderTextColor="rgba(255,255,255,0.5)"
                autoCapitalize="words"
                autoCorrect={false}
                maxLength={50}
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>How old are you?</Text>
              <TextInput
                style={styles.input}
                value={localAge}
                onChangeText={setLocalAge}
                placeholder="Enter your age"
                placeholderTextColor="rgba(255,255,255,0.5)"
                keyboardType="numeric"
                maxLength={3}
              />
              {localAge && (parseInt(localAge) < 16 || parseInt(localAge) > 100) && (
                <Text style={styles.errorText}>
                  Please enter an age between 16 and 100
                </Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <OnboardingButton
            title="Continue"
            onPress={handleNext}
            disabled={!isValid}
          />
        </View>
      </KeyboardAvoidingView>
    </OnboardingContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  inputContainer: {
    gap: 32,
  },
  fieldContainer: {
    gap: 12,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
})