import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../src/providers/AuthProvider'
import { generatePersonalizedPledgeContent, getTodaysPledge, PledgeAnalysis, PledgeRecord, savePledge } from '../src/services/pledgeService'

export default function PledgeScreen() {
  const router = useRouter()
  const { profile, user } = useAuth()
  
  const [hasPledged, setHasPledged] = useState(false)
  const [loading, setLoading] = useState(true)
  const [pledgeContent, setPledgeContent] = useState<PledgeAnalysis | null>(null)
  const [existingPledge, setExistingPledge] = useState<PledgeRecord | null>(null)
  const [submitting, setSubmitting] = useState(false)
  
  // Animation refs
  const scaleAnim = useRef(new Animated.Value(0.8)).current
  const fadeAnim = useRef(new Animated.Value(0)).current

  const { width } = Dimensions.get('window')

  useEffect(() => {
    loadPledgeData()
  }, [])

  useEffect(() => {
    if (!loading) {
      // Entrance animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [loading])

  const loadPledgeData = async () => {
    try {
      setLoading(true)
      
      console.log('Pledge screen - Auth state:', {
        hasUser: !!user,
        userId: user?.id,
        hasProfile: !!profile,
        profileId: profile?.id
      })
      
      // Check if user already made a pledge today
      if (user?.id) {
        const todaysPledge = await getTodaysPledge(user.id)
        if (todaysPledge) {
          setExistingPledge(todaysPledge)
          setHasPledged(true)
        }
      }
      
      // Generate AI-powered personalized content
      if (profile && user?.id) {
        // Add user_id to profile for caching
        const profileWithUserId = { ...profile, user_id: user.id }
        const content = await generatePersonalizedPledgeContent(profileWithUserId)
        setPledgeContent(content)
      }
    } catch (error) {
      console.error('Error loading pledge data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCurrentStreak = () => {
    if (!profile?.streak_start) return 0
    return Math.floor((new Date().getTime() - new Date(profile.streak_start).getTime()) / (1000 * 60 * 60 * 24))
  }

  const handlePledge = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'Please sign in to make a pledge.')
      return
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
    setSubmitting(true)
    
    try {
      // Save pledge to database
      const pledge = await savePledge(user.id)
      setExistingPledge(pledge)
      setHasPledged(true)
      
      // Success animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()

      setTimeout(() => {
        Alert.alert(
          'Pledge Made! 🙏',
          'Your commitment has been recorded. Stay strong today - you\'ve got this!',
          [
            { 
              text: 'Continue', 
              onPress: () => router.back(),
              style: 'default'
            }
          ]
        )
      }, 500)
      
    } catch (error) {
      console.error('Error saving pledge:', error)
      Alert.alert('Error', 'Could not save your pledge. Please try again.')
      setHasPledged(false)
    } finally {
      setSubmitting(false)
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
            <Text style={styles.loadingText}>Generating your personalized pledge...</Text>
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
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={28} color="white" />
          </Pressable>
          <Text style={styles.headerTitle}>
            {hasPledged ? 'Today\'s Pledge ✓' : 'Daily Pledge'}
          </Text>
          <View style={styles.streakBadge}>
            <Text style={styles.streakText}>{getCurrentStreak()}d</Text>
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
            {/* AI-Powered Personalized Content */}
            {pledgeContent && (
              <>
                {/* Personalized Compliment */}
                <View style={styles.aiSection}>
                  <View style={styles.aiHeader}>
                    <Ionicons name="sparkles" size={24} color="#22D3EE" />
                    <Text style={styles.aiHeaderText}>Your Personal Message</Text>
                  </View>
                  <Text style={styles.complimentText}>
                    {pledgeContent.personalizedCompliment}
                  </Text>
                </View>

                {/* Daily Affirmation */}
                <View style={styles.affirmationContainer}>
                  <Text style={styles.affirmationLabel}>Today's Affirmation</Text>
                  <Text style={styles.affirmationText}>
                    "{pledgeContent.dailyAffirmation}"
                  </Text>
                </View>

                {/* Progress Insight */}
                <View style={styles.insightCard}>
                  <View style={styles.insightHeader}>
                    <Ionicons name="trending-up" size={20} color="#4ECDC4" />
                    <Text style={styles.insightTitle}>Your Progress</Text>
                  </View>
                  <Text style={styles.insightText}>
                    {pledgeContent.progressInsight}
                  </Text>
                </View>

                {/* Motivational Reminder */}
                <View style={styles.reminderCard}>
                  <View style={styles.reminderHeader}>
                    <Ionicons name="heart" size={20} color="#FF6B6B" />
                    <Text style={styles.reminderTitle}>Remember Why</Text>
                  </View>
                  <Text style={styles.reminderText}>
                    {pledgeContent.motivationalReminder}
                  </Text>
                </View>
              </>
            )}

            {/* Pledge Action */}
            <View style={styles.pledgeActionContainer}>
              {hasPledged ? (
                <View style={styles.completedPledge}>
                  <Ionicons name="checkmark-circle" size={60} color="#4ECDC4" />
                  <Text style={styles.completedTitle}>Pledge Complete!</Text>
                  <Text style={styles.completedSubtitle}>
                    {pledgeContent?.encouragement || "You've made your commitment for today. Stay strong!"}
                  </Text>
                  <Text style={styles.completedDate}>
                    Pledged: {new Date().toLocaleDateString()}
                  </Text>
                </View>
              ) : (
                <View style={styles.pledgePrompt}>
                  <View style={styles.pledgeIconContainer}>
                    <Ionicons name="hand-right" size={48} color="rgba(255, 255, 255, 0.9)" />
                  </View>
                  <Text style={styles.pledgeTitle}>
                    Pledge No Contact Today
                  </Text>
                  <Text style={styles.pledgeSubtitle}>
                    {pledgeContent?.encouragement || "Make a commitment to yourself for just today."}
                  </Text>
                  
                  <Pressable 
                    style={[styles.pledgeButton, submitting && styles.pledgeButtonDisabled]}
                    onPress={handlePledge}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <ActivityIndicator size="small" color="#2D1B69" />
                    ) : (
                      <Text style={styles.pledgeButtonText}>Make My Pledge</Text>
                    )}
                  </Pressable>
                </View>
              )}
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
  
  // Loading
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
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  streakBadge: {
    backgroundColor: '#22D3EE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 44,
    alignItems: 'center',
  },
  streakText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },

  // Content
  scrollContainer: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // AI Section
  aiSection: {
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.2)',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  aiHeaderText: {
    color: '#22D3EE',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
    letterSpacing: -0.3,
  },
  complimentText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: 0.1,
  },

  // Affirmation
  affirmationContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  affirmationLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  affirmationText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 26,
    fontStyle: 'italic',
    letterSpacing: 0.2,
  },

  // Cards
  insightCard: {
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.2)',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightTitle: {
    color: '#4ECDC4',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  insightText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
  },

  reminderCard: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.2)',
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reminderTitle: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  reminderText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
  },

  // Pledge Action
  pledgeActionContainer: {
    alignItems: 'center',
  },

  // Completed Pledge
  completedPledge: {
    alignItems: 'center',
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    borderRadius: 24,
    padding: 32,
    borderWidth: 2,
    borderColor: 'rgba(78, 205, 196, 0.3)',
  },
  completedTitle: {
    color: '#4ECDC4',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  completedSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  completedDate: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontWeight: '500',
  },

  // Pledge Prompt
  pledgePrompt: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  pledgeIconContainer: {
    marginBottom: 20,
  },
  pledgeTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  pledgeSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },

  // Pledge Button
  pledgeButton: {
    backgroundColor: 'white',
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
    minWidth: 200,
    minHeight: 56,
  },
  pledgeButtonDisabled: {
    opacity: 0.7,
  },
  pledgeButtonText: {
    color: '#2D1B69',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
})
