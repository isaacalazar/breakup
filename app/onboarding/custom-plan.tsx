import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { Animated, Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Circle, Defs, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg'
import { OnboardingContainer } from '../../src/components/onboarding/OnboardingContainer'
import { analyzeAttachmentWithAI } from '../../src/services/aiAnalysisService'
import { useOnboardingStore } from '../../src/stores/onboardingStore'

const { width: screenWidth } = Dimensions.get('window')

export default function CustomPlanScreen() {
  const store = useOnboardingStore()
  const [targetDate, setTargetDate] = useState('')
  const [isCalculatingDate, setIsCalculatingDate] = useState(true)
  const insets = useSafeAreaInsets()
  
  // Animation refs
  const rotateAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    calculateTargetDateWithAI()
    startAnimations()
  }, [])

  const startAnimations = () => {
    // Orbital rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start()

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start()
  }

  const calculateTargetDateWithAI = async () => {
    try {
      setIsCalculatingDate(true)
      
      // Get AI analysis of user's attachment and recovery timeline
      const aiAnalysis = await analyzeAttachmentWithAI({
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
      })
      
      // Use AI-recommended timeline (convert weeks to days)
      const aiRecommendedDays = aiAnalysis.recoveryTimelineWeeks * 7
      
      // Apply additional user preference adjustments
      let finalDays = aiRecommendedDays
      
      // Respect user's goal if it's longer than AI recommendation
      if (store.selectedGoalDays && store.selectedGoalDays > aiRecommendedDays) {
        finalDays = store.selectedGoalDays
      }
      
      // Calculate target date
      const currentDate = new Date()
      const target = new Date(currentDate)
      target.setDate(currentDate.getDate() + finalDays)
      
      const options: Intl.DateTimeFormatOptions = {
        month: 'long',
        day: 'numeric',
        year: target.getFullYear() !== currentDate.getFullYear() ? 'numeric' : undefined
      }
      
      setTargetDate(target.toLocaleDateString('en-US', options))
      
    } catch (error) {
      console.error('AI date calculation failed, using fallback:', error)
      // Fallback to original calculation method
      calculateTargetDateFallback()
    } finally {
      setIsCalculatingDate(false)
    }
  }

  const calculateTargetDateFallback = () => {
    const { 
      attachment, 
      challenges, 
      triggers, 
      selectedGoalDays, 
      breakupDate, 
      readiness,
      age,
      lastContactDate,
      lastContactPreset 
    } = store
    
    // Base duration from user's selected goal or intelligent default
    let durationDays = selectedGoalDays || 90
    
    // Calculate time since breakup for context
    let daysSinceBreakup = 0
    if (breakupDate) {
      const breakup = new Date(breakupDate)
      const today = new Date()
      daysSinceBreakup = Math.floor((today.getTime() - breakup.getTime()) / (1000 * 60 * 60 * 24))
    }
    
    // Adjust based on attachment level (1-10 scale)
    const attachmentScore = parseInt(attachment) || 5
    if (attachmentScore >= 8) {
      durationDays += 45 // Very high attachment
    } else if (attachmentScore >= 6) {
      durationDays += 25 // High attachment
    } else if (attachmentScore >= 4) {
      durationDays += 10 // Moderate attachment
    }
    
    // Adjust based on readiness level (inverse relationship)
    const readinessScore = parseInt(readiness) || 5
    if (readinessScore <= 3) {
      durationDays += 30 // Low readiness needs more time
    } else if (readinessScore >= 8) {
      durationDays -= 15 // High readiness can recover faster
    }
    
    // Adjust based on age (younger people often recover faster)
    const userAge = parseInt(age) || 25
    if (userAge >= 35) {
      durationDays += 20 // Older adults may need more time
    } else if (userAge <= 22) {
      durationDays -= 10 // Younger adults may recover faster
    }
    
    // Adjust based on recent contact
    if (lastContactPreset === 'today' || lastContactPreset === 'yesterday') {
      durationDays += 21 // Recent contact extends recovery
    } else if (lastContactPreset === 'week') {
      durationDays += 14 // Recent contact within a week
    }
    
    // Adjust based on time already passed since breakup
    if (daysSinceBreakup > 30) {
      durationDays -= Math.min(30, Math.floor(daysSinceBreakup / 3)) // Reduce time if already making progress
    }
    
    // Adjust based on challenges and triggers
    const challengeCount = challenges?.length || 0
    const triggerCount = triggers?.length || 0
    
    if (challengeCount >= 4 || triggerCount >= 4) {
      durationDays += 35 // Severe cases need more time
    } else if (challengeCount >= 2 || triggerCount >= 2) {
      durationDays += 15 // Moderate cases
    }
    
    // Ensure realistic bounds (21 days minimum, 180 days maximum)
    durationDays = Math.max(21, Math.min(180, durationDays))
    
    const currentDate = new Date()
    const target = new Date(currentDate)
    target.setDate(currentDate.getDate() + durationDays)
    
    const options: Intl.DateTimeFormatOptions = {
      month: 'long',
      day: 'numeric',
      year: target.getFullYear() !== currentDate.getFullYear() ? 'numeric' : undefined
    }
    
    setTargetDate(target.toLocaleDateString('en-US', options))
  }

  const handleNext = () => {
    router.push('/onboarding/danger-carousel')
  }

  const userName = store.name || 'Friend'

  return (
    <OnboardingContainer step={10} totalSteps={12} showBackButton={false} hideProgress={true}>
      <View style={styles.mainContainer}>
        <ScrollView 
          style={styles.scrollContainer} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            
            {/* Animated Orbital Ring */}
            <View style={styles.orbitalContainer}>
              <Animated.View
                style={[
                  styles.orbitalRing,
                  {
                    transform: [
                      { scale: pulseAnim },
                      {
                        rotate: rotateAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg'],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Svg width={160} height={160}>
                  <Defs>
                    <SvgLinearGradient id="orbitalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <Stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.8" />
                      <Stop offset="50%" stopColor="#3B82F6" stopOpacity="1" />
                      <Stop offset="100%" stopColor="#1E3A8A" stopOpacity="0.6" />
                    </SvgLinearGradient>
                  </Defs>
                  {/* Outer orbital rings */}
                  <Circle
                    cx={80}
                    cy={80}
                    r={75}
                    stroke="url(#orbitalGradient)"
                    strokeWidth={2}
                    fill="none"
                    strokeDasharray="5 10"
                    opacity={0.6}
                  />
                  <Circle
                    cx={80}
                    cy={80}
                    r={65}
                    stroke="url(#orbitalGradient)"
                    strokeWidth={1.5}
                    fill="none"
                    strokeDasharray="3 8"
                    opacity={0.4}
                  />
                  {/* Central core */}
                  <Circle
                    cx={80}
                    cy={80}
                    r={45}
                    stroke="url(#orbitalGradient)"
                    strokeWidth={3}
                    fill="rgba(59, 130, 246, 0.2)"
                  />
                  {/* Small orbital dots */}
                  <Circle cx={140} cy={80} r={3} fill="#3B82F6" opacity={0.8} />
                  <Circle cx={20} cy={80} r={2} fill="#1E3A8A" opacity={0.6} />
                  <Circle cx={80} cy={20} r={2.5} fill="#60A5FA" opacity={0.7} />
                </Svg>
              </Animated.View>
            </View>

            {/* Main Message */}
            <View style={styles.messageContainer}>
              <Text style={styles.mainMessage}>
                We've made you a personalized no{'\n'}contact plan.
              </Text>
            </View>

            {/* Date Section */}
            <View style={styles.dateSection}>
              <Text style={styles.dateLabel}>You will move on by:</Text>
              <View style={styles.datePill}>
                {isCalculatingDate ? (
                  <Text style={styles.dateText}>Calculating...</Text>
                ) : (
                  <Text style={styles.dateText}>{targetDate}</Text>
                )}
              </View>
            </View>

            {/* Tagline */}
            <View style={styles.taglineContainer}>
              <Text style={styles.tagline}>
                Move on and become the best{'\n'}version of yourself
              </Text>
              <Text style={styles.subtitle}>Stronger. Happier. More Confident.</Text>
            </View>

            {/* Feature Cards */}
            <View style={styles.featuresContainer}>
              <View style={styles.featureCard}>
                <LinearGradient
                  colors={['#FF6B6B', '#FF8E53']}
                  style={styles.featureIconContainer}
                >
                  <Ionicons name="bar-chart" size={24} color="white" />
                </LinearGradient>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Progress Tracking</Text>
                  <Text style={styles.featureDescription}>
                    See your recovery journey in real-time.
                  </Text>
                </View>
              </View>

              <View style={styles.featureCard}>
                <LinearGradient
                  colors={['#4ECDC4', '#44A08D']}
                  style={styles.featureIconContainer}
                >
                  <Ionicons name="people" size={24} color="white" />
                </LinearGradient>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Community</Text>
                  <Text style={styles.featureDescription}>
                    Join a support system of people going through similar situations.
                  </Text>
                </View>
              </View>

              <View style={styles.featureCard}>
                <LinearGradient
                  colors={['#A855F7', '#EC4899']}
                  style={styles.featureIconContainer}
                >
                  <Ionicons name="journal" size={24} color="white" />
                </LinearGradient>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Journal</Text>
                  <Text style={styles.featureDescription}>
                    Express your thoughts and track your emotional journey.
                  </Text>
                </View>
              </View>

              <View style={styles.featureCard}>
                <LinearGradient
                  colors={['#EF4444', '#DC2626']}
                  style={styles.featureIconContainer}
                >
                  <Ionicons name="warning" size={24} color="white" />
                </LinearGradient>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Panic Button</Text>
                  <Text style={styles.featureDescription}>
                    Instant access to emergency support when you need it most.
                  </Text>
                </View>
              </View>

              <View style={styles.featureCard}>
                <LinearGradient
                  colors={['#F59E0B', '#D97706']}
                  style={styles.featureIconContainer}
                >
                  <Ionicons name="library" size={24} color="white" />
                </LinearGradient>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Expert Articles</Text>
                  <Text style={styles.featureDescription}>
                    Read proven strategies and insights for moving on from your ex.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Fixed CTA Button */}
        <LinearGradient
          colors={['transparent', 'transparent']}
          style={[styles.buttonGradientContainer, { paddingBottom: Math.max(12, insets.bottom + 4) }]}
        >
          <Pressable
            onPress={handleNext}
            accessibilityRole="button"
            accessibilityLabel="Start No Contact"
            style={({ pressed }) => [
              styles.ctaButton,
              pressed && styles.ctaButtonPressed
            ]}
          >
            <LinearGradient
              colors={['#2563EB', '#1D4ED8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaGradient}
            >
              <Text style={styles.ctaButtonText}>Start No Contact</Text>
            </LinearGradient>
          </Pressable>
        </LinearGradient>
      </View>
    </OnboardingContainer>
  )
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 160, // Extra space so the CTA isn't overlapped
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  orbitalContainer: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitalRing: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageContainer: {
    marginBottom: 30,
  },
  mainMessage: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 36,
    fontFamily: 'System',
  },
  dateSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  dateLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 18,
    fontWeight: '400',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'System',
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
    alignSelf: 'center',
  },
  dateText: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '700',
  },
  taglineContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  tagline: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'System',
    lineHeight: 32,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    fontFamily: 'System',
  },
  featuresContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 20,
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 4,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    marginTop: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
    fontFamily: 'System',
  },
  featureDescription: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 18,
    fontFamily: 'System',
  },
  buttonGradientContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 28,
    paddingTop: 16,
    zIndex: 10,
    backgroundColor: '#0A0617',
  },
  ctaButton: {
    borderRadius: 22,
    width: '100%',
    alignSelf: 'center',
    alignItems: 'stretch',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaGradient: {
    borderRadius: 22,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  ctaButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
})