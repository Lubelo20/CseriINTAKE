import { SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
  placeholder?: string
  options: { value: string; label: string }[]
}

export function Select({ label, error, placeholder, options, className, id, ...props }: SelectProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="space-y-1">
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
        {label}
        {props.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        id={inputId}
        className={cn(
          'w-full rounded-md border px-3 py-2 text-sm shadow-sm transition-colors bg-white',
          'focus:outline-none focus:ring-2 focus:ring-cseri-blue focus:border-cseri-blue',
          error ? 'border-red-500' : 'border-gray-300',
          className,
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
