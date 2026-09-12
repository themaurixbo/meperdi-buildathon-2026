import { forwardRef, useId } from 'react'
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

interface FieldWrapperProps {
  label: string
  hint?: string
  error?: string
  trailing?: ReactNode
}

const fieldClasses =
  'h-[54px] w-full rounded-field border-2 border-night/10 bg-white px-4 text-[17px] text-ink placeholder:text-muted focus:border-violet focus:outline-none'

export const TextField = forwardRef<HTMLInputElement, FieldWrapperProps & InputHTMLAttributes<HTMLInputElement>>(
  function TextField({ label, hint, error, trailing, id, className, ...props }, ref) {
    const generatedId = useId()
    const inputId = id ?? generatedId
    const hintId = hint ? `${inputId}-hint` : undefined
    const errorId = error ? `${inputId}-error` : undefined

    return (
      <div className="text-left">
        <label htmlFor={inputId} className="mb-1.5 block text-[15px] font-semibold text-ink">
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={cn(fieldClasses, error && 'border-danger', trailing && 'pr-12', className)}
            aria-describedby={cn(hintId, errorId) || undefined}
            aria-invalid={Boolean(error)}
            {...props}
          />
          {trailing && <div className="absolute inset-y-0 right-3 flex items-center">{trailing}</div>}
        </div>
        {hint && !error && (
          <p id={hintId} className="mt-1.5 text-[15px] text-muted">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} role="alert" className="mt-1.5 text-[15px] font-semibold text-danger">
            {error}
          </p>
        )}
      </div>
    )
  },
)

export const TextAreaField = forwardRef<
  HTMLTextAreaElement,
  FieldWrapperProps & TextareaHTMLAttributes<HTMLTextAreaElement>
>(function TextAreaField({ label, hint, error, id, className, ...props }, ref) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const hintId = hint ? `${inputId}-hint` : undefined
  const errorId = error ? `${inputId}-error` : undefined

  return (
    <div className="text-left">
      <label htmlFor={inputId} className="mb-1.5 block text-[15px] font-semibold text-ink">
        {label}
      </label>
      <textarea
        ref={ref}
        id={inputId}
        className={cn(
          'min-h-[120px] w-full rounded-field border-2 border-night/10 bg-white p-4 text-[17px] text-ink placeholder:text-muted focus:border-violet focus:outline-none',
          error && 'border-danger',
          className,
        )}
        aria-describedby={cn(hintId, errorId) || undefined}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-[15px] text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-[15px] font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  )
})
