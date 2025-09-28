import { Pressable, Text, View, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useSession } from '../../src/providers/SessionProvider'
import { useAuth } from '../../src/providers/AuthProvider'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'

export default function ProfileScreen() {
  const { profile, signOut } = useAuth()
  const { resetSessionState } = useSession()

  const handleSignOut = async () => {
    try {
      await signOut()
      await resetSessionState()
    } finally {
      // Ensure we leave the tabs stack after sign-out
      router.replace('/landing')
    }
  }

  const name = profile?.name || 'Guest'
  const goalDays = profile?.goal_days ?? 30
  const triggersCount = Array.isArray(profile?.triggers) ? profile?.triggers.length : 0
  const age = profile?.age
  const attachmentScore = profile?.attachment_score

  const calculateDaysSinceStart = () => {
    if (!profile?.streak_start) return 0
    const startDate = new Date(profile.streak_start)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - startDate.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const currentStreak = calculateDaysSinceStart()
  const progressPercentage = Math.min((currentStreak / goalDays) * 100, 100)

  const StatCard = ({ title, value, icon, iconColor }: { title: string, value: string | number, icon: string, iconColor: string }) => (
    <View className="flex-1 bg-white/8 rounded-2xl p-4 mx-1 border border-white/10">
      <View className="flex-row items-center justify-between mb-2">
        <Ionicons name={icon as any} size={22} color={iconColor} />
      </View>
      <Text className="text-white text-2xl font-bold">{value}</Text>
      <Text className="text-white/70 text-sm font-medium">{title}</Text>
    </View>
  )

  const ActionButton = ({ title, subtitle, onPress, icon, variant = 'primary', iconColor = '#A78BFA' }: {
    title: string,
    subtitle?: string,
    onPress: () => void,
    icon: string,
    variant?: 'primary' | 'secondary',
    iconColor?: string
  }) => (
    <Pressable
      onPress={onPress}
      className={`w-full p-4 rounded-2xl border mb-3 flex-row items-center ${
        variant === 'primary'
          ? 'bg-[#5B21B6] border-[#7C3AED]/30'
          : 'bg-white/5 border-white/10'
      }`}
    >
      <View className={`w-12 h-12 rounded-xl items-center justify-center mr-4 ${
        variant === 'primary' ? 'bg-white/10' : 'bg-white/5'
      }`}>
        <Ionicons name={icon as any} size={24} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className="text-white font-semibold text-base">{title}</Text>
        {subtitle && <Text className="text-white/60 text-sm mt-1">{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </Pressable>
  )

  return (
    <LinearGradient colors={["#2D1B69", "#1E0A3C", "#0A0617"]} style={{ flex: 1 }}>
      <SafeAreaView className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="px-6 pt-4 pb-6">
            <Text className="text-white text-2xl font-bold">Profile</Text>
          </View>

          {/* Profile Info Card */}
          <View className="mx-6 mb-6 bg-white/8 rounded-3xl p-6 border border-white/10">
            <View className="flex-row items-center mb-6">
              <View className="w-16 h-16 bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] rounded-2xl items-center justify-center mr-4">
                <Text className="text-white text-2xl font-bold">
                  {name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-white text-xl font-bold">{name}</Text>
                {age && <Text className="text-white/70 text-base">{age} years old</Text>}
              </View>
            </View>

            {/* Progress Bar */}
            <View>
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-white/80 font-medium">Progress to Goal</Text>
                <Text className="text-[#A78BFA] font-semibold">{currentStreak}/{goalDays} days</Text>
              </View>
              <View className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <LinearGradient
                  colors={progressPercentage > 0 ? ['#10B981', '#34D399'] : ['transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    width: `${progressPercentage}%`,
                    height: '100%',
                    borderRadius: 9999
                  }}
                />
              </View>
            </View>
          </View>

          {/* Stats Grid */}
          <View className="px-6 mb-6">
            <Text className="text-white text-lg font-semibold mb-4">Your Stats</Text>
            <View className="flex-row mb-3">
              <StatCard
                title="Current Streak"
                value={currentStreak}
                icon="flame"
                iconColor="#FF6B35"
              />
              <StatCard
                title="Goal Days"
                value={goalDays}
                icon="flag"
                iconColor="#00D2FF"
              />
            </View>
            <View className="flex-row">
              <StatCard
                title="Triggers Identified"
                value={triggersCount}
                icon="warning"
                iconColor="#FFD93D"
              />
              {attachmentScore !== null && (
                <StatCard
                  title="Attachment Score"
                  value={attachmentScore}
                  icon="heart"
                  iconColor="#FF6B9D"
                />
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View className="px-6 mb-6">
            <Text className="text-white text-lg font-semibold mb-4">Manage Your Journey</Text>

            <ActionButton
              title="Trigger Library"
              subtitle="Explore and manage your triggers"
              icon="library"
              onPress={() => router.push('/trigger-library')}
              variant="primary"
              iconColor="#FFD93D"
            />

            <ActionButton
              title="Progress Analytics"
              subtitle="View detailed insights and trends"
              icon="analytics"
              onPress={() => router.push('/progress')}
              variant="secondary"
              iconColor="#00D2FF"
            />

            <ActionButton
              title="Milestones"
              subtitle="Track achievements and rewards"
              icon="trophy"
              onPress={() => router.push('/milestones')}
              variant="secondary"
              iconColor="#FFD93D"
            />

            <ActionButton
              title="Panic Tools"
              subtitle="Quick access to coping strategies"
              icon="medical"
              onPress={() => router.push('/panic')}
              variant="secondary"
              iconColor="#FF6B35"
            />
          </View>

          {/* Settings Section */}
          <View className="px-6 pb-8">
            <Text className="text-white text-lg font-semibold mb-4">Settings</Text>

            <ActionButton
              title="Sign Out"
              subtitle="Sign out of your account"
              icon="log-out"
              onPress={handleSignOut}
              variant="secondary"
              iconColor="#FF6B35"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  )
}
