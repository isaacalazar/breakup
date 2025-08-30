import Slider from '@react-native-community/slider'
import { router } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'
import { OnboardingButton } from '../../src/components/onboarding/OnboardingButton'
import { OnboardingContainer } from '../../src/components/onboarding/OnboardingContainer'
import { useOnboardingStore } from '../../src/stores/onboardingStore'

export default function ScalesScreen() {
  const { readiness, attachment, updateData } = useOnboardingStore()

  const isValid = parseInt(readiness) >= 1 && parseInt(readiness) <= 10 && 
                  parseInt(attachment) >= 1 && parseInt(attachment) <= 10

  const handleNext = () => {
    router.push('/onboarding/analysis')
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <OnboardingContainer step={7} totalSteps={12} onBack={handleBack}>
      <View className="flex-1" style={{ paddingHorizontal: 24 }}>
        <View style={styles.header}>
          <Text style={styles.questionNumber}>Question #8</Text>
        </View>
        
        <View style={styles.questionSection}>
          <Text style={styles.questionTitle}>
            How ready are you to commit to no contact?
          </Text>
          
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={parseInt(readiness) || 5}
              onValueChange={(value) => updateData({ readiness: Math.round(value).toString() })}
              minimumTrackTintColor="#22d3ee"
              maximumTrackTintColor="rgba(255,255,255,0.2)"
              thumbStyle={styles.sliderThumb}
            />
            <Text style={styles.sliderValue}>{readiness || '5'}</Text>
          </View>
          
          <View style={styles.scaleLabels}>
            <Text style={styles.scaleLabel}>Not ready</Text>
            <Text style={styles.scaleLabel}>Fully committed</Text>
          </View>
        </View>

        <View style={styles.questionSection}>
          <Text style={styles.questionTitle}>
            How intense is your attachment to them?
          </Text>
          
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={parseInt(attachment) || 5}
              onValueChange={(value) => updateData({ attachment: Math.round(value).toString() })}
              minimumTrackTintColor="#22d3ee"
              maximumTrackTintColor="rgba(255,255,255,0.2)"
              thumbStyle={styles.sliderThumb}
            />
            <Text style={styles.sliderValue}>{attachment || '5'}</Text>
          </View>
          
          <View style={styles.scaleLabels}>
            <Text style={styles.scaleLabel}>Low attachment</Text>
            <Text style={styles.scaleLabel}>Very attached</Text>
          </View>
        </View>
      </View>

      <View style={{ paddingHorizontal: 24, paddingBottom: 32 }}>
        <OnboardingButton
          title="Continue"
          onPress={handleNext}
          disabled={!isValid}
        />
      </View>
    </OnboardingContainer>
  )
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  questionNumber: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    fontWeight: '500',
  },
  questionSection: {
    marginBottom: 40,
  },
  questionTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 28,
    lineHeight: 30,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 12,
  },
  slider: {
    flex: 1,
    height: 44,
  },
  sliderThumb: {
    backgroundColor: '#22d3ee',
    width: 28,
    height: 28,
    shadowColor: '#22d3ee',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  sliderValue: {
    fontSize: 20,
    fontWeight: '700',
    minWidth: 40,
    textAlign: 'center',
    backgroundColor: '#22d3ee',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    color: '#0B1220',
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  scaleLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '500',
  },
})