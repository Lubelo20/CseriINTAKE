import { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'outline'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

export function Button({ variant = 'primary', className, children, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center px-6 py-2.5 rounded-md font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  const variants: Record<Variant, string> = {
    primary: 'bg-cseri-orange text-white hover:bg-orange-600 focus:ring-cseri-orange',
    secondary: 'bg-cseri-navy text-white hover:bg-blue-900 focus:ring-cseri-navy',
    outline: 'border-2 border-cseri-navy text-cseri-navy hover:bg-cseri-navy hover:text-white focus:ring-cseri-navy',
  }
  return (
    <button className={cn(base, variants[variant], className)} {...props}>
      {children}
    </button>
  )
}
