import { useEffect, useRef, useState } from 'react'
import { Animated, Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import LottieView from 'lottie-react-native'

const { width: screenWidth } = Dimensions.get('window')

interface SocialProofScreen {
  id: number
  icon: string
  title: string
  testimonial: string
  author: string
  impact: string
  stat: string
  statLabel: string
}

const socialProofData: SocialProofScreen[] = [
  {
    id: 1,
    icon: '💪',
    title: 'Reclaimed My Strength',
    testimonial: 'After 3 months of using Exhale, I finally stopped checking his social media. The personalized recovery plan and daily reminders gave me the structure I needed to focus on myself again.',
    author: 'Sarah, 26',
    impact: 'No contact for 4 months strong',
    stat: '90%',
    statLabel: 'feel stronger after 3 months'
  },
  {
    id: 2,
    icon: '🌱',
    title: 'Found My Worth Again',
    testimonial: 'Exhale helped me realize that my attachment patterns were keeping me stuck. The tools and exercises rebuilt my confidence from the ground up. I\'m dating again and setting healthy boundaries.',
    author: 'Marcus, 29',
    impact: 'Built lasting self-worth',
    stat: '85%',
    statLabel: 'develop healthier relationships'
  },
  {
    id: 3,
    icon: '🧘‍♀️',
    title: 'Inner Peace Restored',
    testimonial: 'The anxiety attacks stopped after following Exhale\'s program. I learned to process my emotions without reaching out to my ex. Now I wake up feeling grateful instead of heartbroken.',
    author: 'Emma, 24',
    impact: 'Anxiety-free for 6 months',
    stat: '92%',
    statLabel: 'experience reduced anxiety'
  },
  {
    id: 4,
    icon: '🎯',
    title: 'Laser-Focused on Goals',
    testimonial: 'Exhale didn\'t just help me get over my ex - it helped me get my life back on track. I got promoted, started a new hobby, and built amazing friendships. My energy is focused on what matters.',
    author: 'David, 31',
    impact: 'Career breakthrough & new friendships',
    stat: '88%',
    statLabel: 'achieve personal goals faster'
  },
  {
    id: 5,
    icon: '❤️',
    title: 'Ready for True Love',
    testimonial: 'After healing with Exhale, I met my current partner. I can love freely without the fear and attachment issues that destroyed my last relationship. This app literally changed my love life.',
    author: 'Jessica, 27',
    impact: 'In a healthy relationship for 1 year',
    stat: '94%',
    statLabel: 'find healthier love after healing'
  }
]

interface SocialProofCarouselProps {
  onComplete: () => void
}

export function SocialProofCarousel({ onComplete }: SocialProofCarouselProps) {
  const [currentScreen, setCurrentScreen] = useState(0)
  const scrollViewRef = useRef<ScrollView>(null)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      })
    ]).start()
  }, [fadeAnim, scaleAnim])

  const handleNext = () => {
    if (currentScreen < socialProofData.length - 1) {
      const nextScreen = currentScreen + 1
      setCurrentScreen(nextScreen)
      scrollViewRef.current?.scrollTo({
        x: nextScreen * screenWidth,
        animated: true
      })
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    } else {
      onComplete()
    }
  }

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x
    const screenIndex = Math.round(offsetX / screenWidth)
    setCurrentScreen(screenIndex)
  }

  const renderScreen = (screen: SocialProofScreen, index: number) => (
    <View key={screen.id} style={styles.screenContainer}>
      <Animated.View 
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        {/* Character illustration placeholder */}
        <View style={styles.illustrationContainer}>
          <View style={styles.characterPlaceholder}>
            <LottieView
              source={{ uri: 'https://lottie.host/1347cb18-acf8-4baf-9b85-df39899165b1/ozCJBEjHi6.lottie' }}
              autoPlay
              loop
              style={styles.characterAnimation}
            />
          </View>
        </View>

        <Text style={styles.title}>{screen.title}</Text>

        <Text style={styles.subtitle}>
          {screen.testimonial}
        </Text>

        <Text style={styles.description}>
          Understand your strengths and weaknesses, earn medals, and track your progress.
        </Text>
      </Animated.View>

      {/* Pagination dots */}
      <View style={styles.paginationContainer}>
        {socialProofData.map((_, dotIndex) => (
          <View
            key={dotIndex}
            style={[
              styles.paginationDot,
              {
                backgroundColor: dotIndex === currentScreen ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
                width: dotIndex === currentScreen ? 24 : 8,
              }
            ]}
          />
        ))}
      </View>

      {/* Next Button */}
      <View style={styles.nextButtonContainer}>
        <Pressable
          onPress={handleNext}
          style={styles.nextButton}
        >
          <Text style={styles.nextButtonText}>
            Next {'>'}
          </Text>
        </Pressable>
      </View>

      {/* Bottom indicator */}
      <View style={styles.bottomIndicator} />
    </View>
  )

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {socialProofData.map(renderScreen)}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenContainer: {
    width: screenWidth,
    flex: 1,
  },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    flex: 1,
    paddingTop: 20,
    paddingBottom: 80,
  },
  illustrationContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  characterPlaceholder: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(96, 165, 250, 0.3)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  characterAnimation: {
    width: 120,
    height: 120,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 36,
    paddingHorizontal: 12,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  description: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 6,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
  },
  nextButtonContainer: {
    paddingHorizontal: 32,
    paddingBottom: 16,
  },
  nextButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  nextButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '700',
  },
  bottomIndicator: {
    height: 4,
    backgroundColor: '#FFFFFF',
    marginHorizontal: screenWidth * 0.35,
    borderRadius: 2,
    marginBottom: 16,
  },
})