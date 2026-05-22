import { render, screen, fireEvent } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { FormProvider } from '@/lib/form-context'
import { Step2Role } from '@/components/form/Step2Role'
import en from '@/messages/en.json'

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider locale="en" messages={en}>
      <FormProvider>{children}</FormProvider>
    </NextIntlClientProvider>
  )
}

describe('Step2Role', () => {
  it('renders all three role options', () => {
    render(<Step2Role />, { wrapper: Wrapper })
    expect(screen.getByText(en.step2.community_member)).toBeInTheDocument()
    expect(screen.getByText(en.step2.business_owner)).toBeInTheDocument()
    expect(screen.getByText(en.step2.cseri_rep)).toBeInTheDocument()
  })

  it('Next button is disabled without selection', () => {
    render(<Step2Role />, { wrapper: Wrapper })
    expect(screen.getByRole('button', { name: en.common.next })).toBeDisabled()
  })

  it('Next button enables after selecting a role', () => {
    render(<Step2Role />, { wrapper: Wrapper })
    fireEvent.click(screen.getByText(en.step2.community_member))
    expect(screen.getByRole('button', { name: en.common.next })).not.toBeDisabled()
  })
})
