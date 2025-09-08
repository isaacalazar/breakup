import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { Animated, Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Circle } from 'react-native-svg'
import { useAuth } from '../../src/providers/AuthProvider'
import { useOnboardingStore } from '../../src/stores/onboardingStore'

export default function HomeScreen() {
  const { session } = useAuth()
  const store = useOnboardingStore()
  const { lastContactDate, breakupDate, selectedGoalDays, goalDays } = store
  
  const [daysSinceContact, setDaysSinceContact] = useState(0)
  const [progressPercentage, setProgressPercentage] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState({ minutes: 0, seconds: 0 })

  // Animation refs
  const blob1 = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  const { width } = Dimensions.get('window')
  const circleSize = Math.min(width * 0.75, 320)
  const strokeWidth = 3
  const radius = (circleSize - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI

  const finalGoalDays = selectedGoalDays || parseInt(goalDays) || 30

  useEffect(() => {
    // Gentle breathing animation
    const animateBreathing = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      ).start()
    }

    // Subtle gradient shift animation
    const animateGradientShift = () => {
      Animated.loop(
        Animated.timing(blob1, {
          toValue: 1,
          duration: 15000,
          useNativeDriver: true,
        })
      ).start()
    }

    animateBreathing()
    animateGradientShift()

    const calculateProgress = () => {
      const contactDate = lastContactDate || breakupDate
      if (contactDate) {
        const start = new Date(contactDate)
        const now = new Date()
        const diffTime = Math.abs(now.getTime() - start.getTime())
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
        
        setDaysSinceContact(diffDays)
        setProgressPercentage(Math.min((diffDays / finalGoalDays) * 100, 100))
        
        // Calculate time until next day milestone
        const nextDayTime = new Date(start)
        nextDayTime.setDate(nextDayTime.getDate() + diffDays + 1)
        const timeUntilNext = nextDayTime.getTime() - now.getTime()
        
        const hours = Math.floor(timeUntilNext / (1000 * 60 * 60))
        const minutes = Math.floor((timeUntilNext % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((timeUntilNext % (1000 * 60)) / 1000)
        
        setTimeRemaining({ 
          minutes: hours * 60 + minutes, 
          seconds 
        })
      }
    }

    calculateProgress()
    const interval = setInterval(calculateProgress, 1000)
    return () => clearInterval(interval)
  }, [lastContactDate, breakupDate, finalGoalDays, blob1, pulseAnim])

  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference

  const motivationalMessages = [
    "You're stronger than you know",
    "Every day is progress",
    "Healing takes time, be patient", 
    "You're doing amazing",
    "Keep going, you've got this",
    "Growth happens outside comfort zones",
    "Your future self will thank you",
  ]

  const currentMessage = motivationalMessages[daysSinceContact % motivationalMessages.length]

  const handleEmergencySupport = () => {
    router.push('/panic')
  }

  const handleJournal = () => {
    router.push('/(tabs)/journal')
  }

  const handleSupport = () => {
    router.push('/(tabs)/community')
  }

  const handleSettings = () => {
    router.push('/(tabs)/profile')
  }

  // Generate weekly progress dots
  const generateWeeklyDots = () => {
    const dots = []
    for (let i = 0; i < 7; i++) {
      const isActive = i < daysSinceContact % 7
      dots.push(
        <View
          key={i}
          style={[
            styles.weekDot,
            isActive ? styles.weekDotActive : styles.weekDotInactive
          ]}
        />
      )
    }
    return dots
  }

  // Dynamic styles that need circleSize
  const dynamicStyles = {
    orbContainer: {
      position: 'relative' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      width: circleSize,
      height: circleSize,
    },
    mainOrb: {
      width: circleSize - 60,
      height: circleSize - 60,
      borderRadius: (circleSize - 60) / 2,
      position: 'absolute' as const,
      shadowColor: '#FF6B6B',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 30,
      elevation: 20,
    },
    orbGradient: {
      width: '100%' as const,
      height: '100%' as const,
      borderRadius: (circleSize - 60) / 2,
    },
    innerGlow: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: (circleSize - 60) / 2,
    },
    glowGradient: {
      width: '100%' as const,
      height: '100%' as const,
      borderRadius: (circleSize - 60) / 2,
    },
  }

    return (
    <LinearGradient 
      colors={['#2D1B69', '#1E0A3C', '#0A0617']}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.appTitle}>exhale</Text>
              <Text style={styles.subtitle}>No Contact Tracker</Text>
            </View>
            <Pressable onPress={handleSettings} style={styles.settingsButton}>
              <Ionicons name="settings-outline" size={20} color="rgba(255, 255, 255, 0.7)" />
        </Pressable>
          </View>

          {/* Weekly Progress Dots */}
          <View style={styles.weeklyContainer}>
            <View style={styles.weeklyDots}>
              {generateWeeklyDots()}
            </View>
          </View>

          {/* Main Gradient Orb */}
          <View style={styles.progressContainer}>
            <View style={dynamicStyles.orbContainer}>
              {/* Main Gradient Orb */}
              <Animated.View 
                style={[
                  dynamicStyles.mainOrb,
                  {
                    transform: [
                      { scale: pulseAnim },
                    ],
                    opacity: blob1.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [1, 0.95, 1],
                    }),
                  },
                ]}
              >
                <LinearGradient
                  colors={[
                    '#FF6B6B', // Red-pink
                    '#4ECDC4', // Teal
                    '#45B7D1', // Blue
                    '#96CEB4', // Green
                    '#FECA57', // Yellow
                    '#FF9FF3', // Pink
                    '#54A0FF', // Light blue
                  ]}
                  locations={[0, 0.15, 0.3, 0.45, 0.6, 0.8, 1]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={dynamicStyles.orbGradient}
                />
                
                {/* Inner glow effect */}
                <View style={dynamicStyles.innerGlow}>
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.05)', 'transparent']}
                    style={dynamicStyles.glowGradient}
                  />
                </View>
              </Animated.View>

              {/* Outer progress ring */}
              <Svg width={circleSize} height={circleSize} style={styles.progressRing}>
                <Circle
                  cx={circleSize / 2}
                  cy={circleSize / 2}
                  r={radius + 20}
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth={2}
                  fill="none"
                  strokeDasharray="8 4"
                />
                <Circle
                  cx={circleSize / 2}
                  cy={circleSize / 2}
                  r={radius + 20}
                  stroke="#22D3EE"
                  strokeWidth={2}
                  fill="none"
                  strokeDasharray={`${(progressPercentage / 100) * (radius + 20) * 2 * Math.PI * 0.8} ${(radius + 20) * 2 * Math.PI}`}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${circleSize / 2} ${circleSize / 2})`}
                />
              </Svg>
              
              {/* Center Content */}
              <View style={styles.orbContent}>
                <Text style={styles.daysLabel}>You've been no-contact for:</Text>
                <Text style={styles.daysNumber}>{daysSinceContact}</Text>
                <Text style={styles.daysText}>days</Text>
                
                {/* Timer */}
                <View style={styles.timerContainer}>
                  <Text style={styles.timerText}>
                    {timeRemaining.minutes}m {timeRemaining.seconds}s
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Motivational Message */}
          <View style={styles.messageContainer}>
            <Text style={styles.motivationalMessage}>{currentMessage} </Text>
          </View>

          {/* Progress Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>GOAL</Text>
              <Text style={styles.statValue}>{finalGoalDays}</Text>
              <Text style={styles.statUnit}>days</Text>
            </View>
            
            <View style={[styles.statCard, styles.progressCard]}>
              <Text style={styles.statLabel}>PROGRESS</Text>
              <Text style={[styles.statValue, styles.progressValue]}>{Math.round(progressPercentage)}</Text>
              <Text style={styles.statUnit}>%</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>REMAINING</Text>
              <Text style={styles.statValue}>{Math.max(finalGoalDays - daysSinceContact, 0)}</Text>
              <Text style={styles.statUnit}>days</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Pressable 
              style={[styles.actionButton, styles.communityButton]}
              onPress={handleSupport}
            >
              <Ionicons name="people" size={18} color="#A855F7" />
              <Text style={styles.actionButtonText}>Community</Text>
      </Pressable>

            <Pressable 
              style={[styles.actionButton, styles.journalButton]}
              onPress={handleJournal}
            >
              <Ionicons name="book" size={18} color="#3B82F6" />
              <Text style={styles.actionButtonText}>Journal</Text>
      </Pressable>
          </View>

          {/* Emergency Support Button */}
          <View style={styles.emergencyContainer}>
            <Pressable 
              style={styles.emergencyButton}
              onPress={handleEmergencySupport}
            >
              <Ionicons name="warning" size={16} color="white" />
              <Text style={styles.emergencyText}>Emergency Support</Text>
      </Pressable>
          </View>
        </ScrollView>
    </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 24,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
    marginTop: 2,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weeklyContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 24,
  },
  weeklyDots: {
    flexDirection: 'row',
    gap: 8,
  },
  weekDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  weekDotActive: {
    backgroundColor: '#22D3EE',
    shadowColor: '#22D3EE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  weekDotInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  progressRing: {
    position: 'absolute',
    zIndex: 1,
  },
  orbContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  daysLabel: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
    opacity: 0.9,
  },
  daysNumber: {
    color: 'white',
    fontSize: 64,
    fontWeight: '800',
    letterSpacing: -3,
    lineHeight: 64,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  daysText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
    opacity: 0.95,
  },
  timerContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  timerText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    opacity: 0.8,
  },
  messageContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  motivationalMessage: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressCard: {
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
    borderColor: 'rgba(34, 211, 238, 0.2)',
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
    lineHeight: 24,
  },
  progressValue: {
    color: '#22D3EE',
  },
  statUnit: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  communityButton: {
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  journalButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  emergencyContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  emergencyText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
})