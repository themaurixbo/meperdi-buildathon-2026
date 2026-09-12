import * as SwitchPrimitive from '@radix-ui/react-switch'
import { cn } from '../../lib/cn'

export function Switch({
  checked,
  onCheckedChange,
  label,
}: {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label: string
}) {
  return (
    <SwitchPrimitive.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      aria-label={label}
      className={cn(
        'relative h-7 w-12 shrink-0 rounded-pill bg-night/15 outline-none transition-colors data-[state=checked]:bg-violet',
      )}
    >
      <SwitchPrimitive.Thumb className="block h-5 w-5 translate-x-1 rounded-pill bg-white shadow-card transition-transform data-[state=checked]:translate-x-6" />
    </SwitchPrimitive.Root>
  )
}
