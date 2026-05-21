import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { LanguageSwitcher } from './ui/LanguageSwitcher'

export function Navbar() {
  const t = useTranslations('nav')

  return (
    <nav className="bg-cseri-navy text-white">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-cseri-orange rounded-full flex items-center justify-center font-bold text-sm">
            C
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">CSERI</p>
            <p className="text-xs text-blue-200 leading-tight">Community Intake</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Link
            href="/admin/login"
            className="text-xs text-blue-200 hover:text-white transition-colors"
          >
            {t('admin')}
          </Link>
        </div>
      </div>
    </nav>
  )
}
