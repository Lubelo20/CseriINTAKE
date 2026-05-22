'use client'

import { createContext, useContext, useState } from 'react'
import type { Role } from './constants'
import type { Step3Data, Step4Data } from './schemas'

export type FormData = {
  popia_consent: boolean
  role?: Role
  contact?: Step3Data
  challenge?: Step4Data
}

type FormContextValue = {
  currentStep: number
  formData: FormData
  nextStep: () => void
  prevStep: () => void
  setConsent: (value: boolean) => void
  setRole: (role: Role) => void
  setContact: (data: Step3Data) => void
  submitAndAdvance: (challenge: Step4Data) => Promise<void>
  referenceNo: string
  isSubmitting: boolean
  submissionError: string | null
}

const FormContext = createContext<FormContextValue | null>(null)

export function useFormContext() {
  const ctx = useContext(FormContext)
  if (!ctx) throw new Error('useFormContext must be used within FormProvider')
  return ctx
}

export function FormProvider({
  children,
  locale = 'en',
}: {
  children: React.ReactNode
  locale?: string
}) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({ popia_consent: false })
  const [referenceNo, setReferenceNo] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)

  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, 5))
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 1))
  const setConsent = (value: boolean) => setFormData((d) => ({ ...d, popia_consent: value }))
  const setRole = (role: Role) => setFormData((d) => ({ ...d, role }))
  const setContact = (contact: Step3Data) => setFormData((d) => ({ ...d, contact }))

  async function submitAndAdvance(challenge: Step4Data) {
    setFormData((d) => ({ ...d, challenge }))
    setIsSubmitting(true)
    setSubmissionError(null)

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: formData.role,
          contact: formData.contact,
          challenge,
          language_used: locale,
          popia_consent: true,
        }),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(json.error ?? 'Submission failed')
      }

      const json = await res.json() as { reference_no: string }
      setReferenceNo(json.reference_no)
      setCurrentStep(5)
    } catch (err) {
      setSubmissionError(
        err instanceof Error ? err.message : 'Submission failed. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <FormContext.Provider
      value={{
        currentStep, formData, nextStep, prevStep,
        setConsent, setRole, setContact,
        submitAndAdvance, referenceNo, isSubmitting, submissionError,
      }}
    >
      {children}
    </FormContext.Provider>
  )
}
