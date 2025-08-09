import { View, Text, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useAuth } from '../src/providers/AuthProvider'

export default function PassportScreen() {
  const router = useRouter()
  const { profile } = useAuth()

  const motivations = profile?.motivations ? JSON.parse(profile.motivations) : []
  const streakDate = profile?.streak_start ? new Date(profile.streak_start).toLocaleDateString() : ''

  return (
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Your Exhale Passport</Text>
      
      <Text style={{ marginBottom: 10 }}>No Contact since: {streakDate}</Text>
      <Text style={{ marginBottom: 20 }}>Goal: {profile?.goal_days} days</Text>

      {motivations.slice(0, 2).map((motivation: string, index: number) => (
        <Text key={index} style={{ marginBottom: 5 }}>• {motivation}</Text>
      ))}

      <Pressable
        onPress={() => router.replace('/(tabs)/home')}
        style={{ backgroundColor: '#007AFF', padding: 15, marginTop: 30 }}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>Enter App</Text>
      </Pressable>
    </SafeAreaView>
  )
}