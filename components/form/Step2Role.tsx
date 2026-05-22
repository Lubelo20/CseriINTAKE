'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useFormContext } from '@/lib/form-context'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { Role } from '@/lib/constants'

const ROLES: Role[] = ['community_member', 'business_owner', 'cseri_rep']

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
        <h2 className="text-xl font-bold text-cseri-navy">{t('title')}</h2>
        <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
      </div>

      <div className="space-y-3">
        {ROLES.map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => handleSelect(role)}
            className={cn(
              'w-full text-left rounded-lg border-2 px-5 py-4 transition-all',
              selected === role
                ? 'border-cseri-orange bg-orange-50 text-cseri-navy font-semibold'
                : 'border-gray-200 hover:border-cseri-blue hover:bg-blue-50',
            )}
          >
            {t(role)}
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
