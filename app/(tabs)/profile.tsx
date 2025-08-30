import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ProfileScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center">
        <Text className="text-2xl font-bold text-gray-800">Profile</Text>
        <Text className="text-gray-600 mt-2">Your healing progress and settings</Text>
      </View>
    </SafeAreaView>
  )
}