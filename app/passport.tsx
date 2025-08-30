import { useRouter } from 'expo-router'
import { Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../src/providers/AuthProvider'

export default function PassportScreen() {
  const router = useRouter()
  const { profile } = useAuth()

  const goalDays = profile?.goal_days || 30
  const freeSince = profile?.streak_start ? new Date(profile.streak_start).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }) : '08/28/25'

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1a1a2e' }}>
      {/* Header with back button and progress */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 }}>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: 'white', fontSize: 24 }}>←</Text>
        </Pressable>
        <View style={{ width: 100, height: 4, backgroundColor: '#333', borderRadius: 2 }}>
          <View style={{ width: '100%', height: '100%', backgroundColor: '#007AFF', borderRadius: 2 }} />
        </View>
      </View>

      {/* Main content */}
      <View style={{ padding: 20, flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 32, fontWeight: 'bold', color: 'white', marginBottom: 10, textAlign: 'center' }}>
          Good News!
        </Text>
        <Text style={{ fontSize: 18, color: '#ccc', marginBottom: 30, textAlign: 'center' }}>
          We've built your profile. Your progress will be tracked here.
        </Text>

        {/* Bottom Info */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40, width: '100%' }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#ccc', fontSize: 16 }}>Goal</Text>
            <Text style={{ color: 'white', fontSize: 18 }}>{goalDays} days</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#ccc', fontSize: 16 }}>Free since</Text>
            <Text style={{ color: 'white', fontSize: 18 }}>{freeSince}</Text>
          </View>
        </View>
      </View>

      {/* Bottom Button */}
      <View style={{ padding: 20, paddingBottom: 40 }}>
        <Pressable
          onPress={() => router.replace('/(tabs)/home')}
          style={{
            backgroundColor: 'white',
            paddingVertical: 18,
            borderRadius: 25,
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 56
          }}
        >
          <Text style={{ 
            color: '#1a1a2e', 
            fontSize: 20, 
            fontWeight: 'bold'
          }}>
            Continue
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}