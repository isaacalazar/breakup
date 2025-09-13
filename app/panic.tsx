import { Ionicons } from '@expo/vector-icons'
import Slider from '@react-native-community/slider'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../src/providers/AuthProvider'
import { journalService } from '../src/services/journalService'

export default function PanicScreen() {
  const router = useRouter()
  const { session } = useAuth()
  
  // Timer and breathing state
  const [timeRemaining, setTimeRemaining] = useState(60)
  const [breathPhase, setBreathPhase] = useState<'in' | 'hold' | 'out'>('in')
  const [isActive, setIsActive] = useState(true)
  const breathAnimation = useRef(new Animated.Value(0.7)).current
  
  // Modal states
  const [showQuickJournal, setShowQuickJournal] = useState(false)
  const [showSlipped, setShowSlipped] = useState(false)
  
  // Form states
  const [urgeLevel, setUrgeLevel] = useState(5)
  const [moodLevel, setMoodLevel] = useState(5)
  const [noteText, setNoteText] = useState('')
  const [slippedNote, setSlippedNote] = useState('')
  
  // Helper actions
  const [activeHelper, setActiveHelper] = useState<string | null>(null)

  const { width } = Dimensions.get('window')
  const circleSize = width * 0.6
  const strokeWidth = 8
  const radius = (circleSize - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI

  useEffect(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    startBreathingCycle()
    startTimer()
    
    return () => {
      breathAnimation.stopAnimation()
    }
  }, [])

  const startTimer = () => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }

  const startBreathingCycle = () => {
    const cycle = () => {
      // Inhale (4 seconds)
      setBreathPhase('in')
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      Animated.timing(breathAnimation, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      }).start(() => {
        if (!isActive) return
        
        // Hold (4 seconds)
        setBreathPhase('hold')
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        setTimeout(() => {
          if (!isActive) return
          
          // Exhale (6 seconds)
          setBreathPhase('out')
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
          Animated.timing(breathAnimation, {
            toValue: 0.7,
            duration: 6000,
            useNativeDriver: true,
          }).start(() => {
            if (isActive) {
              setTimeout(cycle, 200) // Brief pause before next cycle
            }
          })
        }, 4000)
      })
    }
    cycle()
  }

  const handleComplete = () => {
    setIsActive(false)
    Alert.alert('Nice work—urge passed.', '', [
      { text: 'OK', onPress: () => router.back() }
    ])
  }

  const handleImOK = () => {
    setIsActive(false)
    Alert.alert('Nice work—urge passed.', '', [
      { text: 'OK', onPress: () => router.back() }
    ])
  }

  const handleQuickJournalSave = async () => {
    if (!session?.user?.id) return
    
    try {
      const today = new Date().toISOString().split('T')[0]
      const now = new Date()
      const timeStr = now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: false 
      })
      
      const appendLine = `[${timeStr} • PANIC] Urge=${urgeLevel} Mood=${moodLevel} — "${noteText || 'no notes'}"`
      
      // Get existing entry or create new one
      const existingEntries = await journalService.getEntriesForDate(today)
      
      if (existingEntries.length > 0) {
        const existingEntry = existingEntries[0]
        const updatedBody = existingEntry.body + '\n' + appendLine
        await journalService.updateEntry(existingEntry.id, {
          mood: moodLevel,
          body: updatedBody
        })
      } else {
        await journalService.createEntry({
          entry_date: today,
          mood: moodLevel,
          body: appendLine
        })
      }
      
      setShowQuickJournal(false)
      Alert.alert('Nice work—urge passed.', '', [
        { text: 'OK', onPress: () => router.back() }
      ])
    } catch (error) {
      console.error('Error saving panic journal:', error)
      Alert.alert('Error', 'Couldn\'t save—will retry')
    }
  }

  const handleSlippedSave = async () => {
    if (!session?.user?.id) return
    
    try {
      const today = new Date().toISOString().split('T')[0]
      const now = new Date()
      const timeStr = now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: false 
      })
      
      const appendLine = `[${timeStr} • SLIPPED] Contacted them. "${slippedNote || 'no notes'}"`
      
      // Get existing entry or create new one
      const existingEntries = await journalService.getEntriesForDate(today)
      
      if (existingEntries.length > 0) {
        const existingEntry = existingEntries[0]
        const updatedBody = existingEntry.body + '\n' + appendLine
        await journalService.updateEntry(existingEntry.id, {
          mood: 3, // Default low mood for slip
          body: updatedBody
        })
      } else {
        await journalService.createEntry({
          entry_date: today,
          mood: 3,
          body: appendLine
        })
      }
      
      setShowSlipped(false)
      router.back()
    } catch (error) {
      console.error('Error saving slip journal:', error)
      Alert.alert('Error', 'Couldn\'t save—will retry')
    }
  }

  const getBreathText = () => {
    switch (breathPhase) {
      case 'in': return 'In 4'
      case 'hold': return 'Hold 4'  
      case 'out': return 'Out 6'
      default: return 'In 4'
    }
  }

  const helperActions = [
    {
      id: 'water',
      title: 'Drink water',
      instruction: 'Take slow sips of cold water to ground yourself'
    },
    {
      id: 'outside',
      title: 'Step outside', 
      instruction: 'Fresh air and change of environment helps reset'
    },
    {
      id: 'senses',
      title: '5-4-3-2-1 senses',
      instruction: '5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste'
    }
  ]

  return (
    <LinearGradient 
      colors={['#2D1B69', '#1E0A3C', '#0A0617']}
      style={styles.container}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="rgba(255, 255, 255, 0.7)" />
          </Pressable>
          <Text style={styles.headerTitle}>Panic Button</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Hero Message */}
          <View style={styles.heroMessage}>
            <Text style={styles.heroTitle}>
              YOU MADE A PROMISE{'\n'}TO YOURSELF TO NOT{'\n'}CONTACT THEM.
            </Text>
            <Text style={styles.heroSubtitle}>
              This urge will pass. Remember why you started.
            </Text>
          </View>

          {/* Breathing Timer */}
          <View style={styles.breathingTimer}>
            <View style={styles.timerContainer}>
              <Text style={styles.timerLabel}>BREATHE FOR</Text>
              <Text style={styles.timerDisplay}>{timeRemaining}s</Text>
            </View>
            
            {/* Simple breathing indicator */}
            <Animated.View 
              style={[
                styles.breathIndicator,
                {
                  transform: [{ scale: breathAnimation }]
                }
              ]}
            >
              <Text style={styles.breathPhaseText}>{getBreathText()}</Text>
            </Animated.View>
          </View>

          {/* Consequences Reminder */}
          <View style={styles.consequencesSection}>
            <Text style={styles.consequencesTitle}>Side effects of Contacting:</Text>
            
            <View style={styles.consequencesList}>
              <View style={styles.consequenceItem}>
                <Ionicons name="trending-down" size={20} color="#FF6B6B" />
                <View style={styles.consequenceText}>
                  <Text style={styles.consequenceTitle}>EMOTIONAL SETBACK</Text>
                  <Text style={styles.consequenceDesc}>Undoing weeks of healing progress.</Text>
                </View>
              </View>

              <View style={styles.consequenceItem}>
                <Ionicons name="eye-off" size={20} color="#FF6B6B" />
                <View style={styles.consequenceText}>
                  <Text style={styles.consequenceTitle}>CONFUSION</Text>
                  <Text style={styles.consequenceDesc}>Mixed signals that prevent closure.</Text>
                </View>
              </View>

              <View style={styles.consequenceItem}>
                <Ionicons name="heart-dislike" size={20} color="#FF6B6B" />
                <View style={styles.consequenceText}>
                  <Text style={styles.consequenceTitle}>RELATIONSHIP DAMAGE</Text>
                  <Text style={styles.consequenceDesc}>Decreased respect and boundaries.</Text>
                </View>
              </View>

              <View style={styles.consequenceItem}>
                <Ionicons name="people-outline" size={20} color="#FF6B6B" />
                <View style={styles.consequenceText}>
                  <Text style={styles.consequenceTitle}>SOCIAL ISOLATION</Text>
                  <Text style={styles.consequenceDesc}>Pushing away supportive friends.</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <Pressable style={styles.primaryButton} onPress={handleImOK}>
            <LinearGradient
              colors={['#4ECDC4', '#45B7D1']}
              style={styles.buttonGradient}
            >
              <Ionicons name="shield-checkmark" size={20} color="white" />
              <Text style={styles.primaryButtonText}>I'm not thinking of contacting</Text>
            </LinearGradient>
          </Pressable>
          
          <Pressable 
            style={styles.dangerButton} 
            onPress={() => setShowSlipped(true)}
          >
            <Ionicons name="warning" size={18} color="#FF6B6B" />
            <Text style={styles.dangerButtonText}>I contacted them</Text>
          </Pressable>

          <Pressable 
            style={styles.tertiaryButton} 
            onPress={() => setShowQuickJournal(true)}
          >
            <Text style={styles.tertiaryButtonText}>Quick Journal</Text>
          </Pressable>
        </View>
      </SafeAreaView>

      {/* Quick Journal Modal */}
      <Modal
        visible={showQuickJournal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <LinearGradient
          colors={['#2D1B69', '#1E0A3C', '#0A0617']}
          style={styles.modalContainer}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Pressable 
                style={styles.modalCloseButton}
                onPress={() => setShowQuickJournal(false)}
              >
                <Ionicons name="close" size={24} color="rgba(255, 255, 255, 0.6)" />
              </Pressable>
              <Text style={styles.modalTitle}>Quick Journal</Text>
              <View style={styles.modalHeaderSpacer} />
            </View>
            
            <View style={styles.modalContent}>
              {/* Urge Slider */}
              <View style={styles.sliderSection}>
                <View style={styles.sliderHeader}>
                  <Text style={styles.sliderLabel}>Urge Intensity</Text>
                  <View style={styles.sliderValue}>
                    <Text style={[styles.sliderValueText, { color: '#FF6B6B' }]}>{urgeLevel}</Text>
                    <Text style={styles.sliderValueMax}>/10</Text>
                  </View>
                </View>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={10}
                  step={1}
                  value={urgeLevel}
                  onValueChange={setUrgeLevel}
                  minimumTrackTintColor="#FF6B6B"
                  maximumTrackTintColor="rgba(255, 255, 255, 0.1)"
                  thumbTintColor="#FF6B6B"
                />
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabelText}>None</Text>
                  <Text style={styles.sliderLabelText}>Extreme</Text>
                </View>
              </View>

              {/* Mood Slider */}
              <View style={styles.sliderSection}>
                <View style={styles.sliderHeader}>
                  <Text style={styles.sliderLabel}>Current Mood</Text>
                  <View style={styles.sliderValue}>
                    <Text style={[styles.sliderValueText, { color: '#4ECDC4' }]}>{moodLevel}</Text>
                    <Text style={styles.sliderValueMax}>/10</Text>
                  </View>
                </View>
                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={10}
                  step={1}
                  value={moodLevel}
                  onValueChange={setMoodLevel}
                  minimumTrackTintColor="#4ECDC4"
                  maximumTrackTintColor="rgba(255, 255, 255, 0.1)"
                  thumbTintColor="#4ECDC4"
                />
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabelText}>Terrible</Text>
                  <Text style={styles.sliderLabelText}>Amazing</Text>
                </View>
              </View>

              {/* Note */}
              <View style={styles.noteSection}>
                <Text style={styles.noteLabel}>Notes (Optional)</Text>
                <View style={styles.noteInputContainer}>
                  <TextInput
                    style={styles.noteInput}
                    multiline
                    value={noteText}
                    onChangeText={setNoteText}
                    placeholder="How are you feeling right now? What triggered this?"
                    placeholderTextColor="rgba(255, 255, 255, 0.3)"
                    textAlignVertical="top"
                  />
                </View>
              </View>
            </View>

            <View style={styles.modalActions}>
              <Pressable style={styles.saveButton} onPress={handleQuickJournalSave}>
                <LinearGradient
                  colors={['#4ECDC4', '#45B7D1']}
                  style={styles.saveButtonGradient}
                >
                  <Text style={styles.saveButtonText}>Save Entry</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </Modal>

      {/* I Slipped Modal */}
      <Modal
        visible={showSlipped}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <LinearGradient
          colors={['#2D1B69', '#1E0A3C', '#0A0617']}
          style={styles.modalContainer}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Pressable 
                style={styles.modalCloseButton}
                onPress={() => setShowSlipped(false)}
              >
                <Ionicons name="close" size={24} color="rgba(255, 255, 255, 0.6)" />
              </Pressable>
              <Text style={[styles.modalTitle, { color: '#FF6B6B' }]}>I Slipped</Text>
              <View style={styles.modalHeaderSpacer} />
            </View>
            
            <View style={styles.modalContent}>
              <View style={styles.slippedMessage}>
                <Ionicons name="heart" size={24} color="#FF6B6B" />
                <Text style={styles.slippedMessageText}>
                  It's okay. Recovery isn't linear. Let's learn from this moment and keep moving forward.
                </Text>
              </View>

              <View style={styles.noteSection}>
                <Text style={styles.noteLabel}>What happened? (Optional)</Text>
                <View style={styles.noteInputContainer}>
                  <TextInput
                    style={styles.noteInput}
                    multiline
                    value={slippedNote}
                    onChangeText={setSlippedNote}
                    placeholder="What led to this moment? How are you feeling now?"
                    placeholderTextColor="rgba(255, 255, 255, 0.3)"
                    textAlignVertical="top"
                  />
                </View>
              </View>
            </View>

            <View style={styles.modalActions}>
              <Pressable style={styles.saveButton} onPress={handleSlippedSave}>
                <LinearGradient
                  colors={['#FF6B6B', '#FF8E53']}
                  style={styles.saveButtonGradient}
                >
                  <Text style={styles.saveButtonText}>Record & Continue</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </Modal>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: 40,
  },

  // Main Content
  mainContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },

  // Hero Message
  heroMessage: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 8,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    lineHeight: 30,
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },

  // Breathing Timer
  breathingTimer: {
    alignItems: 'center',
    marginBottom: 40,
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.2)',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  timerLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  timerDisplay: {
    fontSize: 36,
    fontWeight: '800',
    color: '#4ECDC4',
    letterSpacing: -1,
  },
  breathIndicator: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(78, 205, 196, 0.4)',
  },
  breathPhaseText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4ECDC4',
    textAlign: 'center',
  },

  // Consequences Section
  consequencesSection: {
    marginBottom: 32,
  },
  consequencesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 20,
    textAlign: 'center',
  },
  consequencesList: {
    gap: 16,
  },
  consequenceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 107, 107, 0.05)',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FF6B6B',
    gap: 12,
  },
  consequenceText: {
    flex: 1,
  },
  consequenceTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF6B6B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  consequenceDesc: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 18,
    fontWeight: '500',
  },

  // Bottom Actions
  bottomActions: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
    gap: 12,
  },
  primaryButton: {
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    borderWidth: 2,
    borderColor: '#FF6B6B',
    gap: 8,
  },
  dangerButtonText: {
    color: '#FF6B6B',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  tertiaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  tertiaryButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '600',
  },

  // Modals
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  modalHeaderSpacer: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  
  // Slipped Message
  slippedMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 32,
    gap: 12,
  },
  slippedMessageText: {
    flex: 1,
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },

  // Sliders
  sliderSection: {
    marginBottom: 32,
  },
  sliderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  sliderValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  sliderValueText: {
    fontSize: 20,
    fontWeight: '800',
  },
  sliderValueMax: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '600',
    marginLeft: 2,
  },
  slider: {
    width: '100%',
    height: 44,
    marginBottom: 12,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabelText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '500',
  },

  // Note Input  
  noteSection: {
    marginBottom: 32,
  },
  noteLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginBottom: 16,
  },
  noteInputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  noteInput: {
    padding: 20,
    color: 'white',
    fontSize: 15,
    lineHeight: 22,
    minHeight: 120,
    textAlignVertical: 'top',
    fontWeight: '500',
  },

  // Modal Actions
  modalActions: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
  },
  saveButton: {
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  saveButtonGradient: {
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
})