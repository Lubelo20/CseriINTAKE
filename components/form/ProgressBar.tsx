import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

interface ProgressBarProps {
  currentStep: number
  totalSteps?: number
}

export function ProgressBar({ currentStep, totalSteps = 5 }: ProgressBarProps) {
  const t = useTranslations('steps')
  const stepKeys = ['1', '2', '3', '4', '5'] as const

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        {stepKeys.map((key, idx) => {
          const step = idx + 1
          const isComplete = step < currentStep
          const isCurrent = step === currentStep
          return (
            <div key={key} className="flex flex-col items-center flex-1">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-1 transition-colors',
                isComplete && 'bg-cseri-orange text-white',
                isCurrent && 'bg-cseri-navy text-white ring-2 ring-cseri-orange ring-offset-2',
                !isComplete && !isCurrent && 'bg-gray-200 text-gray-500',
              )}>
                {isComplete ? '✓' : step}
              </div>
              <span className={cn(
                'text-xs text-center hidden sm:block',
                isCurrent ? 'text-cseri-navy font-semibold' : 'text-gray-400',
              )}>
                {t(key)}
              </span>
            </div>
          )
        })}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className="bg-cseri-orange h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />
      </div>
    </div>
  )
}
