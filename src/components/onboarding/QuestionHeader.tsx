import { Text, View } from 'react-native'

interface QuestionHeaderProps {
  questionNumber: number
  title: string
  subtitle?: string
}

export function QuestionHeader({ questionNumber, title, subtitle }: QuestionHeaderProps) {
  return (
    <View className="mb-12">
      <Text className="text-white/70 text-base font-medium mb-4 text-center">
        Question #{questionNumber}
      </Text>
      <Text className="text-white text-2xl font-bold text-center leading-tight px-6">
        {title}
      </Text>
      {subtitle && (
        <Text className="text-white/80 text-base text-center px-6 mt-3">
          {subtitle}
        </Text>
      )}
    </View>
  )
}