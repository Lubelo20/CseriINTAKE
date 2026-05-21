'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/navigation'
import { LOCALES } from '@/lib/constants'

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    router.replace(pathname, { locale: e.target.value })
  }

  return (
    <select
      value={locale}
      onChange={handleChange}
      className="text-sm border border-white/30 bg-white/10 text-white rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-white"
      aria-label="Select language"
    >
      {LOCALES.map(({ code, name }) => (
        <option key={code} value={code} className="text-gray-900">
          {name}
        </option>
      ))}
    </select>
  )
}
