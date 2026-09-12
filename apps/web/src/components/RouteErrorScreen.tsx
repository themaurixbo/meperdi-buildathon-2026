import { AlertOctagon } from 'lucide-react'
import { Screen } from './ui/Screen'
import { Button } from './ui/Button'

export function RouteErrorScreen({ error, reset }: { error: unknown; reset?: () => void }) {
  const message = error instanceof Error ? error.message : 'Ocurrió un error inesperado.'

  return (
    <Screen className="flex flex-col items-center justify-center gap-4 text-center">
      <AlertOctagon size={48} className="text-danger" aria-hidden="true" />
      <h1 className="text-[28px] font-extrabold text-ink">Algo salió mal</h1>
      <p className="max-w-xs text-[17px] text-muted">{message}</p>
      {reset && (
        <Button variant="secondary" onClick={reset}>
          Reintentar
        </Button>
      )}
    </Screen>
  )
}
