import * as Haptics from 'expo-haptics'
import { router } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native'
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg'
import { OnboardingButton } from '../../src/components/onboarding/OnboardingButton'
import { OnboardingContainer } from '../../src/components/onboarding/OnboardingContainer'
import { useOnboardingStore } from '../../src/stores/onboardingStore'
import { analyzeAttachmentWithAI, AIAnalysisResult } from '../../src/services/aiAnalysisService'


const AnimatedCircle = Animated.createAnimatedComponent(Circle)
const { width: screenWidth } = Dimensions.get('window')

// Helper function to get attachment color based on level
const getAttachmentColor = (attachmentLevel: string): string => {
  if (attachmentLevel === 'Moderate Attachment') return '#eab308'  // Yellow
  if (attachmentLevel === 'High Attachment') return '#f97316'      // Orange  
  if (attachmentLevel === 'Severe Attachment') return '#ef4444'    // Red
  return '#22c55e' // Green for Low (fallback)
}



export default function AnalysisScreen() {
  const store = useOnboardingStore()
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [currentPhase, setCurrentPhase] = useState('Initializing analysis...')
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null)
  
  const progressAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current
  const fadeAnim = useRef(new Animated.Value(0)).current
  
  const radius = Math.min(screenWidth * 0.22, 100)
  const strokeWidth = 8
  const circumference = 2 * Math.PI * radius

  useEffect(() => {
    const phases = [
      'Initializing analysis...',
      'Processing emotional patterns...',
      'Analyzing attachment behaviors...',
      'Calculating recovery timeline...',
      'Generating insights...',
      'Finalizing analysis...'
    ]

    // Entrance animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 80,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start()

    // Progress animation
    const animateProgress = () => {
      Animated.timing(progressAnim, {
        toValue: 100,
        duration: 8000,
        useNativeDriver: false,
      }).start(async () => {
        setIsComplete(true)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        // Generate the analysis results
        await generateAnalysisResults()
        // Show results immediately
        setShowResults(true)
      })
    }

    const listener = progressAnim.addListener(({ value }) => {
      setProgress(value)
      const phaseIndex = Math.min(Math.floor(value / 16.67), phases.length - 1)
      setCurrentPhase(phases[phaseIndex])
    })

    const timer = setTimeout(animateProgress, 800)

    return () => {
      progressAnim.removeListener(listener)
      clearTimeout(timer)
    }
  }, [progressAnim, scaleAnim, fadeAnim])

  const handleNext = () => {
    router.push('/onboarding/danger-carousel')
  }

  const generateAnalysisResults = async () => {
    try {
      // Prepare user responses for AI analysis
      const userResponses = {
        gender: store.gender,
        breakupDate: store.breakupDate,
        lastContactDate: store.lastContactDate,
        lastContactTime: store.lastContactTime,
        lastContactPreset: store.lastContactPreset,
        goalDays: store.goalDays,
        selectedGoalDays: store.selectedGoalDays,
        triggers: store.triggers,
        challenges: store.challenges,
        panicTools: store.panicTools,
        motivations: store.motivations,
        readiness: store.readiness,
        attachment: store.attachment
      }

      // Get AI analysis
      const result = await analyzeAttachmentWithAI(userResponses)
      setAnalysisResult(result)
    } catch (error) {
      console.error('Analysis error:', error)
      // Handle error gracefully - could show error message or use fallback
    }
  }



  const handleBack = () => {
    router.back()
  }

  const strokeDashoffset = circumference - (progress / 100) * circumference



  // Analysis results screen (shown after analysis completes)
  if (isComplete && showResults && analysisResult) {
    return (
      <OnboardingContainer step={8} totalSteps={12} onBack={handleBack} hideProgress={true}>
        <View style={styles.container}>
          <View style={styles.resultsContainer}>
            <View style={styles.revealHeader}>
              <View style={styles.titleRow}>
                <Text style={styles.completedTitle}>Analysis Complete</Text>
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              </View>
              <Text style={styles.revealSubtitle}>
                We&apos;ve got some news to break to you...
              </Text>
            </View>

            <View style={styles.analysisContent}>
              <Text style={styles.analysisText}>
                Your responses indicate a clear
              </Text>
              <Text style={[styles.analysisHighlight, { color: getAttachmentColor(analysisResult.attachmentLevel) }]}>
                {analysisResult.attachmentLevel.toLowerCase()} to your ex*
              </Text>
            </View>

            <View style={styles.chartContainer}>
              <View style={styles.chartBars}>
                <View style={styles.barContainer}>
                  <View style={[
                    styles.bar,
                    {
                      backgroundColor: getAttachmentColor(analysisResult.attachmentLevel),
                      height: Math.max(60, (analysisResult.attachmentScore / 100) * 180)
                    }
                  ]}>
                    <Text style={styles.barPercentage}>
                      {analysisResult.attachmentScore}%
                    </Text>
                  </View>
                  <Text style={styles.barLabel}>Your Score</Text>
                </View>
                
                <View style={styles.barContainer}>
                  <View style={[styles.bar, styles.averageBar, {
                    height: Math.max(60, (analysisResult.averageComparison / 100) * 180)
                  }]}>
                    <Text style={styles.barPercentage}>{analysisResult.averageComparison}%</Text>
                  </View>
                  <Text style={styles.barLabel}>Average</Text>
                </View>
              </View>

              <View style={styles.comparisonText}>
                {analysisResult.attachmentScore > analysisResult.averageComparison ? (
                  <>
                    <Text style={[styles.comparisonHighlight, { color: getAttachmentColor(analysisResult.attachmentLevel) }]}>
                      {analysisResult.attachmentScore - analysisResult.averageComparison}%
                    </Text>
                    <Text style={styles.comparisonLabel}> higher attachment than average 📈</Text>
                  </>
                ) : (
                  <>
                    <Text style={[styles.comparisonHighlight, { color: getAttachmentColor(analysisResult.attachmentLevel) }]}>
                      {analysisResult.averageComparison - analysisResult.attachmentScore}%
                    </Text>
                    <Text style={styles.comparisonLabel}> lower attachment than average 📉</Text>
                  </>
                )}
              </View>
            </View>

            <Text style={styles.disclaimer}>
              * This result is an indication only, not a medical diagnosis.
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <OnboardingButton
              title="Continue Your Journey"
              onPress={handleNext}
            />
          </View>
        </View>
      </OnboardingContainer>
    )
  }


  return (
    <OnboardingContainer step={8} totalSteps={12} onBack={handleBack}>
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.title}>Analyzing Your Responses</Text>
          <Text style={styles.subtitle}>{currentPhase}</Text>

          <Animated.View 
            style={[
              styles.progressWrapper,
              {
                transform: [{ scale: scaleAnim }],
                opacity: fadeAnim,
              }
            ]}
          >
            <Svg width={radius * 2 + 20} height={radius * 2 + 20}>
              <Defs>
                <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#60a5fa" stopOpacity="1" />
                  <Stop offset="50%" stopColor="#3b82f6" stopOpacity="1" />
                  <Stop offset="100%" stopColor="#1d4ed8" stopOpacity="1" />
                </LinearGradient>
              </Defs>
              
              <Circle
                cx={radius + 10}
                cy={radius + 10}
                r={radius}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={strokeWidth}
                fill="none"
              />
              
              <AnimatedCircle
                cx={radius + 10}
                cy={radius + 10}
                r={radius}
                stroke="url(#progressGradient)"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${radius + 10} ${radius + 10})`}
              />
            </Svg>
            
            <View style={styles.progressText}>
              <Text style={styles.progressPercentage}>
                {Math.round(progress)}%
              </Text>
              <Text style={styles.progressLabel}>COMPLETE</Text>
            </View>
          </Animated.View>
        </View>
      </View>
    </OnboardingContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '400',
    marginBottom: 60,
  },
  progressWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercentage: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '700',
  },
  progressLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
    letterSpacing: 1.5,
  },
  completedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  iconContainer: {
    marginBottom: 24,
  },
  icon: {
    fontSize: 64,
  },
  completedTitle: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  completedSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  statsContainer: {
    width: '100%',
    marginBottom: 40,
    gap: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statNumber: {
    color: '#60a5fa',
    fontSize: 18,
    fontWeight: '700',
    width: 80,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '400',
    flex: 1,
  },
  testimonialContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    borderLeftWidth: 3,
    borderLeftColor: '#60a5fa',
  },
  testimonial: {
    color: '#FFFFFF',
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 24,
    marginBottom: 12,
  },
  testimonialAuthor: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContainer: {
    paddingBottom: 32,
    paddingTop: 20,
  },
  resultsContainer: {
    flex: 1,
    paddingTop: 40,
  },
  revealHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  checkmark: {
    backgroundColor: '#22c55e',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  revealSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
  },
  analysisContent: {
    alignItems: 'center',
    marginBottom: 50,
    paddingHorizontal: 20,
  },
  analysisText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 4,
  },
  analysisHighlight: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 40,
    height: 180,
    marginBottom: 20,
  },
  barContainer: {
    alignItems: 'center',
    gap: 12,
  },
  bar: {
    width: 80,
    borderRadius: 8,
    minHeight: 60,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 12,
  },
  averageBar: {
    backgroundColor: '#22c55e',
  },
  barPercentage: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  barLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '500',
  },
  comparisonText: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  comparisonHighlight: {
    fontSize: 18,
    fontWeight: '700',
  },
  comparisonLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '400',
  },
  disclaimer: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'center',
    paddingHorizontal: 30,
    marginBottom: 30,
  },

})