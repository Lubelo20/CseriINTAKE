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
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6 text-center">
          <p className="text-sm text-gray-500">
            Durban University of Technology — Centre for Social Entrepreneurship
          </p>
        </div>
        <FormWizard />
        <p className="text-center text-xs text-gray-400 mt-4">
          Built by Lubelo Tech Solutions
        </p>
      </div>
    </FormProvider>
  )
}
