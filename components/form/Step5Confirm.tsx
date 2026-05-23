'use client'

import { useTranslations } from 'next-intl'
import { useFormContext } from '@/lib/form-context'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

const URGENCY_BADGE: Record<string, 'red' | 'orange' | 'blue' | 'gray'> = {
  critical: 'red',
  high: 'orange',
  medium: 'blue',
  low: 'gray',
}

export function Step5Confirm() {
  const t = useTranslations('step5')
  const { formData, referenceNo } = useFormContext()

  function handleReset() {
    window.location.reload()
  }

  return (
    <div className="space-y-6 text-center">
      <div className="w-16 h-16 bg-cseri-green rounded-full flex items-center justify-center mx-auto">
        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-cseri-dark">{t('title')}</h2>
        <p className="text-gray-500 mt-1">{t('subtitle')}</p>
      </div>

      <div className="bg-cseri-dark text-white rounded-xl p-6">
        <p className="text-sm text-blue-200 mb-1">{t('referenceLabel')}</p>
        <p className="text-3xl font-bold tracking-wider">{referenceNo}</p>
      </div>

      {formData.challenge && (
        <div className="bg-gray-50 rounded-lg p-4 text-left space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="navy">{formData.challenge.category.charAt(0).toUpperCase() + formData.challenge.category.slice(1)}</Badge>
            <Badge variant="navy">{formData.challenge.province.toUpperCase()}</Badge>
            <Badge variant={URGENCY_BADGE[formData.challenge.urgency] ?? 'gray'}>
              {formData.challenge.urgency.charAt(0).toUpperCase() + formData.challenge.urgency.slice(1)}
            </Badge>
          </div>
          <p className="text-sm font-semibold text-gray-800">{formData.challenge.challenge_title}</p>
          <p className="text-sm text-gray-600 line-clamp-3">{formData.challenge.challenge_description}</p>
        </div>
      )}

      <div className="bg-orange-50 border border-cseri-orange/20 rounded-lg p-4 text-left space-y-2">
        <h3 className="font-semibold text-cseri-dark text-sm">{t('summaryTitle')}</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• {t('next1')}</li>
          <li>• {t('next2')}</li>
          <li>• {t('next3')}</li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {referenceNo ? (
          <a
            href={`/api/pdf/${referenceNo}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 border-2 border-cseri-dark text-cseri-dark px-4 py-3 rounded-md text-sm font-semibold hover:bg-cseri-dark hover:text-white transition-colors min-h-[44px] w-full sm:w-auto"
          >
            {t('downloadPdf')}
          </a>
        ) : (
          <Button variant="outline" disabled title={t('pdfNote')}>
            {t('downloadPdf')}
          </Button>
        )}
        <Button onClick={handleReset} variant="secondary">
          {t('newSubmission')}
        </Button>
      </div>
    </div>
  )
}
