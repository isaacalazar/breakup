import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import SkiaBadge from '../src/components/SkiaBadge'
import { useAuth } from '../src/providers/AuthProvider'

const MILESTONES = [
  {
    id: 'day1',
    title: '1 Day',
    subtitle: 'First Step',
    description: 'Every journey begins with a single step. You\'ve made the commitment.',
    variant: 'bronze' as const,
    requirement: 1,
    reward: 'Bronze Achievement'
  },
  {
    id: 'week1',
    title: '1 Week',
    subtitle: 'Building Momentum',
    description: 'You\'re developing new patterns and breaking old habits.',
    variant: 'silver' as const,
    requirement: 7,
    reward: 'Silver Achievement'
  },
  {
    id: 'month1',
    title: '1 Month',
    subtitle: 'Major Milestone',
    description: 'Significant progress in your healing journey. Your brain is rewiring.',
    variant: 'gold' as const,
    requirement: 30,
    reward: 'Gold Achievement'
  },
  {
    id: 'month3',
    title: '3 Months',
    subtitle: 'Transformation',
    description: 'You\'ve shown incredible dedication and formed lasting new habits.',
    variant: 'platinum' as const,
    requirement: 90,
    reward: 'Platinum Achievement'
  },
  {
    id: 'goal',
    title: 'Goal Complete',
    subtitle: 'Master of Self',
    description: 'You\'ve achieved your personal goal and demonstrated true mastery.',
    variant: 'iridescent' as const,
    requirement: 0, // Will be set to user's goal
    reward: 'Ultimate Achievement'
  }
]

export default function MilestonesScreen() {
  const { profile } = useAuth()
  
  if (!profile) {
    return (
      <LinearGradient colors={['#2D1B69', '#1E0A3C', '#0A0617']} style={styles.container}>
        <SafeAreaView style={styles.container}>
          <Text style={styles.loadingText}>Loading...</Text>
        </SafeAreaView>
      </LinearGradient>
    )
  }

  const daysSinceContact = profile.streak_start 
    ? Math.max(0, Math.floor((new Date().getTime() - new Date(profile.streak_start).getTime()) / (1000 * 60 * 60 * 24)))
    : 0

  const finalGoalDays = profile.goal_days || 30

  // Update goal milestone requirement
  const milestones = MILESTONES.map(milestone => 
    milestone.id === 'goal' 
      ? { ...milestone, requirement: finalGoalDays, title: `${finalGoalDays} Days` }
      : milestone
  )

  const handleBadgePress = (milestone: typeof MILESTONES[0], isUnlocked: boolean) => {
    if (isUnlocked) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
  }

  return (
    <LinearGradient colors={['#2D1B69', '#1E0A3C', '#0A0617']} style={styles.container}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="rgba(255, 255, 255, 0.8)" />
          </Pressable>
          <Text style={styles.headerTitle}>Milestones</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Progress Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Your Progress</Text>
          <Text style={styles.summaryText}>
            {daysSinceContact} days no-contact • {milestones.filter(m => daysSinceContact >= m.requirement).length}/{milestones.length} achievements
          </Text>
        </View>

        {/* Milestones List */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {milestones.map((milestone, index) => {
            const isUnlocked = daysSinceContact >= milestone.requirement
            const daysRemaining = Math.max(0, milestone.requirement - daysSinceContact)
            
            return (
              <Pressable
                key={milestone.id}
                style={[
                  styles.milestoneCard,
                  isUnlocked && styles.milestoneCardUnlocked
                ]}
                onPress={() => handleBadgePress(milestone, isUnlocked)}
              >
                <View style={styles.milestoneContent}>
                  <View style={styles.badgeContainer}>
                    <SkiaBadge 
                      size={80} 
                      variant={milestone.variant}
                      subdued={!isUnlocked}
                    />
                    {isUnlocked && (
                      <View style={styles.unlockedIndicator}>
                        <Ionicons name="checkmark-circle" size={24} color="#4ECDC4" />
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.milestoneInfo}>
                    <View style={styles.milestoneHeader}>
                      <Text style={[
                        styles.milestoneTitle,
                        isUnlocked && styles.milestoneTitleUnlocked
                      ]}>
                        {milestone.title}
                      </Text>
                      <Text style={[
                        styles.milestoneSubtitle,
                        isUnlocked && styles.milestoneSubtitleUnlocked
                      ]}>
                        {milestone.subtitle}
                      </Text>
                    </View>
                    
                    <Text style={[
                      styles.milestoneDescription,
                      isUnlocked && styles.milestoneDescriptionUnlocked
                    ]}>
                      {milestone.description}
                    </Text>
                    
                    <View style={styles.milestoneFooter}>
                      {isUnlocked ? (
                        <Text style={styles.rewardText}>🏆 {milestone.reward}</Text>
                      ) : (
                        <Text style={styles.remainingText}>
                          {daysRemaining} days remaining
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              </Pressable>
            )
          })}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: 40,
  },

  // Summary
  summaryContainer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  summaryText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontWeight: '500',
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  // Milestone Cards
  milestoneCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  milestoneCardUnlocked: {
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    borderColor: 'rgba(78, 205, 196, 0.3)',
  },
  milestoneContent: {
    flexDirection: 'row',
    gap: 16,
  },
  badgeContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockedIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    padding: 2,
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneHeader: {
    marginBottom: 12,
  },
  milestoneTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  milestoneTitleUnlocked: {
    color: 'white',
  },
  milestoneSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.4)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  milestoneSubtitleUnlocked: {
    color: '#4ECDC4',
  },
  milestoneDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.5)',
    lineHeight: 20,
    marginBottom: 12,
    fontWeight: '500',
  },
  milestoneDescriptionUnlocked: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  milestoneFooter: {
    marginTop: 8,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
  },
  remainingText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.4)',
  },
})
