import * as AuthSession from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'
import { supabase } from '../lib/supabase'

// Complete the auth session in the browser
WebBrowser.maybeCompleteAuthSession()

export const signInWithGoogle = async () => {
  try {
    // Use Supabase's OAuth flow with Google
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: AuthSession.makeRedirectUri({
          scheme: 'exhale',
          path: 'auth/callback'
        }),
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) {
      console.error('Supabase OAuth error:', error)
      return { success: false, error: error.message }
    }

    if (data.url) {
      // Open the OAuth URL in the browser
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        AuthSession.makeRedirectUri({
          scheme: 'exhale',
          path: 'auth/callback'
        })
      )

      if (result.type === 'success' && result.url) {
        // Parse the URL to get the session
        const url = new URL(result.url)
        const accessToken = url.searchParams.get('access_token')
        const refreshToken = url.searchParams.get('refresh_token')

        if (accessToken) {
          // Set the session in Supabase
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          })

          if (sessionError) {
            console.error('Session error:', sessionError)
            return { success: false, error: sessionError.message }
          }

          console.log('Google sign in success:', sessionData)
          return { success: true, data: sessionData }
        }
      } else if (result.type === 'cancel') {
        return { success: false, error: 'cancelled', userCancelled: true }
      }
    }

    return { success: false, error: 'Authentication failed' }
  } catch (error: any) {
    console.error('Google Sign-In Error:', error)
    return { success: false, error: error.message || 'An unexpected error occurred' }
  }
}

export const signOutFromGoogle = async () => {
  try {
    // Sign out from Supabase
    await supabase.auth.signOut()
    return { success: true }
  } catch (error: any) {
    console.error('Google Sign-Out Error:', error)
    return { success: false, error: error.message }
  }
}