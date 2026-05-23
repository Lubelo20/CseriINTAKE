import Image from 'next/image'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { LanguageSwitcher } from './ui/LanguageSwitcher'

export function Navbar() {
  const t = useTranslations('nav')

  return (
    <nav className="bg-cseri-dark text-white border-b-4 border-cseri-green">
      <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
        <Image
          src="/logo.png"
          alt="CSERI — Durban University of Technology"
          width={220}
          height={64}
          priority
          className="h-10 sm:h-12 w-auto object-contain shrink-0"
        />
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link
            href="/admin/login"
            className="text-xs text-gray-300 hover:text-white transition-colors whitespace-nowrap"
          >
            {t('admin')}
          </Link>
        </div>
      </div>
    </nav>
  )
}
