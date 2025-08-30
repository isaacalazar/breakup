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
        <View style={styles.iconContainer}>
          <LottieView
            source={{ uri: 'https://lottie.host/1347cb18-acf8-4baf-9b85-df39899165b1/ozCJBEjHi6.lottie' }}
            autoPlay
            loop
            style={styles.lottie}
          />
        </View>

        <Text style={styles.title}>{screen.title}</Text>

        <View style={styles.testimonialContainer}>
          <Text style={styles.testimonialText}>"{screen.testimonial}"</Text>
          <Text style={styles.author}>— {screen.author}</Text>
        </View>

        <View style={styles.impactContainer}>
          <Text style={styles.impactLabel}>Real Impact:</Text>
          <Text style={styles.impactText}>{screen.impact}</Text>
        </View>

        <View style={styles.statContainer}>
          <Text style={styles.statNumber}>{screen.stat}</Text>
          <Text style={styles.statLabel}>of users {screen.statLabel}</Text>
        </View>

        <View style={styles.brandingContainer}>
          <Text style={styles.brandingText}>Powered by </Text>
          <Text style={styles.brandingName}>Exhale</Text>
        </View>
      </Animated.View>

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

      <View style={styles.paginationContainer}>
        {socialProofData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              {
                backgroundColor: index === currentScreen ? '#60a5fa' : 'rgba(255,255,255,0.3)',
                width: index === currentScreen ? 24 : 8,
              }
            ]}
          />
        ))}
      </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  contentContainer: {
    alignItems: 'center',
    maxWidth: screenWidth - 64,
    paddingBottom: 150, // Add space for button
  },
  iconContainer: {
    marginBottom: 24,
  },
  icon: {
    fontSize: 64,
  },
  lottie: {
    width: 80,
    height: 80,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 34,
  },
  testimonialContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  testimonialText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 18,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 16,
  },
  author: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    fontWeight: '500',
  },
  impactContainer: {
    backgroundColor: 'rgba(96, 165, 250, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 3,
    borderLeftColor: '#60a5fa',
  },
  impactLabel: {
    color: '#60a5fa',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  impactText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  statContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  statNumber: {
    color: '#60a5fa',
    fontSize: 48,
    fontWeight: '800',
    lineHeight: 52,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 4,
  },
  brandingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandingText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '400',
  },
  brandingName: {
    color: '#60a5fa',
    fontSize: 14,
    fontWeight: '700',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80, // More space above button
    gap: 8,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    transition: 'all 0.3s ease',
  },
  nextButtonContainer: {
    position: 'absolute',
    bottom: 120,
    left: 60,
    right: 60,
  },
  nextButton: {
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
  },
  nextButtonText: {
    color: '#60a5fa',
    fontSize: 18,
    fontWeight: '600',
  },
})