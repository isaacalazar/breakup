import React, { useState, useEffect, useRef } from 'react'
import { View, Text, Pressable, Animated, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import * as Haptics from 'expo-haptics'

export default function MeditateScreen() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [timeLeft, setTimeLeft] = useState(5 * 60)
  const [selectedDuration, setSelectedDuration] = useState(5)
  const [isSessionActive, setIsSessionActive] = useState(false)

  const breatheAnim = useRef(new Animated.Value(0)).current
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const durations = [3, 5, 10, 15, 20]

  useEffect(() => {
    if (isPlaying) {
      startBreathingAnimation()
      startTimer()
    } else {
      stopBreathingAnimation()
      stopTimer()
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying])

  useEffect(() => {
    setTimeLeft(selectedDuration * 60)
  }, [selectedDuration])

  const startBreathingAnimation = () => {
    const breatheLoop = () => {
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (isPlaying) {
          breatheLoop()
        }
      })
    }
    breatheLoop()
  }

  const stopBreathingAnimation = () => {
    breatheAnim.stopAnimation()
  }

  const startTimer = () => {
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsPlaying(false)
          setIsSessionActive(false)
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const toggleMeditation = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setIsPlaying(!isPlaying)
    if (!isSessionActive) {
      setIsSessionActive(true)
    }
  }

  const resetSession = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setIsPlaying(false)
    setIsSessionActive(false)
    setTimeLeft(selectedDuration * 60)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const circleScale = breatheAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  })

  return (
    <LinearGradient colors={["#2D1B69", "#1E0A3C", "#0A0617"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <Text style={styles.title}>Meditate</Text>
        </View>

        <View style={styles.content}>
          {!isSessionActive ? (
            // Duration Selection
            <View style={styles.durationContainer}>
              <Text style={styles.subtitle}>Choose duration</Text>

              <View style={styles.durationGrid}>
                {durations.map((duration) => (
                  <Pressable
                    key={duration}
                    onPress={() => setSelectedDuration(duration)}
                    style={[
                      styles.durationButton,
                      selectedDuration === duration ? styles.durationButtonSelected : styles.durationButtonDefault
                    ]}
                  >
                    <Text style={[
                      styles.durationText,
                      selectedDuration === duration ? styles.durationTextSelected : styles.durationTextDefault
                    ]}>
                      {duration}m
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Pressable onPress={toggleMeditation} style={styles.beginButton}>
                <Text style={styles.beginText}>Begin</Text>
              </Pressable>
            </View>
          ) : (
            // Meditation Session
            <View style={styles.sessionContainer}>
              {/* Breathing Circle */}
              <View style={styles.circleContainer}>
                <Animated.View
                  style={[
                    styles.breathingCircle,
                    { transform: [{ scale: circleScale }] }
                  ]}
                >
                  <View style={styles.innerCircle}>
                    <Ionicons name="leaf" size={40} color="white" />
                  </View>
                </Animated.View>
              </View>

              {/* Timer */}
              <Text style={styles.timer}>{formatTime(timeLeft)}</Text>

              {/* Breathing Instructions */}
              <Text style={styles.instruction}>
                {isPlaying ? 'Breathe with the circle' : 'Ready to begin'}
              </Text>

              {/* Controls */}
              <View style={styles.controls}>
                <Pressable onPress={resetSession} style={styles.controlButton}>
                  <Ionicons name="refresh" size={20} color="white" />
                </Pressable>

                <Pressable onPress={toggleMeditation} style={styles.playButton}>
                  <Ionicons
                    name={isPlaying ? "pause" : "play"}
                    size={28}
                    color="white"
                    style={{ marginLeft: isPlaying ? 0 : 3 }}
                  />
                </Pressable>

                <Pressable
                  onPress={() => {
                    setIsPlaying(false)
                    setIsSessionActive(false)
                    setTimeLeft(selectedDuration * 60)
                  }}
                  style={styles.controlButton}
                >
                  <Ionicons name="stop" size={20} color="white" />
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  durationContainer: {
    alignItems: 'center',
  },
  subtitle: {
    color: 'white',
    fontSize: 18,
    marginBottom: 32,
    textAlign: 'center',
    opacity: 0.8,
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 48,
    gap: 12,
  },
  durationButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    margin: 4,
  },
  durationButtonSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  durationButtonDefault: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  durationText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  durationTextSelected: {
    fontWeight: '600',
  },
  durationTextDefault: {
    fontWeight: '500',
  },
  beginButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 24,
  },
  beginText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  sessionContainer: {
    alignItems: 'center',
  },
  circleContainer: {
    marginBottom: 48,
  },
  breathingCircle: {
    width: 192,
    height: 192,
    borderRadius: 96,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timer: {
    color: 'white',
    fontSize: 48,
    fontWeight: '300',
    marginBottom: 16,
  },
  instruction: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    marginBottom: 64,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
})