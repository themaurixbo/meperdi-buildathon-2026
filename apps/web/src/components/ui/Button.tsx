import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '../../lib/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'default' | 'compact'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  asChild?: boolean
  leadingIcon?: ReactNode
  loading?: boolean
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-violet text-white shadow-[0_10px_30px_-10px_rgba(124,58,237,0.45)] hover:brightness-110 active:brightness-95',
  secondary: 'bg-white text-ink border-2 border-night/10 hover:border-violet/40',
  ghost: 'bg-transparent text-ink hover:bg-night/5',
  danger: 'bg-danger text-white hover:brightness-110',
}

/**
 * Botón base — 54px de alto, radio 18px, un peso 800, sección 3.3.
 * Una sola acción primaria por pantalla: usa `variant="secondary"`/`"ghost"` para lo demás.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'default', asChild, leadingIcon, loading, disabled, children, ...props },
  ref,
) {
  const sharedClassName = cn(
    'inline-flex select-none items-center justify-center gap-2 rounded-button text-[17px] font-extrabold leading-none transition-[filter,transform] duration-[180ms] disabled:cursor-not-allowed disabled:opacity-50',
    size === 'default' ? 'h-[54px] min-w-[54px] px-6' : 'h-12 min-w-12 px-4 text-[15px]',
    VARIANT_CLASSES[variant],
    className,
  )

  // Radix Slot exige un único hijo React: cuando asChild está activo, el ícono/spinner
  // debe vivir dentro de ese hijo (ej. <Link><Icon/> Texto</Link>), no como hermano.
  if (asChild) {
    return (
      <Slot ref={ref} className={sharedClassName} {...props}>
        {children}
      </Slot>
    )
  }

  return (
    <button
      ref={ref}
      className={sharedClassName}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <span
          className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      ) : (
        leadingIcon
      )}
      {children}
    </button>
  )
})
