import { Pressable, Text, View } from 'react-native'

interface SelectableListProps {
  options: string[]
  selected: string[] | string
  onSelect: (option: string) => void
  multiSelect?: boolean
  variant?: 'default' | 'danger'
}

export function SelectableList({ 
  options, 
  selected, 
  onSelect, 
  multiSelect = true,
  variant = 'default'
}: SelectableListProps) {
  const isSelected = (option: string) => {
    if (Array.isArray(selected)) {
      return selected.includes(option)
    }
    return selected === option
  }

  return (
    <View style={{ gap: 10 }}>
      {options.map(option => {
        const optionSelected = isSelected(option)
        return (
          <Pressable
            key={option}
            onPress={() => onSelect(option)}
            style={{
              paddingVertical: 14,
              paddingHorizontal: 18,
              borderRadius: 18,
              borderWidth: 1.5,
              backgroundColor: optionSelected 
                ? (variant === 'danger' ? 'rgba(239,68,68,0.18)' : 'rgba(34,211,238,0.18)') 
                : 'rgba(255,255,255,0.06)',
              borderColor: optionSelected 
                ? (variant === 'danger' ? '#ef4444' : '#22d3ee')
                : 'rgba(255,255,255,0.18)',
              ...(optionSelected && {
                shadowColor: variant === 'danger' ? '#ef4444' : '#22d3ee',
                shadowOpacity: 0.25,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 6 },
              })
            }}
          >
            <Text style={{
              fontSize: 17,
              fontWeight: optionSelected ? '700' : '600',
              color: optionSelected ? '#FFFFFF' : 'rgba(255,255,255,0.92)'
            }}>
              {option}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}