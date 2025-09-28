import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Circle, Defs, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg'
import { useAuth } from '../src/providers/AuthProvider'
import { generateProgressAnalysis, getUserProgressData, ProgressAnalysis, UserProgressData } from '../src/services/progressAnalysisService'

const { width } = Dimensions.get('window')
const CIRCLE_SIZE = width * 0.6
const CIRCLE_RADIUS = (CIRCLE_SIZE - 20) / 2
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS

export default function ProgressScreen() {
  const router = useRouter()
  const { user } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [progressData, setProgressData] = useState<UserProgressData | null>(null)
  const [analysis, setAnalysis] = useState<ProgressAnalysis | null>(null)
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current
  const progressAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    loadProgressData()
  }, [])

  useEffect(() => {
    if (!loading && analysis) {
      // Start entrance animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start()

      // Animate progress circle
      Animated.timing(progressAnim, {
        toValue: analysis.overallProgress / 100,
        duration: 1500,
        delay: 500,
        useNativeDriver: false,
      }).start()
    }
  }, [loading, analysis])

  const loadProgressData = async () => {
    try {
      setLoading(true)
      
      if (!user?.id) {
        console.error('No user ID available')
        return
      }

      console.log('Loading progress data for user:', user.id)
      
      // Get user progress data
      const userData = await getUserProgressData(user.id)
      if (!userData) {
        console.error('Could not load user progress data')
        return
      }
      
      setProgressData(userData)
      
      // Generate AI analysis
      const progressAnalysis = await generateProgressAnalysis(userData)
      setAnalysis(progressAnalysis)
      
    } catch (error) {
      console.error('Error loading progress data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress < 25) return '#FF6B6B' // Red for early stage
    if (progress < 50) return '#FFA500' // Orange for building
    if (progress < 75) return '#22D3EE' // Cyan for moving forward
    return '#4ECDC4' // Teal for thriving
  }

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'Early Recovery': return 'leaf-outline'
      case 'Building Strength': return 'fitness-outline'
      case 'Moving Forward': return 'arrow-forward-circle-outline'
      case 'Thriving': return 'star'
      default: return 'heart'
    }
  }

  if (loading) {
    return (
      <LinearGradient 
        colors={['#2D1B69', '#1E0A3C', '#0A0617']}
        style={styles.container}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#22D3EE" />
            <Text style={styles.loadingText}>Analyzing your progress...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    )
  }

  if (!analysis || !progressData) {
    return (
      <LinearGradient 
        colors={['#2D1B69', '#1E0A3C', '#0A0617']}
        style={styles.container}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={60} color="rgba(255, 255, 255, 0.6)" />
            <Text style={styles.errorText}>Unable to load progress data</Text>
            <Pressable style={styles.retryButton} onPress={loadProgressData}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient 
      colors={['#2D1B69', '#1E0A3C', '#0A0617']}
      style={styles.container}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <Text style={styles.headerTitle}>Progress</Text>
          <View style={styles.stageIndicator}>
            <Ionicons 
              name={getStageIcon(analysis.progressStage) as any} 
              size={20} 
              color="white" 
            />
          </View>
        </View>

        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            {/* Progress Circle */}
            <View style={styles.progressSection}>
              <View style={styles.circleContainer}>
                <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
                  <Defs>
                    <SvgLinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <Stop offset="0%" stopColor="#0E7C62" />
                      <Stop offset="50%" stopColor="#10B981" />
                      <Stop offset="100%" stopColor="#34D399" />
                    </SvgLinearGradient>
                  </Defs>
                  {/* Background circle */}
                  <Circle
                    cx={CIRCLE_SIZE / 2}
                    cy={CIRCLE_SIZE / 2}
                    r={CIRCLE_RADIUS}
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  {/* Progress circle */}
                  <Circle
                    cx={CIRCLE_SIZE / 2}
                    cy={CIRCLE_SIZE / 2}
                    r={CIRCLE_RADIUS}
                    stroke="url(#progressGradient)"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={CIRCLE_CIRCUMFERENCE}
                    strokeDashoffset={CIRCLE_CIRCUMFERENCE * (1 - analysis.overallProgress / 100)}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${CIRCLE_SIZE / 2} ${CIRCLE_SIZE / 2})`}
                  />
                </Svg>
                
                <View style={styles.circleContent}>
                  <Text style={styles.progressPercentage}>{analysis.overallProgress}%</Text>
                  <Text style={styles.progressStage}>{analysis.progressStage}</Text>
                </View>
              </View>
              
              <Text style={styles.mainMessage}>{analysis.mainMessage}</Text>
              
              <View style={styles.completionContainer}>
                <Text style={styles.completionLabel}>You're on track to move on by:</Text>
                <Text style={styles.completionDate}>{analysis.completionDate}</Text>
              </View>
            </View>

            {/* Healing Metrics */}
            <View style={styles.metricsContainer}>
              <View style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <Ionicons name="heart" size={24} color="#FF6B6B" />
                  <Text style={styles.metricTitle}>Emotional Healing</Text>
                </View>
                <Text style={styles.metricDescription}>
                  {analysis.emotionalHealing.description}
                </Text>
              </View>

              <View style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <Ionicons name="bulb" size={24} color="#22D3EE" />
                  <Text style={styles.metricTitle}>Mental Clarity</Text>
                </View>
                <Text style={styles.metricDescription}>
                  {analysis.mentalClarity.description}
                </Text>
              </View>

              <View style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <Ionicons name="trending-up" size={24} color="#4ECDC4" />
                  <Text style={styles.metricTitle}>Personal Growth</Text>
                </View>
                <Text style={styles.metricDescription}>
                  {analysis.personalGrowth.description}
                </Text>
              </View>
            </View>

            {/* Key Insights */}
            <View style={styles.insightsContainer}>
              <Text style={styles.sectionTitle}>Key Insights</Text>
              {analysis.keyInsights.map((insight, index) => (
                <View key={index} style={styles.insightItem}>
                  <View style={styles.insightDot} />
                  <Text style={styles.insightText}>{insight}</Text>
                </View>
              ))}
            </View>

            {/* Next Steps */}
            <View style={styles.nextStepsContainer}>
              <Text style={styles.sectionTitle}>Next Steps</Text>
              {analysis.nextSteps.map((step, index) => (
                <View key={index} style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>

            {/* Encouragement */}
            <View style={styles.encouragementContainer}>
              <Text style={styles.encouragementText}>
                {analysis.encouragement}
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Loading & Error
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#22D3EE',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    letterSpacing: -0.5,
  },
  stageIndicator: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Content
  scrollContainer: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // Progress Section
  progressSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  circleContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  circleContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercentage: {
    fontSize: 48,
    fontWeight: '700',
    color: 'white',
    letterSpacing: -2,
  },
  progressStage: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    marginTop: 4,
  },
  mainMessage: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 20,
    fontWeight: '500',
  },
  completionContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  completionLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
    marginBottom: 8,
  },
  completionDate: {
    fontSize: 20,
    color: '#22D3EE',
    fontWeight: '700',
  },

  // Metrics
  metricsContainer: {
    marginBottom: 32,
  },
  metricCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginLeft: 12,
  },
  metricDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
    fontWeight: '500',
  },

  // Insights
  insightsContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  insightDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22D3EE',
    marginTop: 8,
    marginRight: 16,
  },
  insightText: {
    flex: 1,
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
    fontWeight: '500',
  },

  // Next Steps
  nextStepsContainer: {
    marginBottom: 32,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#22D3EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    marginTop: 2,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
    fontWeight: '500',
  },

  // Encouragement
  encouragementContainer: {
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.2)',
    alignItems: 'center',
  },
  encouragementText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
})
