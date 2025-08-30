import { router } from 'expo-router'
import LottieView from 'lottie-react-native'
import { Text, View } from 'react-native'
import { OnboardingButton } from '../../src/components/onboarding/OnboardingButton'
import { OnboardingContainer } from '../../src/components/onboarding/OnboardingContainer'

export default function OnboardingIntroScreen() {
  const handleContinue = () => {
    router.push('/onboarding/gender')
  }

  const handleBack = () => {
    router.replace('/landing')
  }

  return (
    <OnboardingContainer step={0} totalSteps={9} onBack={handleBack}>
      <View className="flex-1 justify-center items-center px-8">
        <View className="items-center mb-8">
          <Text className="text-white text-4xl font-bold text-center mb-6">
            Let's personalize{'\n'}your journey
          </Text>
          <Text className="text-white/70 text-center text-base">
            Quick questions to tailor Exhale just for you
          </Text>
        </View>

        <View className="my-12">
          <LottieView
            source={{ uri: 'https://lottie.host/1347cb18-acf8-4baf-9b85-df39899165b1/ozCJBEjHi6.lottie' }}
            autoPlay
            loop
            style={{ width: 300, height: 300 }}
          />
        </View>

        <View className="items-center">
          <Text className="text-white/60 text-sm text-center">
            Takes 2 minutes • Fully customizable
          </Text>
        </View>
      </View>

      <View className="px-8 pb-12">
        <OnboardingButton title="Get Started" onPress={handleContinue} />
      </View>
    </OnboardingContainer>
  )
}