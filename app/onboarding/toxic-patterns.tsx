import { useRouter } from 'expo-router'
import LottieView from 'lottie-react-native'
import { Text, View, ScrollView } from 'react-native'
import { OnboardingButton } from '../../src/components/onboarding/OnboardingButton'
import { OnboardingContainer } from '../../src/components/onboarding/OnboardingContainer'

export default function ToxicPatternsScreen() {
  const router = useRouter()

  const handleContinue = () => {
    router.push('/onboarding/moving-forward')
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <OnboardingContainer step={9} totalSteps={12} onBack={handleBack} variant="danger">
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
          Breaking Toxic{'\n'}Patterns
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
          Recognizing and breaking free from destructive relationship patterns is the first step toward healing and growth.
        </Text>

        {/* Bullet Points */}
        <View style={{ width: '100%', marginBottom: 32 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ width: 8, height: 8, backgroundColor: '#dc2626', borderRadius: 4, marginRight: 16 }} />
            <Text style={{ color: '#fca5a5', fontSize: 16, lineHeight: 20 }}>Emotional manipulation and control</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ width: 8, height: 8, backgroundColor: '#dc2626', borderRadius: 4, marginRight: 16 }} />
            <Text style={{ color: '#fca5a5', fontSize: 16, lineHeight: 20 }}>Inconsistent behavior and mixed signals</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ width: 8, height: 8, backgroundColor: '#dc2626', borderRadius: 4, marginRight: 16 }} />
            <Text style={{ color: '#fca5a5', fontSize: 16, lineHeight: 20 }}>Lack of respect for boundaries</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 8, height: 8, backgroundColor: '#dc2626', borderRadius: 4, marginRight: 16 }} />
            <Text style={{ color: '#fca5a5', fontSize: 16, lineHeight: 20 }}>One-sided effort and commitment</Text>
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
