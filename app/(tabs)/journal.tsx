import { Ionicons } from '@expo/vector-icons'
import Slider from '@react-native-community/slider'
import { LinearGradient } from 'expo-linear-gradient'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Alert,
  Animated,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { Swipeable, RectButton } from 'react-native-gesture-handler'
import * as Haptics from 'expo-haptics'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../../src/providers/AuthProvider'
import { JournalEntriesGrouped, JournalEntry, journalService } from '../../src/services/journalService'

export default function JournalScreen() {
  const { session, loading: authLoading } = useAuth()
  const [groupedEntries, setGroupedEntries] = useState<JournalEntriesGrouped>({})
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [showEntryModal, setShowEntryModal] = useState(false)
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null)
  const [mood, setMood] = useState(5)
  const [feeling, setFeeling] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const openSwipeRef = useRef<Swipeable | null>(null)
  const [openSwipeId, setOpenSwipeId] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0]

  const loadData = useCallback(async () => {
    if (!session?.user?.id) return
    
    try {
      setLoading(true)
      const recentData = await journalService.getRecentEntriesGrouped(30)
      setGroupedEntries(recentData)
    } catch (error) {
      console.error('Error loading journal data:', error)
      Alert.alert('Error', 'Failed to load journal entries')
    } finally {
      setLoading(false)
    }
  }, [session?.user?.id])

  const refreshData = useCallback(async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }, [loadData])

  useEffect(() => {
    if (session?.user?.id) {
      loadData()
    }
  }, [session?.user?.id, loadData])

  const handleSave = async () => {
    if (!session?.user?.id || !feeling.trim()) return
    
    try {
      setLoading(true)
      
      if (isEditing && editingEntry) {
        const updated = await journalService.updateEntry(editingEntry.id, {
          mood,
          body: feeling
        })
        
        // Update the grouped entries
        setGroupedEntries(prev => {
          const newGrouped = { ...prev }
          const dateEntries = newGrouped[updated.entry_date] || []
          const updatedEntries = dateEntries.map(entry => 
            entry.id === updated.id ? updated : entry
          )
          newGrouped[updated.entry_date] = updatedEntries
          return newGrouped
        })
      } else {
        const newEntry = await journalService.createEntry({
          entry_date: today,
          mood,
          body: feeling
        })
        
        // Add to grouped entries
        setGroupedEntries(prev => {
          const newGrouped = { ...prev }
          if (!newGrouped[newEntry.entry_date]) {
            newGrouped[newEntry.entry_date] = []
          }
          newGrouped[newEntry.entry_date] = [newEntry, ...newGrouped[newEntry.entry_date]]
          return newGrouped
        })
      }
      
      handleCloseModal()
      
    } catch (error) {
      console.error('Error saving entry:', error)
      Alert.alert('Error', 'Failed to save entry')
    } finally {
      setLoading(false)
    }
  }

  const handleNewEntry = () => {
    setEditingEntry(null)
    setMood(5)
    setFeeling('')
    setIsEditing(false)
    setShowEntryModal(true)
  }

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry)
    setMood(entry.mood)
    setFeeling(entry.body)
    setIsEditing(true)
    setShowEntryModal(true)
  }

  const handleDeleteEntry = async (entryId: string, entryDate: string) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this journal entry? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await journalService.deleteEntry(entryId)
              
              // Remove from grouped entries
              setGroupedEntries(prev => {
                const newGrouped = { ...prev }
                if (newGrouped[entryDate]) {
                  newGrouped[entryDate] = newGrouped[entryDate].filter(e => e.id !== entryId)
                  if (newGrouped[entryDate].length === 0) {
                    delete newGrouped[entryDate]
                  }
                }
                return newGrouped
              })
            } catch (error) {
              console.error('Error deleting entry:', error)
              Alert.alert('Error', 'Failed to delete entry')
            }
          }
        }
      ]
    )
  }

  const handleCloseModal = () => {
    setShowEntryModal(false)
    setEditingEntry(null)
    setMood(5)
    setFeeling('')
    setIsEditing(false)
  }

  const getMoodColor = (moodValue: number) => {
    // Sophisticated color palette
    if (moodValue <= 2) return '#FF6B9D' // Soft pink for very low
    if (moodValue <= 4) return '#FF8E53' // Warm orange for low
    if (moodValue <= 6) return '#FFBE0B' // Golden yellow for neutral
    if (moodValue <= 8) return '#8AC926' // Fresh green for good
    return '#06FFA5' // Vibrant mint for excellent
  }

  const getMoodEmoji = (moodValue: number) => {
    const emojis = ['😭', '😢', '😔', '😐', '🙂', '😊', '😄', '😁', '🤗', '🥰']
    return emojis[moodValue - 1] || '😊'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  // Flatten grouped entries for FlatList
  const flattenedEntries = Object.entries(groupedEntries)
    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
    .flatMap(([date, entries]) => 
      entries.map((entry, index) => ({ ...entry, isFirstOfDate: index === 0, dateGroup: date }))
    )

  const renderEntryItem = ({ item }: { item: JournalEntry & { isFirstOfDate: boolean, dateGroup: string } }) => {
    const firstLine = item.body.split('\n')[0].substring(0, 120)
    const isToday = item.entry_date === today
    const entryTime = new Date(item.created_at || '').toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
    
    // Keep a local ref so we can close the swipeable after actions
    let swipeable: Swipeable | null = null

    return (
      <View>
        {/* Date header for first entry of the day */}
        {item.isFirstOfDate && (
          <View style={styles.dateHeader}>
            <Text style={styles.dateHeaderText}>{formatDate(item.entry_date)}</Text>
            <Text style={styles.dateHeaderCount}>
              {groupedEntries[item.dateGroup]?.length || 1} {groupedEntries[item.dateGroup]?.length === 1 ? 'entry' : 'entries'}
            </Text>
          </View>
        )}
        
        <Swipeable
          ref={(ref) => { swipeable = ref }}
          friction={1}
          overshootRight={false}
          rightThreshold={64}
          enableTrackpadTwoFingerGesture
          containerStyle={{ borderRadius: 24 }}
          childrenContainerStyle={{ borderRadius: 24, overflow: 'hidden' }}
          onSwipeableWillOpen={() => {
            if (openSwipeRef.current && openSwipeRef.current !== swipeable) {
              openSwipeRef.current.close()
            }
            openSwipeRef.current = swipeable
            setOpenSwipeId(item.id)
          }}
          onSwipeableClose={() => {
            if (openSwipeRef.current === swipeable) {
              openSwipeRef.current = null
            }
            if (openSwipeId === item.id) setOpenSwipeId(null)
          }}
          renderRightActions={(progress) => {
            const editTranslate = progress.interpolate({
              inputRange: [0, 1],
              outputRange: [48, 0],
            })
            const deleteTranslate = progress.interpolate({
              inputRange: [0, 1],
              outputRange: [72, 0],
            })
            const editScale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] })
            const deleteScale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] })
            return (
              <View style={styles.swipeActionsContainer}>
                <Animated.View style={{ transform: [{ translateX: editTranslate }, { scale: editScale }] }}>
                  <RectButton
                    style={[styles.swipeActionButton, styles.swipeEdit]}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); swipeable?.close(); handleEditEntry(item) }}
                    accessibilityLabel="Edit entry"
                  >
                    <Ionicons name="create-outline" size={18} color="white" />
                    <Text style={styles.swipeActionText}>Edit</Text>
                  </RectButton>
                </Animated.View>
                <Animated.View style={{ transform: [{ translateX: deleteTranslate }, { scale: deleteScale }] }}>
                  <RectButton
                    style={[styles.swipeActionButton, styles.swipeDelete]}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); swipeable?.close(); handleDeleteEntry(item.id, item.entry_date) }}
                    accessibilityLabel="Delete entry"
                  >
                    <Ionicons name="trash-outline" size={18} color="white" />
                    <Text style={styles.swipeActionText}>Delete</Text>
                  </RectButton>
                </Animated.View>
              </View>
            )
          }}
        >
        <Animated.View style={[styles.entryCard, { opacity: 1 }]}> 
          <View style={styles.entryContent}>
            {/* Header Row */}
            <View style={styles.entryHeader}>
              <View style={styles.timeSection}>
                <Text style={styles.entryTime}>{entryTime}</Text>
                {isToday && <View style={styles.todayIndicator} />}
              </View>
              
              <View style={styles.entryActions}>
                <View style={[styles.moodBadge, { backgroundColor: getMoodColor(item.mood) + '15' }]}> 
                  <Text style={styles.moodEmoji}>{getMoodEmoji(item.mood)}</Text>
                  <Text style={[styles.moodScore, { color: getMoodColor(item.mood) }]}> 
                    {item.mood}
                  </Text>
                </View>
                
                {openSwipeId === item.id ? (
                  <View style={{ width: 72 }} />
                ) : (
                  <>
                    <Pressable 
                      style={styles.editButton}
                      onPress={() => handleEditEntry(item)}
                    >
                      <Ionicons name="create-outline" size={16} color="rgba(255, 255, 255, 0.5)" />
                    </Pressable>
                    
                    <Pressable 
                      style={styles.deleteButton}
                      onPress={() => handleDeleteEntry(item.id, item.entry_date)}
                    >
                      <Ionicons name="trash-outline" size={16} color="rgba(255, 107, 107, 0.7)" />
                    </Pressable>
                  </>
                )}
              </View>
            </View>

            {/* Content Preview */}
            <Text style={styles.entryPreview} numberOfLines={3}>
              {firstLine}{item.body.length > 120 ? '...' : ''}
            </Text>
          </View>
        </Animated.View>
        </Swipeable>
      </View>
    )
  }

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyContent}>
        <View style={styles.emptyIconContainer}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.emptyIconGradient}
          >
            <Ionicons name="create-outline" size={32} color="white" />
          </LinearGradient>
        </View>
        
        <Text style={styles.emptyTitle}>Begin Your Journey</Text>
        <Text style={styles.emptySubtitle}>
          Document your healing process with daily reflections
        </Text>
        
        <Pressable style={styles.emptyActionButton} onPress={handleNewEntry}>
          <LinearGradient colors={['#667eea', '#764ba2']} style={styles.emptyButtonGradient}>
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.emptyButtonText}>Write First Entry</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  )

  if (authLoading) {
    return (
      <LinearGradient colors={['#2D1B69', '#1E0A3C', '#0A0617']} style={styles.container}>
        <SafeAreaView style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </SafeAreaView>
      </LinearGradient>
    )
  }

  if (!session?.user?.id) {
    return (
      <LinearGradient colors={['#2D1B69', '#1E0A3C', '#0A0617']} style={styles.container}>
        <SafeAreaView style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Please log in to access your journal</Text>
        </SafeAreaView>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient colors={['#2D1B69', '#1E0A3C', '#0A0617']} style={styles.container}>
      <SafeAreaView style={styles.container}>
        {/* Minimalist Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Journal</Text>
            <Text style={styles.headerSubtitle}>
              {Object.values(groupedEntries).flat().length} {Object.values(groupedEntries).flat().length === 1 ? 'entry' : 'entries'}
            </Text>
          </View>
          
          <Pressable onPress={handleNewEntry} style={styles.addButton}>
            <LinearGradient colors={['#667eea', '#764ba2']} style={styles.addButtonGradient}>
              <Ionicons name="add" size={22} color="white" />
            </LinearGradient>
          </Pressable>
        </View>

        {/* Entries List */}
        <FlatList
          data={flattenedEntries}
          renderItem={renderEntryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={() => openSwipeRef.current?.close()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshData}
              tintColor="#22D3EE"
              colors={['#22D3EE']}
            />
          }
          ListEmptyComponent={!loading ? renderEmptyState : null}
        />

        {/* Premium Entry Modal */}
        <Modal
          visible={showEntryModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={handleCloseModal}
        >
          <LinearGradient colors={['#2D1B69', '#1E0A3C', '#0A0617']} style={styles.container}>
            <SafeAreaView style={styles.container}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Pressable onPress={handleCloseModal} style={styles.modalCloseButton}>
                  <Ionicons name="close" size={24} color="rgba(255, 255, 255, 0.6)" />
                </Pressable>
                
                <View style={styles.modalTitleContainer}>
                  <Text style={styles.modalTitle}>
                    {isEditing ? 'Edit Entry' : 'New Entry'}
                  </Text>
                  <Text style={styles.modalDate}>
                    {isEditing ? `${formatDate(editingEntry!.entry_date)} • ${new Date(editingEntry!.created_at || '').toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}` : formatDate(today)}
                  </Text>
                </View>
                
                <View style={styles.modalHeaderSpacer} />
              </View>

              <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.modalContent}>
                  {/* Mood Section */}
                  <View style={styles.moodSection}>
                    <Text style={styles.sectionTitle}>How are you feeling?</Text>
                    
                    <View style={styles.moodDisplay}>
                      <View style={[styles.moodEmojiContainer, { backgroundColor: getMoodColor(mood) + '20' }]}>
                        <Text style={styles.moodEmojiLarge}>{getMoodEmoji(mood)}</Text>
                      </View>
                      <View style={styles.moodTextContainer}>
                        <Text style={[styles.moodValue, { color: getMoodColor(mood) }]}>{mood}</Text>
                        <Text style={styles.moodOutOf}>/10</Text>
                      </View>
                    </View>
                    
                    <View style={styles.sliderContainer}>
                      <Slider
                        style={styles.slider}
                        minimumValue={1}
                        maximumValue={10}
                        step={1}
                        value={mood}
                        onValueChange={setMood}
                        minimumTrackTintColor={getMoodColor(mood)}
                        maximumTrackTintColor="rgba(255, 255, 255, 0.1)"
                        thumbTintColor={getMoodColor(mood)}
                      />
                      <View style={styles.sliderLabels}>
                        <Text style={styles.sliderLabel}>Terrible</Text>
                        <Text style={styles.sliderLabel}>Amazing</Text>
                      </View>
                    </View>
                  </View>

                  {/* Text Section */}
                  <View style={styles.textSection}>
                    <Text style={styles.sectionTitle}>What&apos;s on your mind?</Text>
                    <View style={styles.textInputContainer}>
                      <TextInput
                        style={styles.textInput}
                        multiline
                        value={feeling}
                        onChangeText={setFeeling}
                        placeholder="Express your thoughts, feelings, and experiences..."
                        placeholderTextColor="rgba(255, 255, 255, 0.3)"
                        textAlignVertical="top"
                      />
                    </View>
                  </View>
                </View>
              </ScrollView>

              {/* Save Button */}
              <View style={styles.modalFooter}>
                <Pressable 
                  style={[styles.saveButton, { 
                    opacity: loading || !feeling.trim() ? 0.5 : 1 
                  }]}
                  onPress={handleSave}
                  disabled={loading || !feeling.trim()}
                >
                  <LinearGradient 
                    colors={loading || !feeling.trim() ? ['#444', '#555'] : ['#667eea', '#764ba2']} 
                    style={styles.saveButtonGradient}
                  >
                    <Text style={styles.saveButtonText}>
                      {loading ? 'Saving...' : (isEditing ? 'Update Entry' : 'Save Entry')}
                    </Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </SafeAreaView>
          </LinearGradient>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontWeight: '500',
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: 'white',
    letterSpacing: -1.5,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '500',
  },
  addButton: {
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  addButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // List Styles
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  entryCard: {
    marginBottom: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  entryPressable: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  entryContent: {
    padding: 24,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  entryDate: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    letterSpacing: -0.3,
  },
  todayIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#06FFA5',
  },
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  moodEmoji: {
    fontSize: 16,
  },
  moodScore: {
    fontSize: 14,
    fontWeight: '700',
  },
  entryPreview: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 24,
    marginBottom: 12,
  },
  entryFooter: {
    alignItems: 'flex-end',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    paddingTop: 80,
  },
  emptyContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  emptySubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  emptyActionButton: {
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
    gap: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },

  // Modal Styles
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  modalCloseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    letterSpacing: -0.3,
  },
  modalDate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '500',
    marginTop: 2,
  },
  modalHeaderSpacer: {
    width: 44,
  },
  modalScrollView: {
    flex: 1,
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },

  // Mood Section
  moodSection: {
    marginBottom: 48,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 24,
    letterSpacing: -0.4,
  },
  moodDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    gap: 16,
  },
  moodEmojiContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodEmojiLarge: {
    fontSize: 32,
  },
  moodTextContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  moodValue: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
  },
  moodOutOf: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: '600',
    marginLeft: 2,
  },
  sliderContainer: {
    marginHorizontal: 8,
  },
  slider: {
    width: '100%',
    height: 44,
    marginBottom: 16,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: '600',
  },

  // Text Section
  textSection: {
    marginBottom: 32,
  },
  textInputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  textInput: {
    padding: 24,
    color: 'white',
    fontSize: 16,
    lineHeight: 26,
    minHeight: 180,
    textAlignVertical: 'top',
    fontWeight: '500',
  },

  // Footer
  modalFooter: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  saveButton: {
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  saveButtonGradient: {
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  // Missing styles for entry header and date groupings
  timeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  entryTime: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: -0.2,
  },
  entryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateHeader: {
    paddingHorizontal: 4,
    paddingVertical: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateHeaderText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    letterSpacing: -0.3,
  },
  dateHeaderCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '500',
  },
  // Swipe actions
  swipeActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 8,
    paddingVertical: 8,
    height: '100%',
  },
  swipeActionButton: {
    width: 96,
    height: '100%',
    marginLeft: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeEdit: {
    backgroundColor: 'rgba(102, 126, 234, 0.9)',
  },
  swipeDelete: {
    backgroundColor: 'rgba(255, 107, 107, 0.9)',
  },
  swipeActionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginTop: 6,
  },
})
