import { useState } from 'react'
import { View, Text, TextInput, Pressable, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { supabase } from '../../src/lib/supabase'

export default function SignUpScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const signUp = async () => {
    if (!email || password.length < 8) {
      Alert.alert('Error', 'Please enter a valid email and password (min 8 characters)')
      return
    }

    setLoading(true)
    try {
      console.log('Attempting signup with:', { email, hasPassword: !!password })
      console.log('Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL)
      console.log('Supabase Key exists:', !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      
      console.log('Signup response:', { data, error })
      
      if (error) {
        console.error('Signup error:', error)
        Alert.alert('Error', error.message)
      } else {
        Alert.alert('Success', 'Check your email to verify your account!')
        router.replace('/(tabs)/home')
      }
    } catch (e) {
      console.error('Network error:', e)
      Alert.alert('Network Error', 'Unable to connect to the server. Please check your internet connection and try again.')
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
            Get started
          </Text>
          <Text style={{
            fontSize: 16,
            color: '#8E8E93',
            textAlign: 'center'
          }}>
            Create an account to begin your journey
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
              placeholder="Create a password (min. 8 characters)"
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
              autoComplete="new-password"
            />
            {password.length > 0 && password.length < 8 && (
              <Text style={{
                color: '#FF3B30',
                fontSize: 14,
                marginTop: 4
              }}>
                Password must be at least 8 characters
              </Text>
            )}
          </View>

          <Pressable
            onPress={signUp}
            disabled={loading || !email || password.length < 8}
            style={{
              backgroundColor: (!email || password.length < 8) ? '#C7C7CC' : '#007AFF',
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
              {loading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/(auth)/sign-in')}
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
              Already have an account? Sign in
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