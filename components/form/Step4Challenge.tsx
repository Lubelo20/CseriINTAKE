'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { z } from 'zod'
import { useFormContext } from '@/lib/form-context'
import { step4Schema, type Step4Data } from '@/lib/schemas'
import { CATEGORIES, PROVINCES, URGENCY_LEVELS } from '@/lib/constants'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'

type Step4Input = z.input<typeof step4Schema>

export function Step4Challenge() {
  const t = useTranslations('step4')
  const tc = useTranslations('common')
  const tCat = useTranslations('categories')
  const tProv = useTranslations('provinces')
  const tUrg = useTranslations('urgency')
  const { nextStep, prevStep, setChallenge, formData } = useFormContext()

  const { register, handleSubmit, formState: { errors } } = useForm<Step4Input>({
    resolver: zodResolver(step4Schema),
    defaultValues: formData.challenge
      ? {
          challenge_title: formData.challenge.challenge_title,
          challenge_description: formData.challenge.challenge_description,
          category: formData.challenge.category,
          province: formData.challenge.province,
          urgency: formData.challenge.urgency,
          proposed_solution: formData.challenge.proposed_solution ?? '',
          background_info: formData.challenge.background_info ?? '',
          suits_intl_students: formData.challenge.suits_intl_students,
        }
      : {
          challenge_title: '',
          challenge_description: '',
          category: undefined,
          province: undefined,
          urgency: undefined,
          proposed_solution: '',
          background_info: '',
          suits_intl_students: false,
        },
  })

  function onSubmit(data: Step4Input) {
    setChallenge(data as Step4Data)
    nextStep()
  }

  const categoryOptions = CATEGORIES.map((c) => ({ value: c, label: tCat(c) }))
  const provinceOptions = PROVINCES.map((p) => ({ value: p, label: tProv(p) }))
  const urgencyOptions = URGENCY_LEVELS.map((u) => ({ value: u, label: tUrg(u) }))

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-cseri-navy">{t('title')}</h2>
        <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
      </div>

      <div className="space-y-4">
        <Input
          label={t('challengeTitle')}
          error={errors.challenge_title?.message}
          {...register('challenge_title')}
        />
        <Textarea
          label={t('challengeDescription')}
          hint={t('challengeDescriptionHint')}
          error={errors.challenge_description?.message}
          {...register('challenge_description')}
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label={t('category')}
            placeholder={t('selectCategory')}
            options={categoryOptions}
            error={errors.category?.message}
            {...register('category')}
          />
          <Select
            label={t('province')}
            placeholder={t('selectProvince')}
            options={provinceOptions}
            error={errors.province?.message}
            {...register('province')}
          />
          <Select
            label={t('urgency')}
            placeholder={t('selectUrgency')}
            options={urgencyOptions}
            error={errors.urgency?.message}
            {...register('urgency')}
          />
        </div>
        <Textarea
          label={t('proposedSolution')}
          {...register('proposed_solution')}
        />
        <Textarea
          label={t('backgroundInfo')}
          {...register('background_info')}
        />
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" className="w-4 h-4 accent-cseri-orange" {...register('suits_intl_students')} />
          <span className="text-sm text-gray-700">{t('suitsIntlStudents')}</span>
        </label>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={prevStep}>{tc('back')}</Button>
        <Button type="submit">{tc('next')}</Button>
      </div>
    </form>
  )
}
