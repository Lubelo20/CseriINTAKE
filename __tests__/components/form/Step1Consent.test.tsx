import { render, screen, fireEvent } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { FormProvider } from '@/lib/form-context'
import { Step1Consent } from '@/components/form/Step1Consent'
import en from '@/messages/en.json'

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider locale="en" messages={en}>
      <FormProvider>{children}</FormProvider>
    </NextIntlClientProvider>
  )
}

describe('Step1Consent', () => {
  it('renders the POPIA title', () => {
    render(<Step1Consent />, { wrapper: Wrapper })
    expect(screen.getByText(en.step1.title)).toBeInTheDocument()
  })

  it('renders the consent checkbox', () => {
    render(<Step1Consent />, { wrapper: Wrapper })
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('Next button is disabled without consent', () => {
    render(<Step1Consent />, { wrapper: Wrapper })
    expect(screen.getByRole('button', { name: en.common.next })).toBeDisabled()
  })

  it('Next button enables after checking consent', () => {
    render(<Step1Consent />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('checkbox'))
    expect(screen.getByRole('button', { name: en.common.next })).not.toBeDisabled()
  })
})
