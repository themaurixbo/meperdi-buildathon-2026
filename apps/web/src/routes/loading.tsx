import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Loader2, Wallet, QrCode, MapPin, Link, Shield, Globe, Zap, CheckCircle, Sparkles } from 'lucide-react'
import { Screen } from '../components/ui/Screen'

const TRACKS = [
  { name: 'EAG Global', subtitle: 'Real-World Ethereum Apps', icon: Globe, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { name: 'HSK Chain', subtitle: 'Payment & Stablecoins', icon: Zap, color: 'text-violet-500', bg: 'bg-violet-500/10' },
  { name: 'Bolivia Hackathon', subtitle: 'Track base', icon: Shield, color: 'text-amber-500', bg: 'bg-amber-500/10' },
]

const STEPS = [
  { id: 'wallet', label: 'Creando wallet del usuario', icon: Wallet, detail: 'Genera claves seguras (Web Crypto API)' },
  { id: 'qr', label: 'Preparando token QR', icon: QrCode, detail: 'Codifica caseId + firma en QR vCard' },
  { id: 'chain', label: 'Conectando a HSK testnet', icon: Link, detail: 'RPC https://testnet.hsk.xyz (chainId 133)' },
  { id: 'location', label: 'Activando rastreo GPS', icon: MapPin, detail: 'Geolocation API + watchPosition' },
  { id: 'sync', label: 'Sincronizando estado', icon: Loader2, detail: 'TanStack Query + WebSocket fallback' },
]

export const Route = createFileRoute('/loading')({
  component: LoadingScreen,
})

function LoadingScreen() {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [showTracks, setShowTracks] = useState(true)
  const [tracksDone, setTracksDone] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Show tracks first
    const tracksTimer = setTimeout(() => {
      setTracksDone(true)
      setShowTracks(false)
      setTimeout(() => setCurrentStep(0), 300)
    }, 2500)

    // Step progression
    const stepTimer = setInterval(() => {
      setCompletedSteps(prev => {
        const next = new Set(prev)
        next.add(currentStep)
        return next
      })

      if (currentStep < STEPS.length - 1) {
        setCurrentStep(c => c + 1)
      } else {
        setReady(true)
        clearInterval(stepTimer)
      }
    }, 1200)

    return () => {
      clearTimeout(tracksTimer)
      clearInterval(stepTimer)
    }
  }, [currentStep])

  if (ready) {
    return null // Parent will handle navigation
  }

  return (
    <Screen className="min-h-svh flex flex-col items-center justify-center bg-gradient-to-br from-night/95 via-night to-violet-950/50 px-4">
      {showTracks && !tracksDone && (
        <div className="w-full max-w-2xl animate-fade-in">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 mb-6">
              <Sparkles className="text-emerald-400 text-3xl" aria-hidden="true" />
              <span className="text-xl font-bold text-ink">ME PERDÍ — Buildathon 2026</span>
            </div>
            <p className="text-muted text-sm">Inicializando capas de la aplicación…</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {TRACKS.map((track, i) => (
              <div
                key={track.name}
                className={`relative overflow-hidden rounded-2xl border transition-all duration-500 ${track.bg} ${
                  i === 0 ? 'border-emerald-500/30' : i === 1 ? 'border-violet-500/30' : 'border-amber-500/30'
                }`}
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent" />
                <div className="relative p-5 text-center">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl mb-3 ${track.color} bg-current/10`}>
                    <track.icon size={28} aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold text-ink">{track.name}</h3>
                  <p className="text-xs text-muted mt-1">{track.subtitle}</p>
                  <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-current/30 rounded-full animate-pulse"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!showTracks && !ready && (
        <div className="w-full max-w-xl animate-slide-up">
          <div className="text-center mb-8">
            <Loader2 className="mx-auto text-violet-400 animate-spin text-5xl mb-4" aria-hidden="true" />
            <h2 className="text-2xl font-bold text-ink">Preparando tu sesión</h2>
            <p className="text-muted mt-2">{STEPS[currentStep].label}</p>
            <p className="text-xs text-muted/60 mt-1">{STEPS[currentStep].detail}</p>
          </div>

          <div className="space-y-3" role="list" aria-label="Pasos de inicialización">
            {STEPS.map((step, i) => {
              const isDone = completedSteps.has(i)
              const isCurrent = i === currentStep && !ready
              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-300 ${
                    isDone
                      ? 'bg-emerald-500/10 border border-emerald-500/30'
                      : isCurrent
                      ? 'bg-violet-500/10 border border-violet-500/30 animate-pulse'
                      : 'bg-white/5 border border-white/10'
                  }`}
                  role="listitem"
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                    isDone ? 'bg-emerald-500 text-white' : isCurrent ? 'bg-violet-500 text-white animate-spin' : 'bg-white/10 text-muted'
                  }`}>
                    {isDone ? (
                      <CheckCircle size={20} aria-hidden="true" />
                    ) : (
                      <step.icon size={20} aria-hidden="true" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${isDone || isCurrent ? 'text-ink' : 'text-muted'}`}>
                      {step.label}
                    </p>
                    <p className="text-xs text-muted/70 truncate">{step.detail}</p>
                  </div>
                  {isDone && (
                    <CheckCircle className="text-emerald-500 text-xl flex-shrink-0" aria-hidden="true" />
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-8 h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 via-emerald-500 to-amber-500 rounded-full animate-loading"
              style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            />
          </div>
          <p className="text-xs text-muted/50 text-center mt-2">
            {Math.round(((currentStep + 1) / STEPS.length) * 100)}% completado
          </p>
        </div>
      )}
    </Screen>
  )
}