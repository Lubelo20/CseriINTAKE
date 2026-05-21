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
  setChallenge: (data: Step4Data) => void
  referenceNo: string
}

const FormContext = createContext<FormContextValue | null>(null)

export function useFormContext() {
  const ctx = useContext(FormContext)
  if (!ctx) throw new Error('useFormContext must be used within FormProvider')
  return ctx
}

function generateReference() {
  const year = new Date().getFullYear()
  const seq = String(Math.floor(Math.random() * 99999) + 1).padStart(5, '0')
  return `CSERI-${year}-${seq}`
}

export function FormProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({ popia_consent: false })
  const [referenceNo] = useState(generateReference)

  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, 5))
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 1))
  const setConsent = (value: boolean) => setFormData((d) => ({ ...d, popia_consent: value }))
  const setRole = (role: Role) => setFormData((d) => ({ ...d, role }))
  const setContact = (contact: Step3Data) => setFormData((d) => ({ ...d, contact }))
  const setChallenge = (challenge: Step4Data) => setFormData((d) => ({ ...d, challenge }))

  return (
    <FormContext.Provider value={{ currentStep, formData, nextStep, prevStep, setConsent, setRole, setContact, setChallenge, referenceNo }}>
      {children}
    </FormContext.Provider>
  )
}
