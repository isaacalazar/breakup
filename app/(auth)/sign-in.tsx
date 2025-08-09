import { useState } from 'react'
import { View, Text, TextInput, Pressable, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { supabase } from '../../src/lib/supabase'

export default function SignInScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const signIn = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      Alert.alert('Error', error.message)
    }
    setLoading(false)
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View style={{ flex: 1, paddingHorizontal: 24, paddingVertical: 40 }}>
        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <Text style={{
            fontSize: 32,
            fontWeight: '700',
            color: '#1C1C1E',
            marginBottom: 8
          }}>
            Welcome back
          </Text>
          <Text style={{
            fontSize: 16,
            color: '#8E8E93',
            textAlign: 'center'
          }}>
            Sign in to continue your journey
          </Text>
        </View>

        {/* Form */}
        <View style={{ flex: 1 }}>
          <View style={{ marginBottom: 24 }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: '#1C1C1E',
              marginBottom: 8
            }}>
              Email
            </Text>
            <TextInput
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              style={{
                borderWidth: 1.5,
                borderColor: '#E5E5EA',
                backgroundColor: '#F2F2F7',
                paddingVertical: 16,
                paddingHorizontal: 16,
                borderRadius: 12,
                fontSize: 16
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          <View style={{ marginBottom: 32 }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: '#1C1C1E',
              marginBottom: 8
            }}>
              Password
            </Text>
            <TextInput
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={{
                borderWidth: 1.5,
                borderColor: '#E5E5EA',
                backgroundColor: '#F2F2F7',
                paddingVertical: 16,
                paddingHorizontal: 16,
                borderRadius: 12,
                fontSize: 16
              }}
              autoComplete="current-password"
            />
          </View>

          <Pressable
            onPress={signIn}
            disabled={loading || !email || !password}
            style={{
              backgroundColor: (!email || !password) ? '#C7C7CC' : '#007AFF',
              paddingVertical: 18,
              paddingHorizontal: 24,
              borderRadius: 16,
              marginBottom: 16,
              shadowColor: '#007AFF',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 12,
              elevation: 4
            }}
          >
            <Text style={{
              color: '#FFFFFF',
              fontSize: 18,
              fontWeight: '600',
              textAlign: 'center'
            }}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/(auth)/sign-up')}
            style={{
              paddingVertical: 16
            }}
          >
            <Text style={{
              color: '#007AFF',
              fontSize: 16,
              fontWeight: '500',
              textAlign: 'center'
            }}>
              Don't have an account? Sign up
            </Text>
          </Pressable>
        </View>

        {/* Back Button */}
        <Pressable
          onPress={() => router.back()}
          style={{
            backgroundColor: 'transparent',
            paddingVertical: 16,
            paddingHorizontal: 24,
            borderRadius: 12,
          }}
        >
          <Text style={{
            color: '#8E8E93',
            fontSize: 16,
            fontWeight: '500',
            textAlign: 'center'
          }}>
            Back
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}