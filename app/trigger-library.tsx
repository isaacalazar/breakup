import { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ScrollView, Text, View, Switch, Pressable, TextInput } from 'react-native'
import { useTriggerLibrary } from '../src/stores/triggerLibraryStore'
import { router } from 'expo-router'

export default function TriggerLibraryScreen() {
  const { triggers, toggle, addCard, updateCard, removeCard, hydrate } = useTriggerLibrary()
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  useEffect(() => {
    hydrate()
  }, [hydrate])

  return (
    <SafeAreaView className="flex-1 bg-[#0f1020]">
      <View className="px-5 pt-2 pb-3 border-b border-white/10">
        <View className="flex-row items-center justify-between">
          <Pressable onPress={() => router.back()} className="py-2 pr-3 -ml-2">
            <Text className="text-white/90 text-sm">Back</Text>
          </Pressable>
          <Text className="text-white text-lg font-semibold">Trigger Library</Text>
          <View style={{ width: 44 }} />
        </View>
        <Text className="text-pink-300 text-xs font-semibold mt-1">Learn</Text>
        <Text className="text-white/70 mt-1">Curated list with toggles and coping cards</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {triggers.map((t) => (
          <View key={t.id} className="mb-4 rounded-xl bg-white/5 border border-white/10">
            <Pressable
              onPress={() => setExpanded((e) => ({ ...e, [t.id]: !e[t.id] }))}
              className="flex-row items-center justify-between px-4 py-3"
            >
              <View className="flex-1 pr-3">
                <Text className="text-white text-base font-semibold">{t.label}</Text>
                <Text className="text-white/60 text-xs mt-0.5">Tap to view coping cards</Text>
              </View>
              <Switch value={t.enabled} onValueChange={() => toggle(t.id)} />
            </Pressable>

            {expanded[t.id] && (
              <View className="px-4 pb-4">
                {t.copingCards.map((c, i) => (
                  <View key={i} className="mt-3 rounded-lg bg-white/5 border border-white/10">
                    <View className="flex-row items-center justify-between px-3 py-2 border-b border-white/10">
                      <Text className="text-white/80 text-xs">Coping Card {i + 1}</Text>
                      <Pressable onPress={() => removeCard(t.id, i)}>
                        <Text className="text-red-300 text-xs font-semibold">Remove</Text>
                      </Pressable>
                    </View>
                    <TextInput
                      multiline
                      placeholder="Write a short, practical action you'll take"
                      placeholderTextColor="#9CA3AF"
                      value={c}
                      onChangeText={(text) => updateCard(t.id, i, text)}
                      className="text-white px-3 py-2 min-h-[64px]"
                    />
                  </View>
                ))}

                <Pressable onPress={() => addCard(t.id, '')} className="mt-3 px-3 py-2 rounded-lg border border-white/20">
                  <Text className="text-white/90 text-sm font-semibold">+ Add Coping Card</Text>
                </Pressable>
              </View>
            )}
          </View>
        ))}

        <View className="mt-2">
          <Pressable onPress={() => router.back()} className="items-center py-3 rounded-xl bg-white/10 border border-white/15">
            <Text className="text-white font-semibold">Done</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
