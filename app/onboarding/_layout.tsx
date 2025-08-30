import { Stack } from 'expo-router'

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="breakup-date" />
      <Stack.Screen name="last-contact" />
      <Stack.Screen name="goal" />
      <Stack.Screen name="triggers" />
      <Stack.Screen name="challenges" />
      <Stack.Screen name="motivations" />
      <Stack.Screen name="scales" />
      <Stack.Screen name="analysis" />
      <Stack.Screen name="letting-go" />
      <Stack.Screen name="toxic-patterns" />
      <Stack.Screen name="moving-forward" />
      <Stack.Screen name="passport" />
    </Stack>
  )
}