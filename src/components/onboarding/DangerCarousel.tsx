import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Dimensions, Pressable, ScrollView, Text, View } from 'react-native'
import { OnboardingButton } from './OnboardingButton'
import { OnboardingContainer } from './OnboardingContainer'

const { width } = Dimensions.get('window')

interface CarouselSlide {
  title: string
  subtitle: string
  description: string
  bulletPoints: string[]
  icon: string
}

const SLIDES: CarouselSlide[] = [
  {
    title: 'Toxic relationships drain energy',
    subtitle: '',
    description: 'More than 70% of people in toxic relationships report feeling emotionally exhausted, and a significant decrease in their overall well-being.',
    bulletPoints: [],
    icon: '💔'
  },
  {
    title: 'Breaking patterns works',
    subtitle: '',
    description: 'Studies show that 85% of people who commit to no-contact experience improved mental health within 30 days.',
    bulletPoints: [],
    icon: '⚠️'
  },
  {
    title: 'You deserve better',
    subtitle: '',
    description: 'Research proves that healthy relationships increase happiness by 3x and reduce stress levels by 60%.',
    bulletPoints: [],
    icon: '🌅'
  }
]

export default function DangerCarousel() {
  const router = useRouter()
  const [currentSlide, setCurrentSlide] = useState(0)

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
      router.push('/onboarding/social-proof')
    }
  }

  const handleBack = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    } else {
      router.back()
    }
  }

  const slide = SLIDES[currentSlide]

  return (
    <OnboardingContainer 
      step={8 + currentSlide} 
      totalSteps={12} 
      onBack={handleBack}
      variant="danger"
      showBackButton={true}
      hideProgress={true}
    >
      <View style={{ flex: 1 }}>
        {/* Content */}
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center', 
          paddingHorizontal: 40 
        }}>
          {/* Icon */}
          <View style={{ marginBottom: 60 }}>
            <Text style={{ fontSize: 150, textAlign: 'center' }}>
              {slide.icon}
            </Text>
          </View>

          {/* Title */}
          <Text style={{ 
            fontSize: 24, 
            fontWeight: '700', 
            color: 'white', 
            textAlign: 'center', 
            marginBottom: 30,
            lineHeight: 28,
            paddingHorizontal: 20
          }}>
            {slide.title}
          </Text>

          {/* Description */}
          <Text style={{ 
            fontSize: 16, 
            color: 'white', 
            textAlign: 'center', 
            marginBottom: 0,
            lineHeight: 22,
            fontWeight: '400',
            opacity: 0.9,
            paddingHorizontal: 20
          }}>
            {slide.description}
          </Text>
        </View>

        {/* Page Indicators */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'center', 
          alignItems: 'center',
          paddingBottom: 20
        }}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: index === currentSlide ? '#ffffff' : 'rgba(255,255,255,0.3)',
                marginHorizontal: 4,
              }}
            />
          ))}
        </View>

        {/* Next Button */}
        <View style={{ paddingHorizontal: 60, paddingBottom: 50 }}>
          <Pressable
            onPress={handleNext}
            style={{
              backgroundColor: 'white',
              paddingVertical: 14,
              paddingHorizontal: 40,
              borderRadius: 30,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <Text style={{
              color: '#000',
              fontSize: 18,
              fontWeight: '600',
            }}>
              Next {'>'}
            </Text>
          </Pressable>
        </View>
      </View>
    </OnboardingContainer>
  )
}