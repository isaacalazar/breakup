import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { supabase } from '../lib/supabase';

WebBrowser.maybeCompleteAuthSession();

export const signInWithGoogle = async () => {
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'exhale',
    path: 'auth/callback',
    preferLocalhost: false,
    native: 'exhale://auth/callback', // <- hard override
  });
  console.log('REDIRECT:', redirectUri); // must print exhale://auth/callback

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUri,
      queryParams: { access_type: 'offline', prompt: 'consent' },
      skipBrowserRedirect: true as any,
    },
  });
  if (error) return { success: false, error: error.message };

  if (data?.url) {
    const res = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);
    if (res.type !== 'success') return { success: false, error: 'cancelled', userCancelled: true };
  }

  const { data: sessionData, error: sErr } = await supabase.auth.getSession();
  if (sErr) return { success: false, error: sErr.message };
  return { success: true, data: sessionData };
};
