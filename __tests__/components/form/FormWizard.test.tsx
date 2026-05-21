import { render, screen, fireEvent } from '@testing-library/react'
import { FormProvider, useFormContext } from '@/lib/form-context'

function StepDisplay() {
  const { currentStep, nextStep, prevStep } = useFormContext()
  return (
    <div>
      <span data-testid="step">{currentStep}</span>
      <button onClick={nextStep}>Next</button>
      <button onClick={prevStep}>Back</button>
    </div>
  )
}

describe('FormContext', () => {
  it('starts at step 1', () => {
    render(<FormProvider><StepDisplay /></FormProvider>)
    expect(screen.getByTestId('step')).toHaveTextContent('1')
  })

  it('advances to step 2 on nextStep', () => {
    render(<FormProvider><StepDisplay /></FormProvider>)
    fireEvent.click(screen.getByText('Next'))
    expect(screen.getByTestId('step')).toHaveTextContent('2')
  })

  it('does not go below step 1 on prevStep', () => {
    render(<FormProvider><StepDisplay /></FormProvider>)
    fireEvent.click(screen.getByText('Back'))
    expect(screen.getByTestId('step')).toHaveTextContent('1')
  })
})
