'use client'

import { useState, useRef, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { routing, Locale } from '@/i18n/routing'
import styles from './LanguageSelector.module.css'

const LANG_FLAGS: Record<Locale, string> = {
  fr: '🇫🇷',
  en: '🇬🇧',
  es: '🇪🇸',
  pt: '🇵🇹',
  zh: '🇨🇳',
}

const LANG_LABELS: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
  es: 'Español',
  pt: 'Português',
  zh: '中文',
}

export function LanguageSelector() {
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const switchLocale = (next: Locale) => {
    setOpen(false)
    if (next === locale) return
    // Strip current locale prefix and replace with new one
    const withoutLocale = pathname.replace(/^\/(fr|en|es|pt|zh)/, '') || '/'
    router.push(`/${next}${withoutLocale}`)
  }

  return (
    <div className={styles.selector} ref={ref}>
      <button
        className={styles.trigger}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span aria-hidden>{LANG_FLAGS[locale]}</span>
        {locale.toUpperCase()}
        <svg
          className={`${styles.caret} ${open ? styles.open : ''}`}
          viewBox="0 0 10 10"
          fill="none"
          aria-hidden
        >
          <path
            d="M2 3.5l3 3 3-3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className={styles.dropdown} role="listbox">
          {routing.locales.map((l) => (
            <button
              key={l}
              className={`${styles.option} ${l === locale ? styles.active : ''}`}
              onClick={() => switchLocale(l)}
              role="option"
              aria-selected={l === locale}
            >
              <span aria-hidden>{LANG_FLAGS[l]}</span>
              {LANG_LABELS[l]}
              {l === locale && (
                <svg className={styles.check} viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path
                    d="M2.5 7l3.5 3.5 5.5-6"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
