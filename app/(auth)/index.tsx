import { useState } from 'react'
import { View, Text, TextInput, Pressable, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '../../src/lib/supabase'

export default function AuthScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const signIn = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) Alert.alert('Error', error.message)
    setLoading(false)
  }

  const signUp = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) Alert.alert('Error', error.message)
    setLoading(false)
  }

  return (
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 30 }}>Exhale</Text>
      
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
        autoCapitalize="none"
      />
      
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
      />

      <Pressable
        onPress={signIn}
        disabled={loading}
        style={{ backgroundColor: '#007AFF', padding: 15, marginBottom: 10 }}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>Sign In</Text>
      </Pressable>

      <Pressable
        onPress={signUp}
        disabled={loading}
        style={{ backgroundColor: '#34C759', padding: 15 }}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>Sign Up</Text>
      </Pressable>
    </SafeAreaView>
  )
}