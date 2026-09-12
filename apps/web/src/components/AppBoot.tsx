import { useEffect, useState, type ReactNode } from 'react'
import { SplashScreen } from './SplashScreen'

const MIN_SPLASH_MS = 500
const MAX_SPLASH_MS = 1200

/** Orquesta el arranque: MSW listo + mínimo/máximo de splash — A01, tope 1.2s. */
export function AppBoot({ ready, children }: { ready: Promise<void>; children: ReactNode }) {
  const [booted, setBooted] = useState(false)

  useEffect(() => {
    let cancelled = false
    const minDelay = new Promise((resolve) => setTimeout(resolve, MIN_SPLASH_MS))
    const maxDelay = new Promise((resolve) => setTimeout(resolve, MAX_SPLASH_MS))

    Promise.race([Promise.all([ready, minDelay]), maxDelay]).then(() => {
      if (!cancelled) setBooted(true)
    })

    return () => {
      cancelled = true
    }
  }, [ready])

  if (!booted) return <SplashScreen />
  return <>{children}</>
}
