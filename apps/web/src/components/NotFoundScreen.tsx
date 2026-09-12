import { Link } from '@tanstack/react-router'
import { Compass } from 'lucide-react'
import { Screen } from './ui/Screen'
import { Button } from './ui/Button'

export function NotFoundScreen() {
  return (
    <Screen className="flex flex-col items-center justify-center gap-4 text-center">
      <Compass size={48} className="text-violet" aria-hidden="true" />
      <h1 className="text-[28px] font-extrabold text-ink">No encontramos esta página</h1>
      <p className="max-w-xs text-[17px] text-muted">
        Revisa el enlace o vuelve al inicio para seguir buscando lo que necesitas.
      </p>
      <Button asChild>
        <Link to="/">Ir al inicio</Link>
      </Button>
    </Screen>
  )
}
