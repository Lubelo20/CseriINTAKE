import { cn } from '@/lib/utils'

type BadgeVariant = 'navy' | 'orange' | 'blue' | 'red' | 'green' | 'gray'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

export function Badge({ children, variant = 'navy', className }: BadgeProps) {
  const variants: Record<BadgeVariant, string> = {
    navy: 'bg-cseri-navy text-white',
    orange: 'bg-cseri-orange text-white',
    blue: 'bg-cseri-blue text-white',
    red: 'bg-red-600 text-white',
    green: 'bg-green-600 text-white',
    gray: 'bg-gray-200 text-gray-700',
  }
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}
