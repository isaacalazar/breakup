import { useRouter } from 'expo-router'
import { useEffect } from 'react'

export default function IndexRedirect() {
  const router = useRouter()
  useEffect(() => {
    const id = setTimeout(() => router.replace('/landing'), 0)
    return () => clearTimeout(id)
  }, [router])
  return null
}
