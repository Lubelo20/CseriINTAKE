import Image from 'next/image'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { LanguageSwitcher } from './ui/LanguageSwitcher'

export function Navbar() {
  const t = useTranslations('nav')

  return (
    <nav className="bg-cseri-dark text-white border-b-4 border-cseri-green">
      <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between">
        <Image
          src="/logo.png"
          alt="CSERI — Durban University of Technology"
          width={220}
          height={64}
          priority
          className="h-12 w-auto object-contain"
        />
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Link
            href="/admin/login"
            className="text-xs text-gray-300 hover:text-white transition-colors"
          >
            {t('admin')}
          </Link>
        </div>
      </div>
    </nav>
  )
}
