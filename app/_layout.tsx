import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';

import { useColorScheme } from '@/hooks/useColorScheme';
// import { SuperwallProvider } from 'expo-superwall';
import { AuthProvider } from '../src/providers/AuthProvider';
import { SessionProvider } from '../src/providers/SessionProvider';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <Text style={{ fontSize: 18, color: '#000' }}>Loading fonts...</Text>
      </View>
    );
  }

  return (
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
  );
}
