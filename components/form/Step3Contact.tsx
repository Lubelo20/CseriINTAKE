'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useFormContext } from '@/lib/form-context'
import { step3Schema, type Step3Data } from '@/lib/schemas'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

type Step3Input = z.input<typeof step3Schema>

export function Step3Contact() {
  const t = useTranslations('step3')
  const tc = useTranslations('common')
  const { nextStep, prevStep, setContact, formData } = useFormContext()

  const { register, handleSubmit, formState: { errors } } = useForm<Step3Input>({
    resolver: zodResolver(step3Schema),
    defaultValues: formData.contact ?? { full_name: '', email: '', phone: '', organisation: '' },
  })

  function onSubmit(data: Step3Input) {
    setContact(data as Step3Data)
    nextStep()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-cseri-dark">{t('title')}</h2>
        <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
      </div>

      <div className="space-y-4">
        <Input
          label={t('fullName')}
          error={errors.full_name?.message}
          {...register('full_name')}
        />
        <Input
          label={`${t('email')} (optional)`}
          type="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label={`${t('phone')} (optional)`}
          type="tel"
          {...register('phone')}
        />
        <Input
          label={`${t('organisation')} (optional)`}
          {...register('organisation')}
        />
      </div>

      <p className="text-xs text-gray-400 italic">{tc('confidential')}</p>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={prevStep}>{tc('back')}</Button>
        <Button type="submit">{tc('next')}</Button>
      </div>
    </form>
  )
}
