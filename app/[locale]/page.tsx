import { FormProvider } from '@/lib/form-context'
import { FormWizard } from '@/components/form/FormWizard'

export default async function IntakePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <FormProvider locale={locale}>
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">

        {/* Hero intro */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-cseri-dark mb-2">
            Share Your Community Challenge
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-lg mx-auto">
            Tell us about a challenge your community or business is facing.
            CSERI will review your submission and match it with student research
            projects at the Durban University of Technology.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="w-4 h-4 rounded-full bg-cseri-green/20 text-cseri-green flex items-center justify-center text-xs font-bold">✓</span>
              Free to submit
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="w-4 h-4 rounded-full bg-cseri-green/20 text-cseri-green flex items-center justify-center text-xs font-bold">✓</span>
              POPIA compliant
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="w-4 h-4 rounded-full bg-cseri-green/20 text-cseri-green flex items-center justify-center text-xs font-bold">✓</span>
              All 11 SA languages
            </div>
          </div>
        </div>

        <FormWizard />

        <p className="text-center text-xs text-gray-400 mt-6">
          Built by <a href="mailto:lubelotechsolutions@gmail.com" className="hover:text-cseri-dark transition-colors">Lubelo Tech Solutions</a>
        </p>
      </div>
    </FormProvider>
  )
}
