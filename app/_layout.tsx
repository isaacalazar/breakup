import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as Linking from 'expo-linking';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import '../global.css';

import { useColorScheme } from '@/hooks/useColorScheme';
// import { SuperwallProvider } from 'expo-superwall';
import { supabase } from '../src/lib/supabase';
import { AuthProvider } from '../src/providers/AuthProvider';
import { SessionProvider } from '../src/providers/SessionProvider';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Handle OAuth deep links
  useEffect(() => {
    const handleUrl = async (url: string) => {
      console.log('=== DEEP LINK RECEIVED ===')
      console.log('Full URL:', url)

      if (url.includes('auth/callback')) {
        try {
          // Support PKCE code flow (recommended) and fallback to implicit token hash
          console.log('Processing OAuth callback...')

          const parsed = new URL(url)
          const code = parsed.searchParams.get('code')
          const errorDescription = parsed.searchParams.get('error_description')

          if (errorDescription) {
            console.error('OAuth error:', errorDescription)
          }

          if (code) {
            console.log('Auth code found, exchanging for session...')
            const { data, error } = await supabase.auth.exchangeCodeForSession(code)
            if (error) {
              console.error('Error exchanging code for session:', error)
            } else {
              console.log('✅ Session established via code exchange!', data.user?.id)
            }
          } else {
            // Fallback for implicit flow where tokens come in the URL fragment
            const urlParts = url.split('#')
            if (urlParts.length > 1) {
              const hashParams = new URLSearchParams(urlParts[1])
              const accessToken = hashParams.get('access_token')
              const refreshToken = hashParams.get('refresh_token')
              const expiresIn = hashParams.get('expires_in')
              const tokenType = hashParams.get('token_type')

              console.log('Extracted tokens (implicit fallback):', {
                hasAccessToken: !!accessToken,
                hasRefreshToken: !!refreshToken,
                expiresIn,
                tokenType
              })

              if (accessToken && refreshToken) {
                const { data, error } = await supabase.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken
                })
                if (error) {
                  console.error('Error setting session (implicit):', error)
                } else {
                  console.log('✅ Session established via implicit tokens!', data.user?.id)
                }
              } else {
                console.error('No code or tokens found in callback URL')
              }
            } else {
              console.error('No code and no hash fragment in callback URL')
            }
          }

          // Double-check session is established
          const { data: finalCheck } = await supabase.auth.getSession()
          console.log('Final session check:', !!finalCheck.session, finalCheck.session?.user?.id)
          
        } catch (error) {
          console.error('Error processing OAuth callback:', error)
        }
      }
    }

    // Handle initial URL (if app was opened via deep link)
    Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url)
    })

    // Handle subsequent URLs (when app is already open)
    const subscription = Linking.addEventListener('url', (event) => {
      handleUrl(event.url)
    })

    return () => subscription?.remove()
  }, [])

  if (!loaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <Text style={{ fontSize: 18, color: '#000' }}>Loading fonts...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      {/* <SuperwallProvider apiKeys={{ ios: process.env.EXPO_PUBLIC_SUPERWALL_IOS_KEY ?? 'pk_1RIA5NXccWoHvrOBbrqq3', android: process.env.EXPO_PUBLIC_SUPERWALL_ANDROID_KEY ?? 'pk_1RIA5NXccWoHvrOBbrqq3' }}> */}
        <AuthProvider>
          <SessionProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <Stack screenOptions={{ headerShown: false }} />
              <StatusBar style="auto" />
            </ThemeProvider>
          </SessionProvider>
        </AuthProvider>
      {/* </SuperwallProvider> */}
    </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
