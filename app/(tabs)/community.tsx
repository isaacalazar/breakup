import { Ionicons } from '@expo/vector-icons'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import { useEffect, useState } from 'react'
import { Alert, FlatList, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CommunityPost, communityService } from '../../src/services/communityService'

export default function CommunityScreen() {
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [loading, setLoading] = useState(true)
  const [composeOpen, setComposeOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const tabBarHeight = useBottomTabBarHeight()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set())

  const load = async () => {
    try {
      setLoading(true)
      const data = await communityService.listPosts()
      setPosts(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const onToggleUpvote = async (postId: string) => {
    try {
      await communityService.toggleUpvote(postId)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      load()
    } catch (e) {
      console.warn(e)
    }
  }

  const onCreate = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('Missing Information', 'Please add both a title and your thoughts.')
      return
    }
    try {
      await communityService.createPost({ title: title.trim(), body: body.trim() })
      setComposeOpen(false)
      setTitle('')
      setBody('')
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      load()
    } catch (e) {
      console.warn(e)
      Alert.alert('Error', 'Failed to create post. Please try again.')
    }
  }

  const onRefresh = async () => {
    setIsRefreshing(true)
    try {
      await load()
    } finally {
      setIsRefreshing(false)
    }
  }

  const toggleExpanded = (postId: string) => {
    setExpandedPosts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })
  }

  const renderItem = ({ item }: { item: CommunityPost }) => {
    const timeAgo = getTimeAgo(new Date(item.created_at))
    const isExpanded = expandedPosts.has(item.id)
    const shouldShowExpand = item.body.length > 150

    return (
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text
            style={styles.cardBody}
            numberOfLines={isExpanded ? undefined : 3}
          >
            {item.body}
          </Text>

          {shouldShowExpand && (
            <Pressable
              onPress={() => toggleExpanded(item.id)}
              style={styles.expandButton}
            >
              <Text style={styles.expandText}>
                {isExpanded ? 'Show less' : 'Show more'}
              </Text>
            </Pressable>
          )}

          <View style={styles.cardFooter}>
            <View style={styles.authorInfo}>
              <View style={styles.authorDetails}>
                <Text style={styles.authorName}>{item.author_name || 'Anonymous'}</Text>
                <Text style={styles.timeAgo}>{timeAgo}</Text>
              </View>
            </View>

            <Pressable
              style={styles.voteButton}
              onPress={() => onToggleUpvote(item.id)}
            >
              <Text style={styles.voteCount}>{item.upvotes_count}</Text>
              <Ionicons name="chevron-up" size={16} color="#8B93FF" />
            </Pressable>
          </View>
        </View>
      </View>
    )
  }

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInHours / 24)
    
    if (diffInDays > 0) {
      return diffInDays === 1 ? 'Yesterday' : `${diffInDays} days ago`
    } else if (diffInHours > 0) {
      return `${diffInHours}h ago`
    } else {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes}m ago`
    }
  }

  return (
    <LinearGradient colors={["#2D1B69", "#1E0A3C", "#0A0617"]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Community</Text>
            <Text style={styles.headerSubtitle}>Share your journey with others</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable style={styles.headerIcon}>
              <Ionicons name="notifications-outline" size={20} color="rgba(255,255,255,0.8)" />
            </Pressable>
            <Pressable style={styles.headerIcon}>
              <Ionicons name="search" size={20} color="rgba(255,255,255,0.8)" />
            </Pressable>
          </View>
        </View>

        <FlatList
          data={posts}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#8B93FF" />}
          keyExtractor={(p) => p.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: tabBarHeight + 120 }}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListEmptyComponent={!loading ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="people-outline" size={48} color="rgba(255,255,255,0.3)" />
              </View>
              <Text style={styles.emptyTitle}>No posts yet</Text>
              <Text style={styles.emptySubtitle}>Be the first to share your story and connect with others on similar journeys.</Text>
            </View>
          ) : null}
        />

        <Pressable 
          style={[styles.fab, { bottom: tabBarHeight + 24 }]} 
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
            setComposeOpen(true)
          }}
        >
          <LinearGradient colors={["#8B93FF", "#7A84F3"]} style={styles.fabInner}>
            <Ionicons name="create-outline" size={24} color="#fff" />
          </LinearGradient>
        </Pressable>

        <Modal visible={composeOpen} animationType="slide" transparent onRequestClose={() => setComposeOpen(false)}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>New Post</Text>
              <TextInput
                placeholder="Title"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={title}
                onChangeText={setTitle}
                style={styles.input}
              />
              <TextInput
                placeholder="Share your thoughts..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={body}
                onChangeText={setBody}
                style={[styles.input, { height: 120 }]} multiline
              />
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
                <Pressable onPress={() => setComposeOpen(false)} style={[styles.button, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </Pressable>
                <Pressable onPress={onCreate} style={[styles.button, { backgroundColor: '#4E83F1' }]}>
                  <Text style={styles.buttonText}>Post</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>


      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  headerActions: { 
    flexDirection: 'row', 
    gap: 12 
  },
  headerIcon: {
    width: 36, 
    height: 36, 
    borderRadius: 18,
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },

  // Cards
  cardContainer: {
    marginBottom: 0,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: 20,
  },
  cardBody: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  // Author info
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  timeAgo: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontWeight: '400',
  },
  
  // Vote button
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 147, 255, 0.12)',
    minWidth: 50,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 147, 255, 0.2)',
  },
  voteCount: {
    color: '#8B93FF',
    fontSize: 14,
    fontWeight: '600',
  },

  // FAB
  fab: { 
    position: 'absolute', 
    right: 24, 
    zIndex: 10, 
    elevation: 10,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  fabInner: { 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    alignItems: 'center', 
    justifyContent: 'center',
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  emptyTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    letterSpacing: 0.1,
  },

  // Modals
  modalBackdrop: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.6)', 
    justifyContent: 'flex-end' 
  },
  modalCard: { 
    backgroundColor: 'rgba(45, 27, 105, 0.95)', 
    padding: 24, 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24, 
    gap: 16, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(20px)',
  },
  modalTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    padding: 16,
    color: 'white',
    fontSize: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },

  // Expand button
  expandButton: {
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: 8,
  },
  expandText: {
    color: '#8B93FF',
    fontSize: 13,
    fontWeight: '500',
  }
})