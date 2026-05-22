'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useFormContext } from '@/lib/form-context'
import { Button } from '@/components/ui/Button'

export function Step1Consent() {
  const t = useTranslations('step1')
  const tc = useTranslations('common')
  const { nextStep, setConsent } = useFormContext()
  const [checked, setChecked] = useState(false)

  function handleCheck(e: React.ChangeEvent<HTMLInputElement>) {
    setChecked(e.target.checked)
    setConsent(e.target.checked)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-cseri-navy">{t('title')}</h2>
        <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
      </div>
      <div className="bg-blue-50 border border-cseri-blue/20 rounded-lg p-4 text-sm text-gray-700 leading-relaxed">
        {t('body')}
      </div>
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={handleCheck}
          className="mt-0.5 w-4 h-4 accent-cseri-orange"
        />
        <span className="text-sm text-gray-700">{t('checkboxLabel')}</span>
      </label>
      <div className="flex justify-end">
        <Button onClick={nextStep} disabled={!checked}>
          {tc('next')}
        </Button>
      </div>
    </div>
  )
}
