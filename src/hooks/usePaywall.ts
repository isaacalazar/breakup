import { usePlacement } from 'expo-superwall'

type PresentArgs = {
  placement: string
  params?: Record<string, any>
  onAllowed?: () => void
}

export function usePaywall() {
  const { registerPlacement, state } = usePlacement({
    onError: (err) => console.warn('Paywall error:', err),
  })

  const present = async ({ placement, params, onAllowed }: PresentArgs) => {
    await registerPlacement({
      placement,
      params,
      feature: () => {
        onAllowed?.()
      },
    })
  }

  return { present, state }
}


