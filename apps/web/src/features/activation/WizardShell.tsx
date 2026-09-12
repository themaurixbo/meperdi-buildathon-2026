import type { ReactNode } from 'react'
import { ACTIVATION_STEPS, stepIndex, type ActivationStep } from './steps'
import { Button } from '../../components/ui/Button'
import { ScreenHeader } from '../../components/ui/Screen'

interface WizardShellProps {
  step: ActivationStep
  title: string
  onBack?: () => void
  onNext?: () => void
  nextLabel?: string
  nextDisabled?: boolean
  nextLoading?: boolean
  hideFooter?: boolean
  children: ReactNode
}

/** Progreso + navegación compartida por O02–O11: una decisión principal por paso. */
export function WizardShell({
  step,
  title,
  onBack,
  onNext,
  nextLabel = 'Continuar',
  nextDisabled,
  nextLoading,
  hideFooter,
  children,
}: WizardShellProps) {
  const total = ACTIVATION_STEPS.length - 1 // "success" no cuenta como paso del progreso
  const index = stepIndex(step)

  return (
    <div className="flex min-h-svh flex-col px-5 pb-8 pt-6">
      <ScreenHeader title={title} onBack={onBack} showBack={Boolean(onBack)} />
      {step !== 'success' && (
        <div className="mb-6 h-1.5 w-full overflow-hidden rounded-pill bg-night/10">
          <div
            className="h-full rounded-pill bg-violet transition-[width] duration-300"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
      )}

      <div className="flex-1">{children}</div>

      {!hideFooter && onNext && (
        <Button className="mt-6 w-full" onClick={onNext} disabled={nextDisabled} loading={nextLoading}>
          {nextLabel}
        </Button>
      )}
    </div>
  )
}
