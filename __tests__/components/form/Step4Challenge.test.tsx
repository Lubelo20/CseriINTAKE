import { render, screen, fireEvent } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { FormProvider } from '@/lib/form-context'
import { Step4Challenge } from '@/components/form/Step4Challenge'
import en from '@/messages/en.json'

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider locale="en" messages={en}>
      <FormProvider>{children}</FormProvider>
    </NextIntlClientProvider>
  )
}

describe('Step4Challenge', () => {
  it('renders the challenge title field', () => {
    render(<Step4Challenge />, { wrapper: Wrapper })
    expect(screen.getByLabelText(new RegExp(en.step4.challengeTitle, 'i'))).toBeInTheDocument()
  })

  it('shows validation error for empty title on submit', async () => {
    render(<Step4Challenge />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('button', { name: en.common.next }))
    expect(await screen.findByText(en.step4.titleError)).toBeInTheDocument()
  })
})
