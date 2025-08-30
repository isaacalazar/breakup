import { useRouter } from 'expo-router'
import LottieView from 'lottie-react-native'
import { ScrollView, Text, View } from 'react-native'
import { OnboardingButton } from '../../src/components/onboarding/OnboardingButton'
import { OnboardingContainer } from '../../src/components/onboarding/OnboardingContainer'

export default function LettingGoScreen() {
  const router = useRouter()

  const handleContinue = () => {
    router.push('/onboarding/toxic-patterns')
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <OnboardingContainer step={8} totalSteps={12} onBack={handleBack} variant="danger">
      <ScrollView 
        contentContainerStyle={{ 
          flexGrow: 1, 
          justifyContent: 'center', 
          alignItems: 'center', 
          paddingHorizontal: 32, 
          paddingVertical: 20 
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Lottie Animation */}
        <View style={{ marginBottom: 24 }}>
          <LottieView
            source={{ uri: 'https://lottie.host/1347cb18-acf8-4baf-9b85-df39899165b1/ozCJBEjHi6.lottie' }}
            autoPlay
            loop
            style={{ width: 180, height: 180 }}
          />
        </View>

        {/* Title */}
        <Text style={{ 
          fontSize: 28, 
          fontWeight: 'bold', 
          color: 'white', 
          textAlign: 'center', 
          marginBottom: 16,
          lineHeight: 34
        }}>
          The Cost of{'\n'}Holding On
        </Text>

        {/* Description */}
        <Text style={{ 
          fontSize: 16, 
          color: '#e5e7eb', 
          textAlign: 'center', 
          marginBottom: 32,
          lineHeight: 22,
          paddingHorizontal: 10
        }}>
          Every day you stay in a toxic relationship, you're sacrificing your peace, your growth, and your future happiness.
        </Text>

        {/* Bullet Points */}
        <View style={{ width: '100%', marginBottom: 32 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ width: 8, height: 8, backgroundColor: '#dc2626', borderRadius: 4, marginRight: 16 }} />
            <Text style={{ color: '#fca5a5', fontSize: 16, lineHeight: 20 }}>Your mental health suffers</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ width: 8, height: 8, backgroundColor: '#dc2626', borderRadius: 4, marginRight: 16 }} />
            <Text style={{ color: '#fca5a5', fontSize: 16, lineHeight: 20 }}>You miss opportunities for growth</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 8, height: 8, backgroundColor: '#dc2626', borderRadius: 4, marginRight: 16 }} />
            <Text style={{ color: '#fca5a5', fontSize: 16, lineHeight: 20 }}>Your self-worth diminishes</Text>
          </View>
        </View>
      </ScrollView>

      <View style={{ paddingHorizontal: 24, paddingBottom: 32 }}>
        <OnboardingButton
          title="Continue"
          onPress={handleContinue}
        />
      </View>
    </OnboardingContainer>
  )
}
