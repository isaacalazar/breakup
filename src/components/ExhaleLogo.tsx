import { Text } from 'react-native'

interface ExhaleLogoProps {
  size?: 'small' | 'medium' | 'large'
  color?: string
}

export function ExhaleLogo({ size = 'medium', color = '#FFFFFF' }: ExhaleLogoProps) {
  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 24
      case 'medium':
        return 32
      case 'large':
        return 48
      default:
        return 32
    }
  }

  return (
    <Text
      style={{
        fontSize: getFontSize(),
        fontWeight: '700',
        color,
        letterSpacing: 1.5,
        textAlign: 'center',
      }}
    >
      exhale
    </Text>
  )
}