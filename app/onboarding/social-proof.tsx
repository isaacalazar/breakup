import { useRouter } from 'expo-router'
import { OnboardingContainer } from '../../src/components/onboarding/OnboardingContainer'
import { SocialProofCarousel } from '../../src/components/SocialProofCarousel'

export default function SocialProofScreen() {
  const router = useRouter()

  const handleComplete = () => {
    router.push('/onboarding/passport')
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <OnboardingContainer step={11} totalSteps={12} onBack={handleBack} hideProgress={true}>
      <SocialProofCarousel onComplete={handleComplete} />
    </OnboardingContainer>
  )
}