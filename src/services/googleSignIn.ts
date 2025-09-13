import * as AuthSession from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'
import { Platform } from 'react-native'
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin'
import { supabase } from '../lib/supabase'

WebBrowser.maybeCompleteAuthSession();

let googleConfigured = false

function ensureGoogleConfigured() {
  if (googleConfigured) return
  // Read client IDs from env (configure these in your project)
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID

  // On iOS, configuring without an iosClientId throws a native error.
  // If it's missing, skip configuring so we can fall back to web OAuth.
  if (Platform.OS === 'ios' && !iosClientId) {
    console.warn(
      'Google Sign-In: EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID is not set. Falling back to browser-based OAuth.'
    )
    return
  }

  GoogleSignin.configure({
    webClientId: webClientId || undefined,
    iosClientId: iosClientId || undefined,
    offlineAccess: true,
    // Force account selection to reduce stale cache issues
    forceCodeForRefreshToken: true,
  })
  googleConfigured = true
}

export const signInWithGoogle = async () => {
  // Prefer native sign-in on mobile for reliability
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    try {
      const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
      // If on iOS and no client ID, skip native flow to avoid RNGoogleSignin error
      if (Platform.OS === 'ios' && !iosClientId) {
        throw { code: 'IOS_CLIENT_ID_MISSING' }
      }
      ensureGoogleConfigured()
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
      // Optional: signOut first to avoid reusing a stale token
      try { await GoogleSignin.signOut() } catch {}
      const userInfo = await GoogleSignin.signIn()
      const idToken = (userInfo as any)?.data?.idToken || (userInfo as any)?.idToken
      if (!idToken) {
        return { success: false, error: 'No Google ID token returned' }
      }
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      })
      if (error) return { success: false, error: error.message }
      const { data: sessionData, error: sErr } = await supabase.auth.getSession()
      if (sErr) return { success: false, error: sErr.message }
      return { success: true, data: sessionData }
    } catch (e: any) {
      // If user cancelled, bubble a friendly response so UI can handle gracefully
      if (e?.code === statusCodes.SIGN_IN_CANCELLED) {
        return { success: false, error: 'cancelled', userCancelled: true }
      }
      if (e?.code === 'IOS_CLIENT_ID_MISSING') {
        console.warn('iOS client ID missing; using browser OAuth flow.')
      } else {
        console.warn('Native Google Sign-In failed, falling back to OAuth:', e)
      }
      // Fall through to web-based OAuth
    }
  }

  // Web or native fallback: OAuth via browser and code exchange
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'exhale',
    path: 'auth/callback',
    preferLocalhost: false,
    native: 'exhale://auth/callback',
  })
  console.log('REDIRECT:', redirectUri)

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUri,
      queryParams: { access_type: 'offline', prompt: 'consent' },
      skipBrowserRedirect: true as any,
    },
  })
  if (error) return { success: false, error: error.message }

  if (data?.url) {
    const res = await WebBrowser.openAuthSessionAsync(data.url, redirectUri)
    if (res.type !== 'success') return { success: false, error: 'cancelled', userCancelled: true }

    try {
      if (res.url) {
        const parsed = new URL(res.url)
        const code = parsed.searchParams.get('code')
        const errorDescription = parsed.searchParams.get('error_description')
        if (errorDescription) console.warn('OAuth error (browser result):', errorDescription)
        if (code) {
          const { error: exchErr } = await supabase.auth.exchangeCodeForSession(code)
          if (exchErr) {
            console.error('exchangeCodeForSession error (browser result):', exchErr)
          }
        } else if (res.url.includes('#')) {
          const [, hash] = res.url.split('#')
          const params = new URLSearchParams(hash)
          const accessToken = params.get('access_token')
          const refreshToken = params.get('refresh_token')
          if (accessToken && refreshToken) {
            const { error: setErr } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            })
            if (setErr) console.error('setSession error (browser result implicit):', setErr)
          }
        }
      }
    } catch (e) {
      console.warn('Error handling browser OAuth result:', e)
    }
  }

  const { data: sessionData, error: sErr } = await supabase.auth.getSession()
  if (sErr) return { success: false, error: sErr.message }
  return { success: true, data: sessionData }
}
