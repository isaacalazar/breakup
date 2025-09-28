import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Linking,
} from 'react-native'
import { Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../src/providers/AuthProvider'
import { journalService } from '../src/services/journalService'

export default function PanicScreen() {
  const router = useRouter()
  const { session } = useAuth()

  // Modal and screen states
  const [showUrgeTimer, setShowUrgeTimer] = useState(false)
  const [showGrounding, setShowGrounding] = useState(false)
  const [showBarriers, setShowBarriers] = useState(false)
  const [showJournal, setShowJournal] = useState(false)
  const [showSafetyKit, setShowSafetyKit] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  // Checklist state
  type ChecklistItem = { id: string; label: string; checked: boolean }
  const DEFAULT_CHECKLIST: ChecklistItem[] = [
    { id: 'block-number', label: 'Block their phone number', checked: false },
    { id: 'ig-mute', label: 'Mute/unfollow on Instagram', checked: false },
    { id: 'x-unfollow', label: 'Unfollow on Twitter/X', checked: false },
    { id: 'snap-remove', label: 'Remove from Snapchat', checked: false },
    { id: 'wa-block', label: 'Block on WhatsApp', checked: false },
    { id: 'fb-hide', label: 'Hide Facebook posts', checked: false },
  ]
  const [checklist, setChecklist] = useState<ChecklistItem[]>(DEFAULT_CHECKLIST)
  const CHECKLIST_KEY = 'panicChecklist:v1'

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(CHECKLIST_KEY)
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed)) setChecklist(parsed)
        }
      } catch {}
    })()
  }, [])

  useEffect(() => {
    AsyncStorage.setItem(CHECKLIST_KEY, JSON.stringify(checklist)).catch(() => {})
  }, [checklist])

  // Timer states
  const [timeLeft, setTimeLeft] = useState(5 * 60) // 5 minutes
  const [isTimerActive, setIsTimerActive] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | number | null>(null)

  // Breathing states
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold1' | 'exhale' | 'hold2'>('inhale')
  const [breathingCount, setBreathingCount] = useState(4)
  const breathingRef = useRef<NodeJS.Timeout | number | null>(null)

  // Journal states
  const [urgeIntensity, setUrgeIntensity] = useState(5)
  const [selectedTrigger, setSelectedTrigger] = useState('')
  const [journalNote, setJournalNote] = useState('')

  // Grounding states
  const [groundingStep, setGroundingStep] = useState(0)
  const groundingSteps = [
    { title: '5 things you can SEE', icon: 'eye' },
    { title: '4 things you can TOUCH', icon: 'hand-left' },
    { title: '3 things you can HEAR', icon: 'volume-high' },
    { title: '2 things you can SMELL', icon: 'flower' },
    { title: '1 thing you can TASTE', icon: 'cafe' }
  ]

  const triggers = ['Loneliness', 'Memories', 'Social Media', 'Music', 'Places', 'Stress', 'Boredom', 'Other']

  // Timer functions
  useEffect(() => {
    if (isTimerActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsTimerActive(false)
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current as NodeJS.Timeout)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current as NodeJS.Timeout)
      }
    }
  }, [isTimerActive, timeLeft])

  // Cleanup breathing interval on unmount
  useEffect(() => {
    return () => {
      stopBreathing()
    }
  }, [])

  const startUrgeTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setTimeLeft(5 * 60)
    setIsTimerActive(true)
    setShowUrgeTimer(true)
    startBreathing()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Breathing functions
  const startBreathing = () => {
    if (breathingRef.current) clearInterval(breathingRef.current)

    let currentPhase: typeof breathingPhase = 'inhale'
    let count = 4

    breathingRef.current = setInterval(() => {
      count--
      setBreathingCount(count)

      if (count <= 0) {
        count = 4
        switch (currentPhase) {
          case 'inhale':
            currentPhase = 'hold1'
            break
          case 'hold1':
            currentPhase = 'exhale'
            break
          case 'exhale':
            currentPhase = 'hold2'
            break
          case 'hold2':
            currentPhase = 'inhale'
            break
        }
        setBreathingPhase(currentPhase)
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      }
    }, 1000)
  }

  const stopBreathing = () => {
    if (breathingRef.current) {
      clearInterval(breathingRef.current)
      breathingRef.current = null
    }
  }

  // Journal functions
  const saveUrgeLog = async () => {
    if (!session?.user?.id) return

    try {
      const today = new Date().toISOString().split('T')[0]
      const now = new Date()
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: false
      })

      const logEntry = `[${timeStr} • URGE] Intensity: ${urgeIntensity}/10, Trigger: ${selectedTrigger}, Note: ${journalNote || 'None'}`

      const existingEntries = await journalService.getEntriesForDate(today)

      if (existingEntries.length > 0) {
        const existingEntry = existingEntries[0]
        const updatedBody = existingEntry.body + '\n' + logEntry
        await journalService.updateEntry(existingEntry.id, {
          mood: urgeIntensity <= 3 ? 8 : urgeIntensity <= 6 ? 5 : 2,
          body: updatedBody
        })
      } else {
        await journalService.createEntry({
          entry_date: today,
          mood: urgeIntensity <= 3 ? 8 : urgeIntensity <= 6 ? 5 : 2,
          body: logEntry
        })
      }

      setShowJournal(false)
      Alert.alert('Logged', 'Your urge has been recorded. You\'re doing great.')
    } catch (error) {
      console.error('Error saving urge log:', error)
      Alert.alert('Error', 'Could not save log')
    }
  }

  const handleSlip = () => {
    if (Platform.OS !== 'ios') {
      // Fallback to Quick Journal on Android / Web
      setSelectedTrigger('Slip')
      setJournalNote('')
      setUrgeIntensity(2)
      setShowJournal(true)
      return
    }

    Alert.prompt(
      'I slipped',
      'What happened? (optional)',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log', onPress: async (text) => {
          if (!session?.user?.id) return

          try {
            const today = new Date().toISOString().split('T')[0]
            const now = new Date()
            const timeStr = now.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: false
            })

            const logEntry = `[${timeStr} • SLIP] ${text || 'No details'}`

            const existingEntries = await journalService.getEntriesForDate(today)

            if (existingEntries.length > 0) {
              const existingEntry = existingEntries[0]
              const updatedBody = existingEntry.body + '\n' + logEntry
              await journalService.updateEntry(existingEntry.id, {
                mood: 2,
                body: updatedBody
              })
            } else {
              await journalService.createEntry({
                entry_date: today,
                mood: 2,
                body: logEntry
              })
            }

            Alert.alert('Logged', 'Recovery is a journey. Tomorrow is a fresh start.')
            router.back()
          } catch (error) {
            console.error('Error saving slip log:', error)
            Alert.alert('Error', 'Could not save log')
          }
        }}
      ],
      'plain-text'
    )
  }

  // Hide screen overlay
  if (isHidden) {
    return (
      <View style={styles.hiddenScreen}>
        <Text style={styles.hiddenText}>Notes</Text>
        <Pressable
          style={styles.showButton}
          onPress={() => setIsHidden(false)}
        >
          <Text style={styles.showButtonText}>Tap to show</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="close" size={24} color="white" />
          </Pressable>
          <Text style={styles.headerTitle}>PANIC</Text>
          <Pressable style={styles.hideButton} onPress={() => setIsHidden(true)}>
            <Ionicons name="eye-off" size={24} color="white" />
          </Pressable>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Main Action */}
          <View style={styles.mainSection}>
            <Pressable
              style={styles.calmButton}
              onPress={startUrgeTimer}
            >
              <Ionicons name="heart" size={32} color="white" />
              <Text style={styles.calmButtonText}>CALM NOW</Text>
              <Text style={styles.calmButtonSubtext}>5-minute urge timer</Text>
            </Pressable>
          </View>

          {/* Quick Tools */}
          <View style={styles.toolsSection}>
            <Text style={styles.sectionTitle}>Quick Tools</Text>

            <View style={styles.toolsGrid}>
              <Pressable
                style={styles.toolButton}
                onPress={() => setShowGrounding(true)}
              >
                <Ionicons name="hand-left" size={20} color="#00D2FF" />
                <Text style={styles.toolText}>5-4-3-2-1{'\n'}Grounding</Text>
              </Pressable>

              <Pressable
                style={styles.toolButton}
                onPress={() => setShowBarriers(true)}
              >
                <Ionicons name="shield" size={20} color="#FFD93D" />
                <Text style={styles.toolText}>Barrier{'\n'}Cards</Text>
              </Pressable>

              <Pressable
                style={styles.toolButton}
                onPress={() => setShowJournal(true)}
              >
                <Ionicons name="create" size={20} color="#FF6B35" />
                <Text style={styles.toolText}>Quick{'\n'}Journal</Text>
              </Pressable>

              <Pressable
                style={styles.toolButton}
                onPress={() => setShowSafetyKit(true)}
              >
                <Ionicons name="checkmark-done" size={20} color="#FF6B9D" />
                <Text style={styles.toolText}>Checklist</Text>
              </Pressable>
            </View>
          </View>

          {/* Outcome Buttons */}
          <View style={styles.outcomeSection}>
            <Text style={styles.sectionTitle}>How did it go?</Text>

            <Pressable
              style={styles.madeItButton}
              onPress={() => {
                Alert.alert('Great job!', 'You overcame the urge. That\'s real strength.')
                router.back()
              }}
            >
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <Text style={styles.madeItButtonText}>I made it</Text>
            </Pressable>

            <Pressable
              style={styles.slippedButton}
              onPress={handleSlip}
            >
              <Ionicons name="alert-circle" size={24} color="#FF4757" />
              <Text style={styles.slippedButtonText}>I slipped</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Urge Timer Modal */}
      <Modal
        visible={showUrgeTimer}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <LinearGradient colors={['#0F0F23', '#1A1A2E']} style={styles.container}>
          <SafeAreaView style={styles.container}>
            {/* Clean header with just close button */}
            <View style={styles.timerHeader}>
              <Pressable
                style={styles.timerCloseButton}
                onPress={() => {
                  setShowUrgeTimer(false)
                  setIsTimerActive(false)
                  setTimeLeft(5 * 60)
                  stopBreathing()
                }}
              >
                <Ionicons name="close" size={28} color="white" />
              </Pressable>
            </View>

            <View style={styles.timerContent}>
              {/* Progress ring with timer */}
              <View style={styles.timerSection}>
                <View style={styles.progressRing}>
                  <View style={styles.timerDisplay}>
                    <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
                    <Text style={styles.timerSubtext}>Stay strong</Text>
                  </View>
                </View>
              </View>

              {/* Breathing guidance */}
              <View style={styles.breathingSection}>
                <Text style={styles.breathingPhaseText}>
                  {breathingPhase === 'inhale' ? 'Breathe In' :
                   breathingPhase === 'hold1' ? 'Hold' :
                   breathingPhase === 'exhale' ? 'Breathe Out' : 'Hold'}
                </Text>
                <Text style={styles.breathingCounter}>{breathingCount}</Text>
              </View>

              {/* Simple pause button */}
              <View style={styles.timerControlsSection}>
                <Pressable
                  style={styles.pauseButton}
                  onPress={() => {
                    if (isTimerActive) {
                      setIsTimerActive(false)
                      stopBreathing()
                    } else {
                      setIsTimerActive(true)
                      startBreathing()
                    }
                  }}
                >
                  <Ionicons
                    name={isTimerActive ? "pause" : "play"}
                    size={20}
                    color="white"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.pauseButtonText}>{isTimerActive ? 'Pause' : 'Start'}</Text>
                </Pressable>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </Modal>

      {/* Grounding Modal */}
      <Modal
        visible={showGrounding}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
          <SafeAreaView style={styles.container}>
            <View style={styles.modalHeader}>
              <Pressable
                style={styles.modalCloseButton}
                onPress={() => {
                  setShowGrounding(false)
                  setGroundingStep(0)
                }}
              >
                <Ionicons name="close" size={24} color="white" />
              </Pressable>
              <Text style={styles.modalTitle}>5-4-3-2-1 Grounding</Text>
            </View>

            <View style={styles.groundingContent}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${((groundingStep + 1) / 5) * 100}%` }
                  ]}
                />
              </View>

              <View style={styles.groundingStep}>
                <Ionicons
                  name={groundingSteps[groundingStep].icon as any}
                  size={40}
                  color="#00D2FF"
                />
                <Text style={styles.groundingStepTitle}>
                  {groundingSteps[groundingStep].title}
                </Text>
                <Text style={styles.groundingInstruction}>
                  Take your time and notice each one
                </Text>
              </View>

              <Pressable
                style={styles.groundingNext}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  if (groundingStep < 4) {
                    setGroundingStep(groundingStep + 1)
                  } else {
                    setShowGrounding(false)
                    setGroundingStep(0)
                    Alert.alert('Complete!', 'Well done. How do you feel now?')
                  }
                }}
              >
                <Text style={styles.groundingNextText}>
                  {groundingStep < 4 ? 'Next' : 'Complete'}
                </Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </Modal>

      {/* Barrier Cards Modal */}
      <Modal
        visible={showBarriers}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
          <SafeAreaView style={styles.container}>
            <View style={styles.modalHeader}>
              <Pressable
                style={styles.modalCloseButton}
                onPress={() => setShowBarriers(false)}
              >
                <Ionicons name="close" size={24} color="white" />
              </Pressable>
              <Text style={styles.modalTitle}>Barrier Cards</Text>
            </View>

            <ScrollView style={styles.barriersContent}>
              {[
                'You\'re healing and growing stronger every day',
                'Contacting them won\'t change the past',
                'Your worth isn\'t determined by their response',
                'This urge will pass in a few minutes',
                'You\'ve come so far in your recovery',
                'Breaking no contact resets your progress'
              ].map((barrier, index) => (
                <View key={index} style={styles.barrierCard}>
                  <Ionicons name="shield-checkmark" size={24} color="#FFD93D" />
                  <Text style={styles.barrierText}>{barrier}</Text>
                </View>
              ))}

              <View style={styles.costCard}>
                <Text style={styles.costTitle}>Cost of Breaking No Contact:</Text>
                <Text style={styles.costText}>
                  • Emotional setback{'\n'}
                  • Confusion and mixed signals{'\n'}
                  • Decreased self-respect{'\n'}
                  • Restart of healing process
                </Text>
              </View>
            </ScrollView>
          </SafeAreaView>
        </LinearGradient>
      </Modal>

      {/* Quick Journal Modal */}
      <Modal
        visible={showJournal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
          <SafeAreaView style={styles.container}>
            <View style={styles.modalHeader}>
              <Pressable
                style={styles.modalCloseButton}
                onPress={() => setShowJournal(false)}
              >
                <Ionicons name="close" size={24} color="white" />
              </Pressable>
              <Text style={styles.modalTitle}>Quick Journal</Text>
            </View>

            <ScrollView style={styles.journalContent}>
              <View style={styles.intensitySection}>
                <Text style={styles.journalLabel}>Urge Intensity (1-10)</Text>
                <View style={styles.intensitySlider}>
                  <Text style={styles.intensityValue}>{urgeIntensity}</Text>
                  <View style={styles.sliderTrack}>
                    {Array.from({ length: 10 }, (_, i) => (
                      <Pressable
                        key={i}
                        style={[
                          styles.sliderDot,
                          i < urgeIntensity && styles.sliderDotActive
                        ]}
                        onPress={() => setUrgeIntensity(i + 1)}
                      />
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.triggerSection}>
                <Text style={styles.journalLabel}>Trigger</Text>
                <View style={styles.triggerGrid}>
                  {triggers.map((trigger) => (
                    <Pressable
                      key={trigger}
                      style={[
                        styles.triggerChip,
                        selectedTrigger === trigger && styles.triggerChipSelected
                      ]}
                      onPress={() => setSelectedTrigger(trigger)}
                    >
                      <Text
                        style={[
                          styles.triggerChipText,
                          selectedTrigger === trigger && styles.triggerChipTextSelected
                        ]}
                      >
                        {trigger}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.noteSection}>
                <Text style={styles.journalLabel}>Note (optional)</Text>
                <TextInput
                  style={styles.noteInput}
                  placeholder="How are you feeling?..."
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  multiline
                  maxLength={120}
                  value={journalNote}
                  onChangeText={setJournalNote}
                />
                <Text style={styles.charCount}>{journalNote.length}/120</Text>
              </View>

              <Pressable style={styles.saveJournalButton} onPress={saveUrgeLog}>
                <Text style={styles.saveJournalText}>Save Entry</Text>
              </Pressable>
            </ScrollView>
          </SafeAreaView>
        </LinearGradient>
      </Modal>

      {/* Safety Kit Modal */}
      <Modal
        visible={showSafetyKit}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
          <SafeAreaView style={styles.container}>
            <View style={styles.modalHeader}>
              <Pressable
                style={styles.modalCloseButton}
                onPress={() => setShowSafetyKit(false)}
              >
                <Ionicons name="close" size={24} color="white" />
              </Pressable>
              <Text style={styles.modalTitle}>Checklist</Text>
            </View>

            <ScrollView style={styles.safetyContent}>
              <View style={styles.hotlineSection}>
                <Text style={styles.safetyLabel}>Crisis Hotlines</Text>

                <Pressable
                  style={styles.hotlineButton}
                  onPress={() => Linking.openURL('tel:988')}
                >
                  <Ionicons name="call" size={20} color="#FF6B35" />
                  <Text style={styles.hotlineText}>Suicide & Crisis Lifeline: 988</Text>
                </Pressable>

                <Pressable
                  style={styles.hotlineButton}
                  onPress={() => Linking.openURL('sms:741741')}
                >
                  <Ionicons name="chatbubble" size={20} color="#00D2FF" />
                  <Text style={styles.hotlineText}>Crisis Text Line: Text HOME to 741741</Text>
                </Pressable>
              </View>

              <View style={styles.checklistSection}>
                <Text style={styles.safetyLabel}>Block/Mute Checklist</Text>

                {checklist.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() =>
                      setChecklist((prev) => prev.map((c) => c.id === item.id ? { ...c, checked: !c.checked } : c))
                    }
                    style={styles.checklistItem}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: item.checked }}
                    accessibilityLabel={item.label}
                  >
                    <Ionicons
                      name={item.checked ? 'checkmark-circle' : 'ellipse-outline'}
                      size={22}
                      color={item.checked ? '#10B981' : 'rgba(255,255,255,0.5)'}
                    />
                    <Text style={[
                      styles.checklistText,
                      item.checked && { color: '#10B981' }
                    ]}>
                      {item.label}
                    </Text>
                  </Pressable>
                ))}

                <View style={styles.checklistActions}>
                  <Pressable
                    onPress={() => setChecklist(DEFAULT_CHECKLIST)}
                    style={styles.resetChecklist}
                  >
                    <Text style={styles.resetChecklistText}>Reset</Text>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        </LinearGradient>
      </Modal>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  // Base Styles
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 1,
  },
  hideButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 20,
  },

  // Hidden Screen
  hiddenScreen: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hiddenText: {
    fontSize: 24,
    color: '#333',
    marginBottom: 20,
  },
  showButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  showButtonText: {
    color: 'white',
    fontSize: 16,
  },

  // Main Section
  mainSection: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
  },
  calmButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FF4757',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF4757',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  calmButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  calmButtonSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },

  // Tools Section
  toolsSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  toolButton: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  toolText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },

  // Outcome Section
  outcomeSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  madeItButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 2,
    borderColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8,
  },
  madeItButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  slippedButton: {
    backgroundColor: 'rgba(255, 71, 87, 0.2)',
    borderWidth: 2,
    borderColor: '#FF4757',
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  slippedButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF4757',
  },

  // Modal Styles
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
  },

  // Timer Modal
  timerHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  timerCloseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  timerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  timerSection: {
    alignItems: 'center',
    marginBottom: 60,
  },
  progressRing: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 6,
    borderColor: '#FF4757',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 71, 87, 0.1)',
  },
  timerDisplay: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 56,
    fontWeight: '200',
    color: 'white',
    letterSpacing: -2,
  },
  timerSubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 8,
    fontWeight: '400',
  },
  breathingSection: {
    alignItems: 'center',
    marginBottom: 80,
  },
  breathingPhaseText: {
    fontSize: 28,
    fontWeight: '500',
    color: 'white',
    marginBottom: 16,
  },
  breathingCounter: {
    fontSize: 48,
    fontWeight: '300',
    color: '#00D2FF',
    letterSpacing: -1,
  },
  timerControlsSection: {
    alignItems: 'center',
  },
  pauseButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  pauseButtonText: {
    fontSize: 18,
    fontWeight: '500',
    color: 'white',
  },

  // Grounding Modal
  groundingContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginBottom: 40,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00D2FF',
    borderRadius: 2,
  },
  groundingStep: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groundingStepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginVertical: 20,
  },
  groundingInstruction: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 40,
  },
  groundingNext: {
    backgroundColor: '#00D2FF',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  groundingNextText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },

  // Barriers Modal
  barriersContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  barrierCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  barrierText: {
    fontSize: 16,
    color: 'white',
    marginLeft: 16,
    flex: 1,
    lineHeight: 20,
  },
  costCard: {
    backgroundColor: 'rgba(255, 71, 87, 0.1)',
    padding: 20,
    borderRadius: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 71, 87, 0.3)',
  },
  costTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF4757',
    marginBottom: 12,
  },
  costText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },

  // Journal Modal
  journalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  journalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 12,
  },
  intensitySection: {
    marginBottom: 30,
  },
  intensitySlider: {
    alignItems: 'center',
  },
  intensityValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 16,
  },
  sliderTrack: {
    flexDirection: 'row',
    gap: 8,
  },
  sliderDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  sliderDotActive: {
    backgroundColor: '#FF6B35',
  },
  triggerSection: {
    marginBottom: 30,
  },
  triggerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  triggerChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  triggerChipSelected: {
    backgroundColor: '#00D2FF',
    borderColor: '#00D2FF',
  },
  triggerChipText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  triggerChipTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  noteSection: {
    marginBottom: 30,
  },
  noteInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    color: 'white',
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  charCount: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'right',
    marginTop: 8,
  },
  saveJournalButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveJournalText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },

  // Safety Kit Modal
  safetyContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  safetyLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 16,
  },
  hotlineSection: {
    marginBottom: 30,
  },
  hotlineButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  hotlineText: {
    fontSize: 16,
    color: 'white',
    marginLeft: 12,
    flex: 1,
  },
  checklistSection: {
    marginBottom: 20,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  checklistText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginLeft: 12,
  },
  checklistActions: {
    marginTop: 10,
    alignItems: 'flex-end',
  },
  resetChecklist: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)'
  },
  resetChecklistText: {
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },
})
