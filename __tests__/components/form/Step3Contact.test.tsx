import { render, screen, fireEvent } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { FormProvider } from '@/lib/form-context'
import { Step3Contact } from '@/components/form/Step3Contact'
import en from '@/messages/en.json'

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider locale="en" messages={en}>
      <FormProvider>{children}</FormProvider>
    </NextIntlClientProvider>
  )
}

describe('Step3Contact', () => {
  it('renders the full name field', () => {
    render(<Step3Contact />, { wrapper: Wrapper })
    expect(screen.getByLabelText(new RegExp(en.step3.fullName, 'i'))).toBeInTheDocument()
  })

  it('shows error if Next clicked without full name', async () => {
    render(<Step3Contact />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('button', { name: en.common.next }))
    expect(await screen.findByText(en.step3.fullNameError)).toBeInTheDocument()
  })
})
