'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useFormContext } from '@/lib/form-context'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { Role } from '@/lib/constants'

const ROLES: { value: Role; icon: string; description: string }[] = [
  {
    value: 'community_member',
    icon: '👥',
    description: 'I live in a community and want to report a challenge affecting residents',
  },
  {
    value: 'business_owner',
    icon: '🏢',
    description: 'I run a small or medium business facing a specific operational challenge',
  },
  {
    value: 'cseri_rep',
    icon: '🎓',
    description: 'I am submitting on behalf of CSERI or the Durban University of Technology',
  },
]

export function Step2Role() {
  const t = useTranslations('step2')
  const tc = useTranslations('common')
  const { nextStep, prevStep, setRole } = useFormContext()
  const [selected, setSelected] = useState<Role | null>(null)

  function handleSelect(role: Role) {
    setSelected(role)
    setRole(role)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-cseri-dark">{t('title')}</h2>
        <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
      </div>

      <div className="space-y-3">
        {ROLES.map(({ value, icon, description }) => (
          <button
            key={value}
            type="button"
            onClick={() => handleSelect(value)}
            className={cn(
              'w-full text-left rounded-xl border-2 px-5 py-4 transition-all flex items-start gap-4',
              selected === value
                ? 'border-cseri-green bg-green-50 shadow-sm'
                : 'border-gray-200 hover:border-cseri-green/50 hover:bg-gray-50',
            )}
          >
            <span className="text-2xl mt-0.5 shrink-0">{icon}</span>
            <div>
              <p className={cn(
                'font-semibold text-sm',
                selected === value ? 'text-cseri-dark' : 'text-gray-700',
              )}>
                {t(value)}
              </p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{description}</p>
            </div>
            <div className={cn(
              'ml-auto shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5',
              selected === value ? 'border-cseri-green bg-cseri-green' : 'border-gray-300',
            )}>
              {selected === value && <span className="text-white text-xs font-bold">✓</span>}
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>{tc('back')}</Button>
        <Button onClick={nextStep} disabled={!selected}>{tc('next')}</Button>
      </div>
    </div>
  )
}
