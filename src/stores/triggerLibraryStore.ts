import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'

export type TriggerType = 'social' | 'route' | 'song' | 'people' | 'other'

export interface TriggerItem {
  id: string
  label: string
  type: TriggerType
  enabled: boolean
  copingCards: string[]
}

interface TriggerLibraryState {
  triggers: TriggerItem[]
  toggle: (id: string) => void
  addCard: (id: string, text?: string) => void
  updateCard: (id: string, index: number, text: string) => void
  removeCard: (id: string, index: number) => void
  hydrate: () => Promise<void>
}

const STORAGE_KEY = 'triggerLibrary:v1'

const STARTER_TRIGGERS: TriggerItem[] = [
  { id: 'ig', label: 'Instagram / TikTok', type: 'social', enabled: false, copingCards: [
    'Unfollow, mute stories, and remove from Close Friends',
    'Move apps to a folder; use during pre-set time only',
  ] },
  { id: 'snap', label: 'Snapchat / Streaks', type: 'social', enabled: false, copingCards: [
    'End streaks; ask a friend to hold you accountable',
  ] },
  { id: 'route-home', label: "Route past their place", type: 'route', enabled: false, copingCards: [
    'Pick an alternate route; add it to Maps favorites',
  ] },
  { id: 'route-cafe', label: 'Shared cafe/gym', type: 'route', enabled: false, copingCards: [
    'New time slot or different location for 30 days',
  ] },
  { id: 'song', label: 'Songs that spiral me', type: 'song', enabled: false, copingCards: [
    'Swap to a healing playlist; hide song in streaming app',
  ] },
  { id: 'mutuals', label: 'Mutual friends / group chats', type: 'people', enabled: false, copingCards: [
    'Mute the chat; ask for no updates for now',
  ] },
  { id: 'late-night', label: 'Late-night scrolling', type: 'other', enabled: false, copingCards: [
    'Phone outside bedroom; enable Downtime 10pm-7am',
  ] },
  { id: 'anniversaries', label: 'Anniversaries / memory dates', type: 'other', enabled: false, copingCards: [
    'Plan a mini ritual with a friend on those days',
  ] },
]

export const useTriggerLibrary = create<TriggerLibraryState>((set, get) => ({
  triggers: STARTER_TRIGGERS,

  toggle: (id) => set((state) => {
    const triggers = state.triggers.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t)
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(triggers)).catch(() => {})
    return { triggers }
  }),

  addCard: (id, text = '') => set((state) => {
    const triggers = state.triggers.map(t => t.id === id ? { ...t, copingCards: [...t.copingCards, text] } : t)
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(triggers)).catch(() => {})
    return { triggers }
  }),

  updateCard: (id, index, text) => set((state) => {
    const triggers = state.triggers.map(t => {
      if (t.id !== id) return t
      const cards = [...t.copingCards]
      cards[index] = text
      return { ...t, copingCards: cards }
    })
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(triggers)).catch(() => {})
    return { triggers }
  }),

  removeCard: (id, index) => set((state) => {
    const triggers = state.triggers.map(t => {
      if (t.id !== id) return t
      const cards = t.copingCards.filter((_, i) => i !== index)
      return { ...t, copingCards: cards }
    })
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(triggers)).catch(() => {})
    return { triggers }
  }),

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed: TriggerItem[] = JSON.parse(raw)
        set({ triggers: parsed })
      }
    } catch {
      // ignore
    }
  }
}))

