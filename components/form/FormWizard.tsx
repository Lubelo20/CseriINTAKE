'use client'

import { useFormContext } from '@/lib/form-context'
import { ProgressBar } from './ProgressBar'
import { Step1Consent } from './Step1Consent'
import { Step2Role } from './Step2Role'
import { Step3Contact } from './Step3Contact'
import { Step4Challenge } from './Step4Challenge'
import { Step5Confirm } from './Step5Confirm'

const STEPS = [Step1Consent, Step2Role, Step3Contact, Step4Challenge, Step5Confirm]

export function FormWizard() {
  const { currentStep } = useFormContext()
  const StepComponent = STEPS[currentStep - 1]

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
      <div className="mb-8">
        <ProgressBar currentStep={currentStep} />
      </div>
      <StepComponent />
    </div>
  )
}
