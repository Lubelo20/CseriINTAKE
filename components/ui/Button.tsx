import { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'outline'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

export function Button({ variant = 'primary', className, children, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center px-6 py-3 rounded-md font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]'
  const variants: Record<Variant, string> = {
    primary: 'bg-cseri-orange text-white hover:bg-orange-600 focus:ring-cseri-orange',
    secondary: 'bg-cseri-dark text-white hover:opacity-90 focus:ring-cseri-dark',
    outline: 'border-2 border-cseri-dark text-cseri-dark hover:bg-cseri-dark hover:text-white focus:ring-cseri-dark',
  }
  return (
    <button className={cn(base, variants[variant], className)} {...props}>
      {children}
    </button>
  )
}
