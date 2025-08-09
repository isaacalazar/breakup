import AsyncStorage from '@react-native-async-storage/async-storage'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { useState } from 'react'
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import "../global.css"
import { supabase } from '../src/lib/supabase'
import { combineLocalDateTimeToUTC, isValidISODate } from '../src/utils/date'

const TRIGGER_OPTIONS = [
  "Lonely", "Anxious/Spiraling", "Bored/Scrolling", "Late at night",
  "After drinking", "Seeing their posts", "Mutual friend mentions them", "Habit/reflex"
]

const CHALLENGE_OPTIONS = [
  "Intrusive thoughts", "Checking socials/messages", "Sleep problems",
  "Low self-worth", "Can't focus on work/school", "Feeling isolated"
]

const PANIC_OPTIONS = [
  "Breathing exercise", "Show my reasons not to go back",
  "5-minute distraction task", "Prompt me to text a friend",
  "Quick affirmations", "Start a 1-minute journal"
]

const MOTIVATION_OPTIONS = [
  "Feel like myself again", "Rebuild confidence", "Be more present with friends/family",
  "Focus on studies/work", "Better sleep & health", "Start new routines/hobbies"
]

export default function OnboardingScreen() {
  const [step, setStep] = useState(0)
  
  const [breakupDate, setBreakupDate] = useState('')
  const [lastContactDate, setLastContactDate] = useState('')
  const [lastContactTime, setLastContactTime] = useState('')
  const [lastContactPreset, setLastContactPreset] = useState<'same' | 'today' | 'yesterday' | 'week' | 'custom'>('same')
  const [goalDays, setGoalDays] = useState('')
  const [selectedGoalDays, setSelectedGoalDays] = useState<number | null>(30)
  const [triggers, setTriggers] = useState<string[]>([])
  const [challenges, setChallenges] = useState<string[]>([])
  const [panicTools, setPanicTools] = useState<string[]>([])
  const [motivations, setMotivations] = useState<string[]>([])
  const [readiness, setReadiness] = useState('5')
  const [attachment, setAttachment] = useState('5')

  const toggleSelection = (item: string, array: string[], setter: (arr: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item))
    } else {
      setter([...array, item])
    }
  }

  const isStepValid = () => {
    switch (step) {
      case 0: return isValidISODate(breakupDate)
      case 1: return lastContactPreset === 'custom' ? isValidISODate(lastContactDate) : true
      case 2: {
        const custom = parseInt(goalDays)
        const presetValid = typeof selectedGoalDays === 'number' && selectedGoalDays >= 7 && selectedGoalDays <= 365
        const customValid = !isNaN(custom) && custom >= 7 && custom <= 365
        return presetValid || customValid
      }
      case 7: return parseInt(readiness) >= 1 && parseInt(readiness) <= 10 && parseInt(attachment) >= 1 && parseInt(attachment) <= 10
      default: return true
    }
  }

  const nextStep = () => {
    if (step === 1 && !lastContactDate) {
      setLastContactDate(breakupDate)
    }
    if (step < 8) {
      setStep(step + 1)
    }
  }

  const saveProfile = async () => {
    // Resolve last-contact date based on preset or custom input
    const toISODate = (d: Date) => d.toISOString().slice(0, 10)
    const addDays = (d: Date, days: number) => {
      const copy = new Date(d)
      copy.setDate(copy.getDate() + days)
      return copy
    }
    const addMonths = (d: Date, months: number) => {
      const copy = new Date(d)
      copy.setMonth(copy.getMonth() + months)
      return copy
    }
    const addYears = (d: Date, years: number) => {
      const copy = new Date(d)
      copy.setFullYear(copy.getFullYear() + years)
      return copy
    }

    const today = new Date()
    const presetDate =
      lastContactPreset === 'week' ? toISODate(addDays(today, -7)) :
      lastContactPreset === 'month' ? toISODate(addMonths(today, -1)) :
      lastContactPreset === 'year' ? toISODate(addYears(today, -1)) :
      ''

    const effectiveLastContactDate = lastContactPreset === 'custom' ? lastContactDate : (lastContactPreset === 'same' ? '' : presetDate)

    const streak_start = combineLocalDateTimeToUTC(effectiveLastContactDate || breakupDate, lastContactTime || '09:00')
    const attachment_score = parseInt(attachment) * 10
    const readiness_score = parseInt(readiness) * 10

    const goalDaysValue = selectedGoalDays ?? parseInt(goalDays)

    const profileData = {
      breakup_date: breakupDate,
      streak_start,
      goal_days: goalDaysValue,
      triggers: JSON.stringify(triggers),
      challenges: JSON.stringify(challenges),
      panic_tools: JSON.stringify(panicTools),
      motivations: JSON.stringify(motivations),
      attachment_score,
      readiness_score,
    }

    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // User is logged in - save to database
      const { error } = await supabase
        .from('profiles')
        .upsert({ ...profileData, id: user.id })

      if (error) {
        Alert.alert('Error', error.message)
        return
      }
    } else {
      // No user - store locally for later sync
      await AsyncStorage.setItem('pendingOnboarding', JSON.stringify(profileData))
    }

    // Navigate to home page
    router.replace('/(tabs)/home')
  }

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View className="flex-1 justify-center py-8">
            <Text className="text-white/70 text-lg font-medium mb-2 text-center">
              Question #1
            </Text>
            <Text className="text-white text-3xl font-bold mb-6 text-center leading-tight px-4">
              When was the breakup?
            </Text>
            
            <View className="space-y-4">
              <TextInput
                placeholder="YYYY-MM-DD"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={breakupDate}
                onChangeText={setBreakupDate}
                autoCapitalize="none"
                keyboardType="numbers-and-punctuation"
                className="bg-white/5 text-white text-lg px-6 py-4 rounded-xl border border-white/15 backdrop-blur-sm"
              />
              <Text className="text-white/60 text-center text-sm font-medium">
                Format: 2025-01-15
              </Text>
              {!isValidISODate(breakupDate) && breakupDate && (
                <Text className="text-red-400 text-center text-sm font-medium">
                  Please enter a valid date (YYYY-MM-DD)
                </Text>
              )}
            </View>
          </View>
        )

      case 1:
        const toISODate = (d: Date) => d.toISOString().slice(0, 10)
        const addDays = (d: Date, days: number) => {
          const copy = new Date(d)
          copy.setDate(copy.getDate() + days)
          return copy
        }
        const addMonths = (d: Date, months: number) => {
          const copy = new Date(d)
          copy.setMonth(copy.getMonth() + months)
          return copy
        }
        const addYears = (d: Date, years: number) => {
          const copy = new Date(d)
          copy.setFullYear(copy.getFullYear() + years)
          return copy
        }
        const presets = [
          { key: 'same' as const, label: 'Same as breakup date', value: '' },
          { key: 'week' as const, label: 'Last week', value: toISODate(addDays(new Date(), -7)) },
          { key: 'month' as const, label: 'Last month', value: toISODate(addMonths(new Date(), -1)) },
          { key: 'year' as const, label: 'Last year', value: toISODate(addYears(new Date(), -1)) },
          { key: 'custom' as const, label: 'Enter a specific date', value: lastContactDate },
        ]
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>When was your last contact with them?</Text>

            <View style={{ marginBottom: 12 }}>
              {presets.map((p) => (
                <Pressable
                  key={p.key}
                  onPress={() => {
                    setLastContactPreset(p.key)
                    if (p.key !== 'custom') {
                      setLastContactDate('')
                      setLastContactTime('')
                    }
                  }}
                  style={[
                    styles.listItem,
                    lastContactPreset === p.key ? styles.listItemSelected : styles.listItemDefault,
                  ]}
                >
                  <Text
                    style={[
                      styles.listItemText,
                      lastContactPreset === p.key ? styles.listItemTextSelected : styles.listItemTextDefault,
                    ]}
                  >
                    {p.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.helper, { marginTop: 4 }]}>Or enter a specific date and time</Text>
            <TextInput
              placeholder="YYYY-MM-DD"
              value={lastContactDate}
              onChangeText={(val) => {
                setLastContactPreset('custom')
                setLastContactDate(val)
              }}
              autoCapitalize="none"
              keyboardType="numbers-and-punctuation"
              editable={lastContactPreset === 'custom'}
              style={[styles.input, lastContactPreset !== 'custom' && { opacity: 0.6 }]}
            />
            <TextInput
              placeholder="HH:mm (optional, default 09:00)"
              value={lastContactTime}
              onChangeText={setLastContactTime}
              autoCapitalize="none"
              keyboardType="numbers-and-punctuation"
              editable={lastContactPreset === 'custom'}
              style={[styles.input, { marginTop: 12 }, lastContactPreset !== 'custom' && { opacity: 0.6 }]}
            />
            <Text style={styles.helper}>Tip: choose a preset above or enter your own date. Leaving date empty will reuse the breakup date.</Text>
          </View>
        )

      case 2:
        const goalPresets = [
          { label: '1 week', days: 7 },
          { label: '30 days', days: 30 },
          { label: '3 months', days: 90 },
          { label: '6 months', days: 180 },
          { label: '1 year', days: 365 },
        ]
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>What's your no-contact goal?</Text>
            <View style={{ marginBottom: 12 }}>
              {goalPresets.map((p) => {
                const selected = selectedGoalDays === p.days
                return (
                  <Pressable
                    key={p.label}
                    onPress={() => setSelectedGoalDays(p.days)}
                    style={[styles.listItem, selected ? styles.listItemSelected : styles.listItemDefault]}
                  >
                    <Text style={[styles.listItemText, selected ? styles.listItemTextSelected : styles.listItemTextDefault]}>
                      {p.label}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
            <Text style={styles.helper}>Or enter custom days (7-365)</Text>
            <TextInput
              placeholder="e.g. 45"
              value={goalDays}
              onChangeText={setGoalDays}
              keyboardType="numeric"
              style={styles.input}
            />
          </View>
        )

      case 3:
        return (
           <View className="flex-1 justify-center py-8">
            <Text className="text-white/70 text-lg font-medium mb-4 text-center">
              Question #4
            </Text>
            <Text className="text-white text-3xl font-bold mb-6 text-center leading-tight">
              What triggers your urge to reach out?
            </Text>
            
            <View className="space-y-3 mt-0">
              {TRIGGER_OPTIONS.map(option => {
                const selected = triggers.includes(option)
                return (
                  <Pressable
                    key={option}
                    onPress={() => toggleSelection(option, triggers, setTriggers)}
                    style={[styles.listItem, selected ? styles.listItemSelected : styles.listItemDefault]}
                  >
                    <Text style={[styles.listItemText, selected ? styles.listItemTextSelected : styles.listItemTextDefault]}>
                      {option}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
          </View>
        )

      case 4:
        return (
          <View className="flex-1 justify-center py-8">
            <Text className="text-white/70 text-lg font-medium mb-2 text-center">
              Question #5
            </Text>
            <Text className="text-white text-3xl font-bold mb-6 text-center leading-tight px-4 mt-2">
              What&apos;s hardest right now?
            </Text>
            
            <View className="space-y-3 mt-0">
              {CHALLENGE_OPTIONS.map(option => {
                const selected = challenges.includes(option)
                return (
                  <Pressable
                    key={option}
                    onPress={() => toggleSelection(option, challenges, setChallenges)}
                    style={[styles.listItem, selected ? styles.listItemSelected : styles.listItemDefault]}
                  >
                    <Text style={[styles.listItemText, selected ? styles.listItemTextSelected : styles.listItemTextDefault]}>
                      {option}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
          </View>
        )

      case 5:
        return (
          <View className="flex-1 justify-center py-8">
            <Text className="text-white/70 text-lg font-medium mb-2 text-center">
              Question #6
            </Text>
            <Text className="text-white text-3xl font-bold mb-6 text-center leading-tight px-4 mt-2">
              What should the Panic Button do for you?
            </Text>
            
            <View className="space-y-3 mt-0">
              {PANIC_OPTIONS.map(option => {
                const selected = panicTools.includes(option)
                return (
                  <Pressable
                    key={option}
                    onPress={() => toggleSelection(option, panicTools, setPanicTools)}
                    style={[styles.listItem, selected ? styles.listItemSelected : styles.listItemDefault]}
                  >
                    <Text style={[styles.listItemText, selected ? styles.listItemTextSelected : styles.listItemTextDefault]}>
                      {option}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
          </View>
        )

      case 6:
        return (
          <View className="flex-1 justify-center py-8">
            <Text className="text-white/70 text-lg font-medium mb-2 text-center">
              Question #7
            </Text>
            <Text className="text-white text-3xl font-bold mb-6 text-center leading-tight px-4">
              What motivates you most?
            </Text>
            
            <View className="space-y-3 mt-0">
              {MOTIVATION_OPTIONS.map(option => {
                const selected = motivations.includes(option)
                return (
                  <Pressable
                    key={option}
                    onPress={() => toggleSelection(option, motivations, setMotivations)}
                    style={[styles.listItem, selected ? styles.listItemSelected : styles.listItemDefault]}
                  >
                    <Text style={[styles.listItemText, selected ? styles.listItemTextSelected : styles.listItemTextDefault]}>
                      {option}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
          </View>
        )

      case 7:
        return (
          <LinearGradient
            colors={['#1a1a2e', '#16213e', '#0f3460']}
            style={styles.gradientStep}
          >
            <View style={styles.gradientContent}>
              <Text style={styles.gradientTitle}>Question #{step + 1}</Text>
              
              <Text style={styles.gradientQuestion}>
                How ready are you to commit to no contact?
              </Text>
              
              <View style={styles.scaleContainer}>
                <View style={styles.buttonRow}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <Pressable
                      key={num}
                      onPress={() => setReadiness(num.toString())}
                      style={[
                        styles.scaleButton,
                        parseInt(readiness) === num ? styles.scaleButtonSelected : styles.scaleButtonDefault
                      ]}
                    >
                      <Text style={[
                        styles.scaleButtonText,
                        parseInt(readiness) === num ? styles.scaleButtonTextSelected : styles.scaleButtonTextDefault
                      ]}>
                        {num}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <View style={styles.scaleLabels}>
                  <Text style={styles.scaleLabel}>Not ready</Text>
                  <Text style={styles.scaleLabel}>Fully committed</Text>
                </View>
              </View>

              <Text style={styles.gradientQuestion}>
                How intense is your attachment to them?
              </Text>
              
              <View style={styles.scaleContainer}>
                <View style={styles.buttonRow}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <Pressable
                      key={num}
                      onPress={() => setAttachment(num.toString())}
                      style={[
                        styles.scaleButton,
                        parseInt(attachment) === num ? styles.scaleButtonSelected : styles.scaleButtonDefault
                      ]}
                    >
                      <Text style={[
                        styles.scaleButtonText,
                        parseInt(attachment) === num ? styles.scaleButtonTextSelected : styles.scaleButtonTextDefault
                      ]}>
                        {num}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <View style={styles.scaleLabels}>
                  <Text style={styles.scaleLabel}>Low attachment</Text>
                  <Text style={styles.scaleLabel}>Very attached</Text>
                </View>
              </View>

              <Pressable
                onPress={nextStep}
                disabled={!isStepValid()}
                style={[
                  styles.gradientNextButton,
                  !isStepValid() && styles.gradientNextButtonDisabled
                ]}
              >
                <Text style={styles.gradientNextButtonText}>Continue</Text>
              </Pressable>
            </View>
          </LinearGradient>
        )

      case 8:
        return (
          <View className="flex-1 justify-center py-8">
            <Text className="text-white/70 text-lg font-medium mb-2 text-center">
              All Set!
            </Text>
            <Text className="text-white text-3xl font-bold mb-8 text-center leading-tight px-4">
              Your Exhale Passport
            </Text>
            
            <View className="space-y-3 mb-8">
              <View className="bg-white/5 p-6 rounded-xl border border-white/10">
                <Text className="text-white/60 text-sm mb-2 font-medium">No Contact Since</Text>
                <Text className="text-white text-xl font-semibold">
                  {lastContactDate || breakupDate} {lastContactTime || ''}
                </Text>
              </View>
              
              <View className="bg-white/5 p-6 rounded-xl border border-white/10">
                <Text className="text-white/60 text-sm mb-2 font-medium">Goal</Text>
                <Text className="text-white text-xl font-semibold">
                  {(selectedGoalDays ?? parseInt(goalDays)) || ''} days
                </Text>
              </View>
              
              {(triggers.length > 0 || challenges.length > 0 || motivations.length > 0) && (
                <View className="bg-white/5 p-6 rounded-xl border border-white/10">
                  <Text className="text-white/60 text-sm mb-3 font-medium">Your Profile</Text>
                  <View className="space-y-2">
                    {triggers.slice(0, 2).map(trigger => (
                      <Text key={trigger} className="text-white/85">• {trigger}</Text>
                    ))}
                    {challenges.slice(0, 2).map(challenge => (
                      <Text key={challenge} className="text-white/85">• {challenge}</Text>
                    ))}
                    {motivations.slice(0, 2).map(motivation => (
                      <Text key={motivation} className="text-white/85">• {motivation}</Text>
                    ))}
                    {panicTools[0] && (
                      <Text className="text-white/85">• {panicTools[0]}</Text>
                    )}
                  </View>
                </View>
              )}
            </View>

            <Pressable
              onPress={saveProfile}
              className="bg-white py-4 px-8 rounded-xl shadow-lg active:bg-gray-100"
            >
              <Text className="text-purple-800 text-lg font-bold text-center">
                Save & Start Your Journey
              </Text>
            </Pressable>
          </View>
        )

      default:
        return null
    }
  }

  return (
    <LinearGradient 
      colors={['#2D1B69', '#1E0A3C', '#0A0617']} 
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1">
        {/* Progress Bar */}
        <View className="px-6 pt-2 pb-4">
          <View className="flex-row items-center justify-start mb-3">
            <Pressable 
              onPress={() => step > 0 && setStep(step - 1)}
              className="w-10 h-10 items-center justify-center rounded-full bg-white/10 active:bg-white/20"
              hitSlop={8}
            >
              <Text className="text-white text-lg font-bold">←</Text>
            </Pressable>
          </View>
          
          {/* Progress indicator */}
           <View className="h-2 bg-white/15 rounded-full overflow-hidden">
            <View 
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500 ease-out"
              style={{ width: `${((step + 1) / 9) * 100}%` }}
            />
          </View>
        </View>

        <ScrollView 
           className="flex-1" 
           contentContainerStyle={{ 
             flexGrow: 1,
            paddingTop: 8,
            paddingBottom: 120,
             paddingHorizontal: 20,
             rowGap: 24
           }}
          showsVerticalScrollIndicator={false}
        >
          {renderStep()}
        </ScrollView>
        
        {/* Modern Footer */}
        {step < 8 && (
          <View className="px-6 pb-8">
            <Pressable
              onPress={nextStep}
              disabled={!isStepValid()}
              className={`py-4 px-8 rounded-xl shadow-lg ${
                isStepValid() 
                  ? 'bg-white active:bg-gray-100' 
                  : 'bg-white/20'
              }`}
            >
              <Text className={`text-center text-lg font-semibold ${
                isStepValid() ? 'text-purple-800' : 'text-white/50'
              }`}>
                {step === 7 ? 'Continue' : 'Next'}
              </Text>
            </Pressable>
            
            {/* Removed "Skip for now" during onboarding flow */}
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  )
}

// Styles used by the inline "styles.X" references above
const styles = StyleSheet.create({
  stepContainer: {
    paddingVertical: 16,
  },
  stepTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    marginBottom: 12,
    fontWeight: '600',
  },
  listItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  listItemDefault: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.2)',
  },
  listItemSelected: {
    backgroundColor: 'rgba(34,211,238,0.2)', // cyan-400/20
    borderColor: '#22d3ee', // cyan-400
  },
  listItemText: {
    fontSize: 16,
  },
  listItemTextDefault: {
    color: 'rgba(255,255,255,0.9)',
  },
  listItemTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  helper: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    color: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  gradientStep: {
    borderRadius: 16,
    padding: 16,
  },
  gradientContent: {
    gap: 16,
  },
  gradientTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    opacity: 0.9,
  },
  gradientQuestion: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  scaleContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  scaleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  scaleButtonDefault: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.2)',
  },
  scaleButtonSelected: {
    backgroundColor: '#22d3ee', // cyan-400
    borderColor: '#22d3ee',
  },
  scaleButtonText: {
    fontSize: 14,
  },
  scaleButtonTextDefault: {
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  scaleButtonTextSelected: {
    color: '#0B1220',
    fontWeight: '700',
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  scaleLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  gradientNextButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  gradientNextButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  gradientNextButtonText: {
    color: '#06b6d4', // cyan-500
    fontWeight: '700',
    fontSize: 16,
  },
})

