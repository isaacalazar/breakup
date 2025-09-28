import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { Animated, Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import SkiaBadge from '../../src/components/SkiaBadge'
import { useAuth } from '../../src/providers/AuthProvider'
import { useSession } from '../../src/providers/SessionProvider'

// Milestones data - properly ordered with spread out requirements
const MILESTONES = [
  {
    id: 'day1',
    title: '1 Day',
    subtitle: 'First Step',
    description: 'Every journey begins with a single step.',
    variant: 'bronze' as const,
    requirement: 1,
  },
  {
    id: 'week1',
    title: '1 Week',
    subtitle: 'Building Momentum',
    description: 'You\'re developing new patterns.',
    variant: 'silver' as const,
    requirement: 7,
  },
  {
    id: 'month1',
    title: '1 Month',
    subtitle: 'Major Milestone',
    description: 'Significant progress in your healing.',
    variant: 'gold' as const,
    requirement: 30,
  },
  {
    id: 'month3',
    title: '3 Months',
    subtitle: 'Deep Healing',
    description: 'Real transformation is happening.',
    variant: 'platinum' as const,
    requirement: 90,
  },
  {
    id: 'month6',
    title: '6 Months',
    subtitle: 'Master of Self',
    description: 'You\'ve achieved true mastery.',
    variant: 'iridescent' as const,
    requirement: 180,
  },
]

export default function HomeScreen() {
  const { profile, loading } = useAuth()
  const { hasCompletedOnboarding } = useSession()

  // Check onboarding completion from both database and local storage
  const isOnboardingComplete = profile?.onboarding_completed || hasCompletedOnboarding

  // Debug logging - commented out to reduce console noise
  // console.log('Home Screen State:', {
  //   hasProfile: !!profile,
  //   loading,
  //   hasCompletedOnboarding,
  //   dbOnboardingComplete: profile?.onboarding_completed,
  //   isOnboardingComplete,
  //   streakStart: profile?.streak_start,
  //   goalDays: profile?.goal_days,
  //   profileData: profile ? {
  //     name: profile.name,
  //     breakupDate: profile.breakup_date,
  //     streakStart: profile.streak_start,
  //     goalDays: profile.goal_days
  //   } : null
  // })

  const [daysSinceContact, setDaysSinceContact] = useState(0)
  const [progressPercentage, setProgressPercentage] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0, seconds: 0 })

  // Animation refs
  const blob1 = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  const { width } = Dimensions.get('window')
  const circleSize = Math.min(width * 0.75, 320)
  const strokeWidth = 3
  const radius = (circleSize - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI

  const finalGoalDays = profile?.goal_days || 30

  // Get current milestone based on days since contact
  const getCurrentMilestone = () => {
    // Find the current milestone (highest requirement that user has achieved)
    const unlockedMilestones = MILESTONES.filter(m => daysSinceContact >= m.requirement)
    const currentMilestone = unlockedMilestones.length > 0
      ? unlockedMilestones[unlockedMilestones.length - 1]
      : null

    // Find the next milestone to work towards
    const nextMilestone = MILESTONES.find(m => daysSinceContact < m.requirement)

    return { current: currentMilestone, next: nextMilestone }
  }

  const { current: currentMilestone, next: nextMilestone } = getCurrentMilestone()

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
      const streakStart = profile?.streak_start
      if (streakStart) {
        const startTime = new Date(streakStart)
        const now = new Date()
        
        // Calculate the time difference in milliseconds
        const diffTime = now.getTime() - startTime.getTime()
        
        // Calculate days since no-contact started
        // Count calendar days that have been completed (more intuitive than 24-hour periods)
        const startDate = new Date(startTime)
        startDate.setHours(0, 0, 0, 0) // Start of the start day
        
        const currentDate = new Date(now)
        currentDate.setHours(0, 0, 0, 0) // Start of current day
        
        const diffDays = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        
        // Debug logging - commented out to reduce console noise
        // console.log('Day calculation debug:', {
        //   streakStart: startTime.toISOString(),
        //   now: now.toISOString(),
        //   startDate: startDate.toISOString(),
        //   currentDate: currentDate.toISOString(),
        //   diffTime,
        //   diffHours: diffTime / (1000 * 60 * 60),
        //   diffDays,
        //   totalHours: Math.floor(diffTime / (1000 * 60 * 60))
        // })
        
        // Calculate current elapsed time for display
        const totalSeconds = Math.floor(diffTime / 1000)
        const totalMinutes = Math.floor(totalSeconds / 60)
        const totalHours = Math.floor(totalMinutes / 60)

        // Ensure we don't show negative values if streak_start is in the future
        const daysSince = Math.max(0, diffDays)
        const hoursSince = Math.max(0, totalHours % 24)
        const minutesSince = Math.max(0, totalMinutes % 60)
        const secondsSince = Math.max(0, totalSeconds % 60)

        setDaysSinceContact(daysSince)
        setProgressPercentage(Math.min((daysSince / finalGoalDays) * 100, 100))

        // Set elapsed time (counting up) instead of countdown
        setTimeRemaining({
          hours: hoursSince,
          minutes: minutesSince,
          seconds: secondsSince
        })
      } else {
        // No streak data available - use demo data for testing
        // In production, this would be 0 or redirect to onboarding
        const demoDays = 6
        setDaysSinceContact(demoDays)
        setProgressPercentage(Math.min((demoDays / finalGoalDays) * 100, 100))
        
        // Show demo time elapsed (counting up)
        setTimeRemaining({ hours: 10, minutes: 16, seconds: 31 })
      }
    }

    calculateProgress()
    const interval = setInterval(calculateProgress, 1000)
    return () => clearInterval(interval)
  }, [profile?.streak_start, finalGoalDays, blob1, pulseAnim])


  // Dynamic motivational messages based on progress
  const getMotivationalMessage = () => {
    const progressPercent = Math.round(progressPercentage)
    const daysLeft = Math.max(finalGoalDays - daysSinceContact, 0)
    
    // Messages for different progress stages
    if (daysSinceContact === 0) {
      return "You're stronger than you know"
    } else if (daysSinceContact === 1) {
      return "Day 1 complete! Every journey begins with a single step"
    } else if (daysSinceContact < 7) {
      return "Building momentum. Each day gets easier"
    } else if (daysSinceContact < 30) {
      return "Making real progress. Keep going!"
    } else if (daysSinceContact >= finalGoalDays) {
      return "Goal achieved! You're unstoppable"
    } else if (progressPercent >= 75) {
      return `Almost there! ${daysLeft} days to go`
    } else if (progressPercent >= 50) {
      return "Halfway there! Your future self will thank you"
    } else {
      return "Every day is progress. Be patient with yourself"
    }
  }

  const currentMessage = getMotivationalMessage()

  const handleEmergencySupport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push('/panic')
  }

  const handlePledge = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push('/pledge')
  }

  const handleJournal = () => {
    router.push('/(tabs)/journal')
  }

  const handleMeditate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push('/meditate')
  }

  const handleSupport = () => {
    router.push('/(tabs)/community')
  }

  const handleSettings = () => {
    router.push('/(tabs)/profile')
  }

  // Generate weekly progress tracker - shows daily progress with icons
  const generateWeeklyTracker = () => {
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
    
    if (!profile?.streak_start) {
      // No streak data, show all X's
      return days.map((day, index) => (
        <View key={index} style={styles.weekDayContainer}>
          <View style={styles.weekDayIcon}>
            <Text style={[styles.weekDayIconText, { color: 'rgba(255, 255, 255, 0.3)' }]}>
              ×
            </Text>
          </View>
          <Text style={styles.weekDayLabel}>{day}</Text>
        </View>
      ))
    }
    
    const now = new Date()
    const streakStart = new Date(profile.streak_start)
    
    // Get the start of this week (Monday)
    const today = new Date(now)
    const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, etc.
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Adjust so Monday = 0
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() + mondayOffset)
    startOfWeek.setHours(0, 0, 0, 0)
    
    return days.map((day, index) => {
      let icon = '×' // Default X for future days
      let iconColor = 'rgba(255, 255, 255, 0.3)'
      let backgroundColor = 'transparent'
      
      // Calculate the date for this day of the week
      const dayDate = new Date(startOfWeek)
      dayDate.setDate(startOfWeek.getDate() + index)
      dayDate.setHours(23, 59, 59, 999) // Set to end of day for comparison
      
      const isToday = dayDate.toDateString() === now.toDateString()
      const dayHasPassedSinceStreak = dayDate >= streakStart && dayDate < now
      const isTodayAndAfterStreak = isToday && dayDate >= streakStart
      
      if (dayHasPassedSinceStreak) {
        // Day has completely passed since streak started
        icon = '✓' // Checkmark for completed days
        iconColor = '#4ECDC4'
        backgroundColor = 'rgba(78, 205, 196, 0.2)'
      } else if (isTodayAndAfterStreak) {
        // Today (current day in progress)
        icon = '●' // Dot for today
        iconColor = '#FECA57' // Yellow for today
        backgroundColor = 'rgba(254, 202, 87, 0.2)'
      } else if (dayDate < streakStart) {
        // Day was before streak started
        icon = '−' // Dash for pre-streak
        iconColor = 'rgba(255, 255, 255, 0.2)'
        backgroundColor = 'transparent'
      }
      // else stays as X for future days
      
      return (
        <View key={index} style={styles.weekDayContainer}>
          <View style={[styles.weekDayIcon, { backgroundColor }]}>
            <Text style={[styles.weekDayIconText, { color: iconColor }]}>
              {icon}
            </Text>
          </View>
          <Text style={styles.weekDayLabel}>{day}</Text>
        </View>
      )
    })
  }


  if (loading) {
    return (
      <LinearGradient 
        colors={['#2D1B69', '#1E0A3C', '#0A0617']}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={styles.loadingText}>Loading your progress...</Text>
        </SafeAreaView>
      </LinearGradient>
    )
  }

  if (!profile && !isOnboardingComplete) {
    return (
      <LinearGradient 
        colors={['#2D1B69', '#1E0A3C', '#0A0617']}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
          <Text style={styles.loadingText}>Welcome to Exhale!</Text>
          <Text style={[styles.loadingText, { fontSize: 16, marginTop: 16, opacity: 0.7 }]}>
            Complete your onboarding to get started
        </Text>
        <Pressable
            onPress={() => router.replace('/onboarding')}
            style={{ 
              backgroundColor: '#3B82F6', 
              paddingHorizontal: 24, 
              paddingVertical: 12, 
              borderRadius: 12, 
              marginTop: 24 
            }}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>Start Onboarding</Text>
        </Pressable>
      </SafeAreaView>
      </LinearGradient>
    )
  }

  // If user has completed onboarding but profile isn't loaded yet, show loading
  if (!profile && isOnboardingComplete) {
    return (
      <LinearGradient 
        colors={['#2D1B69', '#1E0A3C', '#0A0617']}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
          <Text style={styles.loadingText}>Loading your profile...</Text>
          <Text style={[styles.loadingText, { fontSize: 14, marginTop: 16, opacity: 0.7 }]}>
            This might take a moment...
          </Text>
          <Pressable 
            onPress={() => {
              console.log('Manual refresh requested')
              // Force refresh or fallback
              router.replace('/onboarding')
            }}
            style={{ 
              backgroundColor: '#3B82F6', 
              paddingHorizontal: 24, 
              paddingVertical: 12, 
              borderRadius: 12, 
              marginTop: 24 
            }}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>Restart Setup</Text>
          </Pressable>
        </SafeAreaView>
      </LinearGradient>
    )
  }

  // If profile exists but missing critical data, show a setup incomplete message
  if (profile && !profile.streak_start) {
    return (
      <LinearGradient 
        colors={['#2D1B69', '#1E0A3C', '#0A0617']}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
          <Text style={styles.loadingText}>Setup Incomplete</Text>
          <Text style={[styles.loadingText, { fontSize: 14, marginTop: 16, opacity: 0.7, textAlign: 'center' }]}>
            Your profile is missing some important information. Please complete the setup process.
          </Text>
          <Pressable 
            onPress={() => {
              console.log('Redirecting to complete onboarding')
              router.replace('/onboarding')
            }}
            style={{ 
              backgroundColor: '#3B82F6', 
              paddingHorizontal: 24, 
              paddingVertical: 12, 
              borderRadius: 12, 
              marginTop: 24 
            }}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>Complete Setup</Text>
          </Pressable>
        </SafeAreaView>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient 
      colors={['#2D1B69', '#1E0A3C', '#0A0617']}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.appTitle}>exhale</Text>
              <Text style={styles.subtitle}>
                {profile?.name ? `Hi ${profile.name}` : 'No Contact Tracker'}
              </Text>
            </View>
            <Pressable onPress={handleSettings} style={styles.settingsButton}>
              <Ionicons name="settings-outline" size={20} color="rgba(255, 255, 255, 0.7)" />
        </Pressable>
          </View>

          {/* Weekly Progress Tracker */}
          <View style={styles.weeklyContainer}>
            <View style={styles.weeklyTracker}>
              {generateWeeklyTracker()}
            </View>
          </View>

          {/* Main Metallic Progress Circle (no longer a button) */}
          <View 
            style={styles.mainProgressContainer}
          >
            <View style={styles.metallicCircleContainer}>
              {/* Metallic progress circle */}
              <Animated.View 
                style={[
                  styles.metallicCircle,
                  {
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              >
                <SkiaBadge
                  size={240}
                  variant={currentMilestone ? currentMilestone.variant : 'bronze'}
                  subdued={!currentMilestone}
                />
              </Animated.View>
            </View>

            {/* Center Stats */}
            <View style={styles.centerStats}>
              <Text style={styles.mainLabel}>You've been no-contact for:</Text>
              <View style={styles.timeDisplay}>
                <Text style={styles.mainTime}>
                  {(() => {
                    // Format elapsed time - show days, hours, and minutes
                    return `${daysSinceContact}d ${timeRemaining.hours}hrs ${timeRemaining.minutes}mins`
                  })()}
                </Text>
                <View style={styles.secondsContainer}>
                  <Text style={styles.seconds}>{timeRemaining.seconds}s</Text>
                </View>
              </View>
            </View>
          </View>

          {/* View Progress Button */}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              router.push('/progress')
            }}
            style={styles.progressButtonContainer}
          >
            <View style={styles.progressButton}>
              <View style={styles.progressButtonContent}>
                <View style={styles.progressIconContainer}>
                  <Ionicons name="trending-up" size={22} color="#22D3EE" />
                </View>
                <View style={styles.progressTextContainer}>
                  <Text style={styles.progressButtonTitle}>View Progress</Text>
                  <Text style={styles.progressButtonSubtitle}>Track your healing journey</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="rgba(255, 255, 255, 0.6)" />
              </View>
            </View>
          </Pressable>

          {/* Motivational Quote */}
          <View style={styles.quoteContainer}>
            <Text style={styles.quoteText}>
              ✨ {currentMessage} ✨
            </Text>
          </View>

          {/* Main Action Buttons */}
          <View style={styles.mainActions}>
            <Pressable 
              style={styles.actionCircle}
              onPress={handlePledge}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="hand-right" size={28} color="white" />
              </View>
              <Text style={styles.actionLabel}>Pledge</Text>
            </Pressable>

            <Pressable
              style={styles.actionCircle}
              onPress={handleMeditate}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="leaf" size={28} color="white" />
              </View>
              <Text style={styles.actionLabel}>Meditate</Text>
            </Pressable>

            <Pressable 
              style={styles.actionCircle}
              onPress={() => {
                // Reset functionality could go here
                console.log('Reset pressed')
              }}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="refresh" size={28} color="white" />
              </View>
              <Text style={styles.actionLabel}>Reset</Text>
            </Pressable>

            <Pressable 
              style={styles.actionCircle}
              onPress={handleSupport}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="ellipsis-horizontal" size={28} color="white" />
              </View>
              <Text style={styles.actionLabel}>More</Text>
            </Pressable>
          </View>

          {/* Panic Button */}
          <View style={styles.panicContainer}>
            <Pressable 
              style={styles.panicButton}
              onPress={handleEmergencySupport}
            >
              <LinearGradient
                colors={['#FF4444', '#CC0000']}
                style={styles.panicGradient}
              >
                <Ionicons name="warning" size={20} color="white" />
                <Text style={styles.panicText}>I'M THINKING ABOUT MY EX</Text>
              </LinearGradient>
            </Pressable>
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

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarHeader}>
              <Text style={styles.progressPercentage}>{Math.round(progressPercentage)}%</Text>
              <Text style={styles.progressLabel}>Brain Rewiring</Text>
              <Text style={styles.goalDate}>Goal on {new Date(Date.now() + (finalGoalDays - daysSinceContact) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${Math.min(progressPercentage, 100)}%` }]} />
            </View>
          </View>

          {/* Milestones Button */}
          <View style={styles.milestonesContainer}>
            <Pressable 
              style={styles.milestonesButton}
              onPress={() => {
                // Navigate to milestones page
                router.push('/milestones')
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              }}
            >
              <View style={styles.milestonesIcon}>
                <Ionicons name="trophy" size={24} color="#FFD700" />
              </View>
              <View style={styles.milestonesContent}>
                <Text style={styles.milestonesTitle}>Milestones</Text>
                <Text style={styles.milestonesSubtitle}>
                  {daysSinceContact >= finalGoalDays ? 'All achievements unlocked!' :
                   daysSinceContact >= 90 ? '4/5 achievements earned' :
                   daysSinceContact >= 30 ? '3/5 achievements earned' :
                   daysSinceContact >= 7 ? '2/5 achievements earned' :
                   daysSinceContact >= 1 ? '1/5 achievements earned' :
                   '0/5 achievements earned'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.5)" />
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
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    letterSpacing: -1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    marginTop: 4,
    letterSpacing: 0.2,
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
  weeklyTracker: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  weekDayContainer: {
    alignItems: 'center',
    gap: 8,
  },
  weekDayIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  weekDayIconText: {
    fontSize: 16,
    fontWeight: '600',
  },
  weekDayLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '500',
  },
  // Main Progress Container
  mainProgressContainer: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  metallicCircleContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  metallicCircle: {
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  centerStats: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  mainLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
  },
  mainTime: {
    color: 'white',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  secondsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  seconds: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },

  // Quote Section
  quoteContainer: {
    paddingHorizontal: 32,
    marginBottom: 24,
    alignItems: 'center',
  },
  quoteText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    opacity: 0.9,
  },

  // Panic Button
  panicContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  panicButton: {
    shadowColor: '#FF4444',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  panicGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  panicText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(20px)',
  },
  progressCard: {
    backgroundColor: 'rgba(34, 211, 238, 0.08)',
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
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  
  // Achievements Section
  achievementsContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  achievementsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  badgeItem: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  badgeLabelActive: {
    color: 'rgba(255, 255, 255, 0.8)',
  },

  // Milestones Button
  milestonesContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  milestonesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  milestonesIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestonesContent: {
    flex: 1,
  },
  milestonesTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  milestonesSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    fontWeight: '500',
  },
  // Main Actions
  mainActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 32,
    marginBottom: 28,
  },
  actionCircle: {
    alignItems: 'center',
    gap: 10,
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  actionLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    fontWeight: '600',
  },

  // Progress Bar
  progressBarContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  progressBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressPercentage: {
    color: '#4ECDC4',
    fontSize: 18,
    fontWeight: '700',
  },
  progressLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '500',
  },
  goalDate: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '500',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 3,
  },

  // Motivation
  motivationContainer: {
    paddingHorizontal: 32,
    marginBottom: 20,
    alignItems: 'center',
  },
  motivationText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 24,
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    opacity: 0.95,
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.7,
  },
  
  // Progress Button
  progressButtonContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
  },
  progressButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  progressButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    gap: 16,
  },
  progressIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(34, 211, 238, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.3)',
  },
  progressTextContainer: {
    flex: 1,
    gap: 4,
  },
  progressButtonTitle: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  progressButtonSubtitle: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
})
