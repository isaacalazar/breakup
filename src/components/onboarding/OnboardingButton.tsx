import { Pressable, Text } from 'react-native'

interface OnboardingButtonProps {
  title: string
  onPress: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary'
}

export function OnboardingButton({ 
  title, 
  onPress, 
  disabled = false,
  variant = 'primary'
}: OnboardingButtonProps) {
  const isPrimary = variant === 'primary'
  
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`py-5 px-8 rounded-2xl shadow-2xl ${
        disabled
          ? 'bg-white/20'
          : isPrimary
          ? 'bg-white active:bg-gray-100 active:scale-95'
          : 'bg-white/10 border border-white/30 active:bg-white/20 active:scale-95'
      } transition-all duration-150`}
      style={{
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      }}
    >
      <Text className={`text-center text-xl font-bold ${
        disabled 
          ? 'text-white/50'
          : isPrimary
          ? 'text-purple-800'
          : 'text-white'
      }`}>
        {title}
      </Text>
    </Pressable>
  )
}