import { View, Text, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

export default function PanicScreen() {
  const router = useRouter()

  return (
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Panic Button</Text>
      
      <Text style={{ marginBottom: 10 }}>• Take 5 deep breaths</Text>
      <Text style={{ marginBottom: 10 }}>• Remember why you started</Text>
      <Text style={{ marginBottom: 10 }}>• This feeling will pass</Text>
      <Text style={{ marginBottom: 30 }}>• You are stronger than you think</Text>

      <Pressable
        onPress={() => router.back()}
        style={{ backgroundColor: '#007AFF', padding: 15 }}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>Back</Text>
      </Pressable>
    </SafeAreaView>
  )
}